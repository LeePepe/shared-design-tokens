import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

// A fresh process installs the filesystem fault before Node lazily loads rimraf.
// Exercise measureCSS and Node's actual retry implementation, not a fake retry loop.
function cleanupProbe({code, persistent}) {
  const nativeRmdir = fs.rmdir;
  const fault = Object.assign(new Error('injected profile flush'), {code});
  let ownedRoot, injected = 0;
  fs.rmdir = function(path, callback) {
    const target = String(path);
    if (/[/\\]tokens-browser-[^/\\]+$/.test(target)) {
      ownedRoot ??= target;
      assert.equal(target, ownedRoot, 'only the measurement-owned temporary root');
      if (persistent || injected < 2) {
        injected++;
        return queueMicrotask(() => callback(fault));
      }
    }
    return nativeRmdir.call(this, path, callback);
  };
  return import('./scripts/browser-css.mjs').then(async ({measureCSS}) => {
    try {
      const ids = Object.keys(JSON.parse(fs.readFileSync('./dist/resolved.json')).colors);
      const measurement = measureCSS(new URL('./dist/colors.css', import.meta.url), ids);
      if (persistent) {
        await assert.rejects(measurement, error => error === fault, 'cleanup failure must reject measurement');
        assert.equal(injected, code === 'EBUSY' ? 6 : 1, 'bounded retries; permanent errors are not retried');
        assert.ok(fs.existsSync(ownedRoot), 'failed cleanup must not be reported as success');
      } else {
        const data = await measurement;
        assert.ok(data.rows.length > 0);
        assert.equal(injected, 2, 'fault must actually reach the owned cleanup');
        assert.ok(!fs.existsSync(ownedRoot), 'retry must remove the temporary directory');
      }
    } finally {
      fs.rmdir = nativeRmdir;
      if (ownedRoot) fs.rmSync(ownedRoot, {recursive:true, force:true, maxRetries:5, retryDelay:100});
    }
  });
}

function runProbe(options) {
  return spawnSync(process.execPath, ['--input-type=module', '-e',
    `import fs from 'node:fs'; import assert from 'node:assert/strict'; await (${cleanupProbe.toString()})(${JSON.stringify(options)});`],
  {cwd:new URL('../', import.meta.url), encoding:'utf8', timeout:90000});
}

for (const [name, options] of [
  ['retries transient ENOTEMPTY using the real filesystem retry path', {code:'ENOTEMPTY', persistent:false}],
  ['rejects persistent EBUSY after bounded retries', {code:'EBUSY', persistent:true}],
  ['rejects non-retryable EACCES without swallowing it', {code:'EACCES', persistent:true}],
]) {
  test(`browser cleanup ${name}`, () => {
    const result = runProbe(options);
    assert.equal(result.status, 0, `${result.error ?? ''}\n${result.stdout}\n${result.stderr}`);
  });
}
