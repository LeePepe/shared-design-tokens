// Retains only disposable synthetic consumers/artifacts; never writes remote state.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, writeFileSync, cpSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const dir = mkdtempSync(join(process.env.TOKENS_EVIDENCE_DIR || tmpdir(), 'tokens-contract-'));
const expectedName = '@leepepe/design-tokens';
const expectedVersion = '0.1.0';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const receipt = {expectedName, expectedVersion, directory: dir, commands: [], negatives: []};
console.log(`Contract evidence: ${dir}`);
function run(command, args, cwd = dir, expectedExit = 0) {
  const result = spawnSync(command, args, {cwd, encoding: 'utf8', timeout: 120000});
  const log = `${receipt.commands.length + 1}.log`;
  writeFileSync(join(dir, log), `${result.stdout ?? ''}\n${result.stderr ?? ''}`);
  receipt.commands.push({command, args, cwd, exit: result.status, log});
  assert.equal(result.status, expectedExit, `${command} ${args.join(' ')}: ${result.error ?? ''}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
function scan(path, expectedExit = 0) {
  // Both tool/schema and all inspected inputs come from the installed artifact.
  return JSON.parse(run(process.execPath, [join(installed, 'scripts/check-ai-contract.mjs'),
    '--root', path, '--expected-name', expectedName, '--expected-version', expectedVersion], dir, expectedExit));
}
let installed;
try {
  const [pack] = JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', dir], root));
  const tarball = join(dir, pack.filename);
  receipt.artifact = {path: tarball, sha256: digest(readFileSync(tarball)), files: pack.entryCount};
  assert.ok(!pack.files.some(({path}) => /^(node_modules|\.build|examples\/demo)\//.test(path)));
  // Bootstrap test-only tools from the existing frozen graph, not npm package
  // indexes: root npm ci can cache locked tarballs without caching packuments.
  const manifestBytes = readFileSync(join(root, 'package.json'));
  const lockBytes = readFileSync(join(root, 'package-lock.json'));
  const provider = JSON.parse(manifestBytes);
  const toolLock = JSON.parse(lockBytes);
  writeFileSync(join(dir, 'package.json'), manifestBytes);
  writeFileSync(join(dir, 'package-lock.json'), lockBytes);
  run('npm', ['ci', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--include=dev']);
  assert.ok(readFileSync(join(dir, 'package-lock.json')).equals(lockBytes), 'Frozen tool lock changed');
  receipt.tooling = {manifestSha256: digest(manifestBytes), lockSha256: digest(lockBytes)};
  // Remove provider self-exports from the disposable consumer, retaining the
  // installed/locked dev graph while adding the real token tarball dependency.
  writeFileSync(join(dir, 'package.json'), JSON.stringify({private: true, type: 'module', devDependencies: provider.devDependencies}));
  run('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--include=dev', '--save-exact', tarball]);
  const consumerLock = JSON.parse(readFileSync(join(dir, 'package-lock.json')));
  for (const [path, pkg] of Object.entries(toolLock.packages).filter(([path]) => path)) {
    for (const field of ['version', 'resolved', 'integrity']) assert.equal(consumerLock.packages[path]?.[field], pkg[field], `${path} ${field}`);
  }
  installed = join(dir, 'node_modules/@leepepe/design-tokens');
  const pkg = JSON.parse(readFileSync(join(installed, 'package.json')));
  assert.equal(pkg.private, true);
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.peerDependencies, undefined);
  assert.equal(pkg.version, expectedVersion);
  assert.equal(pkg.name, expectedName);
  assert.deepEqual(scan(installed), {ok: true, errors: []});
  receipt.examples = [];
  for (const example of ['usage.mjs', 'migration.mjs']) {
    const output = run(process.execPath, [join(installed, 'examples/data', example)]);
    assert.match(output, /PASS /); receipt.examples.push(output.trim());
  }
  // Copy only the shipped consumer source, never provider implementation files.
  cpSync(join(installed, 'examples/data/usage.ts'), join(dir, 'usage.ts'));
  const tsc = join(dir, 'node_modules/typescript/bin/tsc');
  const flags = ['--strict', '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext'];
  run(process.execPath, [tsc, ...flags, '--outDir', 'out', 'usage.ts']);
  const output = run(process.execPath, ['out/usage.js']);
  assert.match(output, /PASS TS data:/); receipt.examples.push(output.trim());
  writeFileSync(join(dir, 'invalid.ts'), "import {color} from '@leepepe/design-tokens';\ncolor('invalid.synthetic.id', 'light');\n");
  const invalid = run(process.execPath, [tsc, ...flags, '--noEmit', 'invalid.ts'], dir, 2);
  assert.match(invalid, /TS2345/);
  receipt.negatives.push({id: 'TS2345', exit: 2});
  const mutations = [
    ['missing-doc', 'AI_DOC_LINK', path => rmSync(join(path, 'ai/USAGE.md'))],
    ['version', 'AI_VERSION_MISMATCH', path => update(path, 'ai/registry.json', value => value.package.version = '0.0.0')],
    ['api-drift', 'AI_API_DRIFT', path => writeFileSync(join(path, 'dist/index.js'), 'export const changed = true;\n')],
    ['registry-schema', 'AI_REGISTRY_SCHEMA', path => update(path, 'ai/registry.json', value => value.schemaVersion = '9.0.0')],
    ['token-schema', 'AI_TOKEN_SCHEMA', path => update(path, 'tokens/colors.json', value => value.schemaVersion = '9.0.0')],
    ['schema-drift', 'AI_SCHEMA_DRIFT', path => writeFileSync(join(path, 'ai/registry.schema.json'), '{}')],
    ['example', 'AI_EXAMPLE_MISSING', path => rmSync(join(path, 'examples/data/usage.ts'))],
    ['export', 'AI_EXPORT_UNREGISTERED', path => update(path, 'package.json', value => value.exports['./new'] = './new.js')],
    ['swift-product', 'AI_SWIFT_PRODUCT', path => writeFileSync(join(path, 'Package.swift'), '// missing product\n')],
    ['policy-not-supported', 'AI_REGISTRY_SCHEMA', path => update(path, 'ai/registry.json', value => value.approved = true)]
  ];
  for (const [name, id, mutate] of mutations) {
    const copy = join(dir, `negative-${name}`);
    cpSync(installed, copy, {recursive: true});
    mutate(copy);
    const result = scan(copy, 1);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(error => error.id === id), JSON.stringify(result));
    assert.ok(result.errors.every(error => error.repair === 'ai/INTEGRATION.md#contract-failures'));
    receipt.negatives.push({name, id, exit: 1});
  }
  // Mutated copies did not damage the positive installed artifact.
  assert.deepEqual(scan(installed), {ok: true, errors: []});
  receipt.ok = true;
  console.log(receipt.examples.join('\n'));
  console.log(`PASS installed contract; ${receipt.negatives.length} failing-exit negatives; artifact SHA-256 ${receipt.artifact.sha256}`);
} finally {
  writeFileSync(join(dir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
}
function update(path, file, mutate) {
  const target = join(path, file);
  const value = JSON.parse(readFileSync(target));
  mutate(value); writeFileSync(target, JSON.stringify(value));
}
