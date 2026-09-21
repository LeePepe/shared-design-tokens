import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolveSource} from '../scripts/source.mjs';
import {measureCSS, assertCSSParity} from '../scripts/browser-css.mjs';
const resolved = resolveSource(JSON.parse(readFileSync(new URL('../tokens/colors.json', import.meta.url))));
const cssPath = new URL('../dist/colors.css', import.meta.url);
const ids = Object.keys(resolved.colors);

test('an unavailable explicit browser fails closed instead of using local Chrome or skipping', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/browser-css.mjs', import.meta.url))],
    {encoding:'utf8', env:{...process.env, CHROME_BIN:''}});
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Chrome\/Chromium unavailable/);
});

test('actual delivered CSS: all source RGBA values, scopes, inheritance and unknown boundaries', async () => {
  assertCSSParity(await measureCSS(cssPath, ids), resolved);
});

test('duplicate wrong declaration cannot fool browser parity (old text check accepts it)', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tokens-css-negative-'));
  try {
    const css = readFileSync(cssPath, 'utf8');
    const id = ids[0], name = '--lp-' + id.replaceAll('.', '-');
    const expected = resolved.colors[id].light;
    const wrong = (expected.r + 1) % 256;
    const marker = '[data-lp-theme="light"] {';
    const start = css.indexOf(marker), end = css.indexOf('}', start);
    assert.ok(start >= 0 && end > start);
    const corrupt = css.slice(0, end) + `  ${name}: rgba(${wrong}, ${expected.g}, ${expected.b}, ${expected.a});\n` + css.slice(end);
    // The previous gate sees the correct text, despite the winning duplicate.
    const block = corrupt.split(marker)[1].split('}')[0];
    assert.ok(block.includes(`${name}: rgba(${expected.r}, ${expected.g}, ${expected.b}, ${expected.a});`));
    const path = join(dir, 'duplicate.css');
    writeFileSync(path, corrupt);
    const measured = await measureCSS(path, ids);
    assert.throws(() => assertCSSParity(measured, resolved), /light\/self.*computed RGBA/);
  } finally { rmSync(dir, {recursive:true, force:true}); }
});
