import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));

test('installed contract works offline with locked tarball bytes but no package metadata', () => {
  const dir = mkdtempSync(join(process.env.TOKENS_EVIDENCE_DIR || tmpdir(), 'tokens-offline-'));
  console.log(`Offline regression evidence: ${dir}`);
  const cacheQuery = spawnSync('npm', ['config', 'get', 'cache'], {cwd: root, encoding: 'utf8'});
  assert.equal(cacheQuery.status, 0, cacheQuery.stderr);
  const sourceCache = cacheQuery.stdout.trim();
  const cache = join(dir, 'cache');
  const lock = JSON.parse(readFileSync(join(root, 'package-lock.json')));
  // npm ci has already cached these locked bytes. Copy only verified content,
  // never package-index responses, URL indexes, credentials or installed modules.
  for (const [path, pkg] of Object.entries(lock.packages).filter(([path]) => path)) {
    const match = /^(sha1|sha256|sha384|sha512)-([A-Za-z0-9+/=]+)$/.exec(pkg.integrity);
    assert.ok(match, `Unsupported locked integrity: ${path}`);
    const [, algorithm, base64] = match;
    const hex = Buffer.from(base64, 'base64').toString('hex');
    const content = join('_cacache', 'content-v2', algorithm, hex.slice(0, 2), hex.slice(2, 4), hex.slice(4));
    const source = join(sourceCache, content);
    assert.equal(createHash(algorithm).update(readFileSync(source)).digest('base64'), base64, path);
    mkdirSync(dirname(join(cache, content)), {recursive: true});
    copyFileSync(source, join(cache, content));
  }
  assert.equal(existsSync(join(cache, '_cacache/index-v5')), false);
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^npm_config_(cache|registry|offline)$/i.test(key)));
  Object.assign(env, {npm_config_cache: cache, npm_config_offline: 'true',
    npm_config_registry: 'https://registry.npmjs.org', TOKENS_EVIDENCE_DIR: dir});
  function run(name, command, args) {
    const result = spawnSync(command, args, {cwd: root, env, encoding: 'utf8', timeout: 120000});
    writeFileSync(join(dir, `${name}.log`), `${result.stdout ?? ''}\n${result.stderr ?? ''}`);
    return result;
  }
  function metadataAbsent(name) {
    const result = run(name, 'npm', ['view', 'ajv@8.17.1', 'version', '--offline']);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /ENOTCACHED/);
    assert.match(result.stderr, /https:\/\/registry\.npmjs\.org\/ajv/);
  }
  metadataAbsent('metadata-before');
  const result = run('contract', process.execPath, [join(root, 'scripts/test-contract-pack.mjs')]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const match = /Contract evidence: (.+)/.exec(result.stdout);
  assert.ok(match);
  const consumer = match[1].trim();
  const receipt = JSON.parse(readFileSync(join(consumer, 'receipt.json')));
  assert.equal(receipt.ok, true);
  assert.equal(receipt.negatives.length, 11);
  const installedLock = JSON.parse(readFileSync(join(consumer, 'package-lock.json')));
  for (const [path, pkg] of Object.entries(lock.packages).filter(([path]) => path)) {
    for (const field of ['version', 'resolved', 'integrity']) assert.equal(installedLock.packages[path]?.[field], pkg[field], `${path} ${field}`);
  }
  metadataAbsent('metadata-after');
});
