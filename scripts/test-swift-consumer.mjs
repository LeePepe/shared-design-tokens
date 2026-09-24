// Exact local Git dependency, not a source-path dependency. No remote fetch/write.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const revision = process.argv[2];
assert.ok(process.argv.length === 3 && /^[a-f0-9]{40}$/.test(revision), 'Pass one full local candidate commit SHA');
const dir = mkdtempSync(join(process.env.TOKENS_EVIDENCE_DIR || tmpdir(), 'tokens-swift-'));
const receipt = {revision, directory: dir, commands: [], documents: {}};
console.log(`Swift evidence: ${dir}`);
function run(command, args, cwd = root, env = process.env) {
  const result = spawnSync(command, args, {cwd, env, encoding: 'utf8', timeout: 180000});
  const log = `${receipt.commands.length + 1}.log`;
  writeFileSync(join(dir, log), `${result.stdout ?? ''}\n${result.stderr ?? ''}`);
  receipt.commands.push({command, args, cwd, exit: result.status, log});
  assert.equal(result.status, 0, `${command} ${args.join(' ')}: ${result.error ?? ''}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
try {
  assert.equal(run('git', ['rev-parse', 'HEAD']).trim(), revision, 'Harness must belong to exact candidate');
  assert.equal(run('git', ['status', '--porcelain', '--untracked-files=all']).trim(), '', 'Commit reviewed local gate inputs before exact-revision verification');
  receipt.tree = run('git', ['rev-parse', `${revision}^{tree}`]).trim();
  const mirror = join(dir, 'tokens-provider.git');
  run('git', ['clone', '--bare', '--no-hardlinks', '--', root, mirror]);
  assert.equal(run('git', ['remote', 'get-url', 'origin'], mirror).trim(), root);
  receipt.repository = pathToFileURL(mirror).href;
  const consumer = join(dir, 'consumer');
  const prefix = 'examples/data/swift/';
  const fixtures = run('git', ['ls-tree', '-r', '--name-only', revision, '--', prefix]).trim().split('\n');
  assert.ok(fixtures.includes(`${prefix}Package.swift`));
  for (const file of fixtures) {
    assert.ok(file.startsWith(prefix));
    const target = join(consumer, file.slice(prefix.length));
    mkdirSync(dirname(target), {recursive: true});
    writeFileSync(target, run('git', ['show', `${revision}:${file}`]));
  }
  const env = {...process.env, TOKENS_REPOSITORY_URL: receipt.repository, TOKENS_REVISION: revision};
  run('swift', ['package', '--package-path', consumer, 'resolve'], consumer, env);
  const resolved = JSON.parse(readFileSync(join(consumer, 'Package.resolved')));
  assert.equal(resolved.pins.length, 1);
  assert.equal(resolved.pins[0].identity, 'tokens-provider');
  assert.equal(resolved.pins[0].state.revision, revision);
  const checkouts = readdirSync(join(consumer, '.build/checkouts'));
  assert.equal(checkouts.length, 1);
  const checkout = join(consumer, '.build/checkouts', checkouts[0]);
  assert.equal(run('git', ['rev-parse', 'HEAD'], checkout).trim(), revision);
  receipt.checkout = checkout;
  const registry = JSON.parse(readFileSync(join(checkout, 'ai/registry.json')));
  const pkg = JSON.parse(readFileSync(join(checkout, 'package.json')));
  assert.equal(pkg.version, '0.1.0');
  assert.equal(registry.package.version, pkg.version);
  assert.equal(registry.package.swiftProduct, 'DesignTokens');
  // All contract and linked local Markdown authorities are from the resolved commit.
  const docFiles = run('git', ['ls-tree', '-r', '--name-only', revision, '--', 'ai', 'docs', 'specs', 'README.md', 'CHANGELOG.md', 'AGENTS.md', 'THIRD_PARTY_NOTICES.md']).trim().split('\n');
  for (const file of docFiles) {
    const bytes = readFileSync(join(checkout, file));
    assert.equal(bytes.toString(), run('git', ['show', `${revision}:${file}`]));
    receipt.documents[file] = createHash('sha256').update(bytes).digest('hex');
  }
  run('swift', ['build', '--package-path', consumer], consumer, env);
  receipt.example = run('swift', ['run', '--package-path', consumer, 'TokenExample'], consumer, env).trim();
  assert.match(receipt.example, /PASS Swift data:/);
  receipt.ok = true;
  console.log(`${receipt.example}\nPASS exact revision ${revision}; resolved docs match ${Object.keys(receipt.documents).length} Git files`);
} finally {
  writeFileSync(join(dir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
}
