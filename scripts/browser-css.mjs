import assert from 'node:assert/strict';
import {spawn, spawnSync} from 'node:child_process';
import {copyFileSync, mkdtempSync, writeFileSync} from 'node:fs';
import {rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export function browser() {
  const candidates = process.env.CHROME_BIN !== undefined ? [process.env.CHROME_BIN] : [
    'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ...['PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA'].filter(k => process.env[k])
      .map(k => join(process.env[k], 'Google/Chrome/Application/chrome.exe')),
  ];
  for (const command of candidates) {
    if (!command) continue;
    const result = spawnSync(command, ['--version'], {encoding:'utf8', timeout:10000});
    if (!result.error && result.status === 0 && /Chrome|Chromium/.test(result.stdout)) {
      return {command, version:result.stdout.trim()};
    }
  }
  throw new Error('Chrome/Chromium unavailable: install a browser or set CHROME_BIN to its executable (no skip/fallback for an invalid override).');
}

// Executed by Chrome, not by Node: exercise the stylesheet through DOM + CSSOM.
function consume(ids) {
  const rows = [];
  function scope(parent, theme) {
    const element = document.createElement('section');
    if (theme !== null) element.setAttribute('data-lp-theme', theme);
    parent.append(element);
    return element;
  }
  function sample(element, mode, label) {
    for (const id of ids) {
      const name = '--lp-' + id.replaceAll('.', '-');
      element.style.backgroundColor = `var(${name}, rgba(1, 2, 3, 0.5))`;
      const computed = getComputedStyle(element);
      rows.push({id, mode, label, value:computed.getPropertyValue(name).trim(),
        color:computed.backgroundColor,
        sentinel:computed.getPropertyValue('--lp-consumer-sentinel').trim(),
        external:computed.getPropertyValue('--external-sentinel').trim()});
    }
  }
  document.body.style.setProperty('--lp-consumer-sentinel', 'keep');
  document.body.style.setProperty('--external-sentinel', 'keep');
  sample(scope(document.body, null), null, 'unscoped');
  for (const mode of ['light', 'dark']) {
    const outer = scope(document.body, mode);
    sample(outer, mode, `${mode}/self`);
    sample(scope(outer, null), mode, `${mode}/inherited`);
    const opposite = mode === 'light' ? 'dark' : 'light';
    const nested = scope(outer, opposite);
    sample(nested, opposite, `${mode}/nested-${opposite}`);
    sample(scope(nested, null), opposite, `${mode}/nested-inherited`);
    for (const bad of ['system', '', 'drak', 'LIGHT']) {
      const invalid = scope(outer, bad);
      sample(invalid, null, `${mode}/invalid:${JSON.stringify(bad)}/self`);
      sample(scope(invalid, null), null, `${mode}/invalid:${JSON.stringify(bad)}/inherited`);
      for (const recovery of ['light', 'dark']) {
        const valid = scope(invalid, recovery);
        sample(valid, recovery, `${mode}/invalid:${JSON.stringify(bad)}/recover-${recovery}`);
        sample(scope(valid, null), recovery, `${mode}/invalid:${JSON.stringify(bad)}/recover-${recovery}-inherited`);
      }
    }
  }
  return {rows, ruleCount:document.styleSheets[0].cssRules.length};
}

export async function measureCSS(cssPath, ids) {
  const chrome = browser();
  const dir = mkdtempSync(join(tmpdir(), 'tokens-browser-'));
  try {
    // Copy exact delivered bytes; mutations, when requested by a test, live outside dist.
    copyFileSync(cssPath, join(dir, 'colors.css'));
    console.log(chrome.version);
    const html = '<!doctype html><link rel="stylesheet" href="colors.css"><body><pre id="result"></pre><script>' +
      `try { const data = (${consume.toString()})(${JSON.stringify(ids)}); document.querySelector('#result').textContent = btoa(JSON.stringify(data)); }` +
      `catch (error) { document.querySelector('#result').textContent = btoa(JSON.stringify({error:String(error)})); }` + '</script>';
    writeFileSync(join(dir, 'index.html'), html);
    // Some desktop Chrome builds linger after dumping the complete DOM. Stop only
    // this isolated child once the result is complete; timeouts remain hard failures.
    const stdout = await new Promise((resolveOutput, reject) => {
      const child = spawn(chrome.command, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
        '--disable-background-networking', '--disable-extensions', '--allow-file-access-from-files',
        `--user-data-dir=${join(dir, 'profile')}`, '--dump-dom', pathToFileURL(join(dir, 'index.html')).href],
        {stdio:['ignore', 'pipe', 'pipe']});
      let output = '', errors = '', complete = false, timedOut = false;
      const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, 60000);
      child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
      child.stdout.on('data', chunk => {
        output += chunk;
        if (output.includes('</html>')) { complete = true; child.kill('SIGTERM'); }
      });
      child.stderr.on('data', chunk => { errors += chunk; });
      child.on('error', error => { clearTimeout(timer); reject(error); });
      child.on('exit', (code, signal) => {
        clearTimeout(timer);
        child.stdout.destroy(); child.stderr.destroy();
        if (!timedOut && complete && (code === 0 || signal === 'SIGTERM')) resolveOutput(output);
        else reject(new Error(`browser failed: exit=${code} signal=${signal} timeout=${timedOut} ${errors}`));
      });
    });
    const match = stdout.match(/<pre id="result">([A-Za-z0-9+/=]+)<\/pre>/);
    assert.ok(match, 'browser produced no result');
    const data = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
    assert.equal(data.error, undefined, data.error);
    assert.ok(data.ruleCount > 0, 'delivered stylesheet must parse as CSSOM rules');
    return data;
  } finally {
    // The main child's exit (or pipe close) does not guarantee that Chrome's
    // profile writers have stopped. Retry only this mkdtemp-owned tree using
    // Node's bounded transient-error policy; exhausted/permanent errors reject.
    await rm(dir, {recursive:true, force:true, maxRetries:5, retryDelay:100});
  }
}

function rgba(serialized) {
  const match = serialized.match(/^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/);
  assert.ok(match, `unexpected browser computed sRGB serialization: ${serialized}`);
  return {r:Number(match[1]), g:Number(match[2]), b:Number(match[3]), a:match[4] === undefined ? 1 : Number(match[4])};
}

export function assertCSSParity(data, resolved) {
  const ids = Object.keys(resolved.colors);
  assert.equal(data.rows.length, ids.length * 57, 'all fixture scopes and tokens must execute');
  for (const row of data.rows) {
    const label = `${row.label}/${row.id}`;
    assert.equal(row.sentinel, 'keep', `${label}: foreign --lp-* preserved`);
    assert.equal(row.external, 'keep', `${label}: foreign properties preserved`);
    if (row.mode === null) {
      assert.equal(row.value, '', `${label}: explicit unknown/unscoped must not inherit token`);
      assert.deepEqual(rgba(row.color), {r:1, g:2, b:3, a:0.5}, `${label}: consumer fallback`);
    } else {
      assert.notEqual(row.value, '', `${label}: token must exist`);
      assert.deepEqual(rgba(row.color), resolved.colors[row.id][row.mode], `${label}: computed RGBA`);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(browser().version);
}
