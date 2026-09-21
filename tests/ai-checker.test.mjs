// Synthetic package fixtures ONLY: safe bootstrap before checking the producer.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {checkContract, declaredSymbols, sha256} from '../scripts/check-ai-contract.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'ai-checker-unit-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  const put = (path, value) => { mkdirSync(join(root, path, '..'), {recursive: true}); writeFileSync(join(root, path), typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)); };
  const api = 'export function color() { return 1; }\n';
  const documents = Object.fromEntries(['README', 'USAGE', 'INTEGRATION', 'EXAMPLES', 'COMPATIBILITY', 'MIGRATION'].map(name => [name, `ai/${name}.md`]));
  const registry = {
    schemaVersion: '1.0.0', package: {name: '@fixture/tokens', version: '1.2.3', swiftProduct: 'Fixture'}, documents,
    compatibility: 'ai/COMPATIBILITY.md', changelog: 'CHANGELOG.md', tokenSchema: {version: '1.0.0', source: 'tokens.json'},
    examples: ['javascript', 'typescript', 'swift'].map(language => ({id: language, path: `examples/${language}.txt`, language, doc: 'ai/EXAMPLES.md#usage'})),
    surfaces: [{path: 'index.js', format: 'javascript', sha256: sha256(api), symbols: ['color'], doc: 'ai/USAGE.md#usage'}]
  };
  const pkg = {name: '@fixture/tokens', version: '1.2.3', exports: {'.': './index.js'}};
  for (const path of [...Object.values(documents), 'CHANGELOG.md']) put(path, '# Usage\n');
  for (const example of registry.examples) put(example.path, 'synthetic example\n');
  put('ai/registry.schema.json', readFileSync(new URL('../ai/registry.schema.json', import.meta.url)));
  put('tokens.json', {schemaVersion: '1.0.0'}); put('index.js', api);
  put('Package.swift', '.library(name: "Fixture", targets: ["Fixture"])');
  const run = () => { put('ai/registry.json', registry); put('package.json', pkg); return checkContract({root, expectedName: '@fixture/tokens', expectedVersion: '1.2.3'}); };
  return {root, put, registry, pkg, run};
}

test('synthetic complete contract passes; nothing is imported/executed', t => {
  const f = fixture(t); assert.deepEqual(f.run(), {ok: true, errors: []});
});
const negatives = [
  ['missing doc', 'AI_DOC_LINK', f => rmSync(join(f.root, 'ai/USAGE.md'))],
  ['empty doc', 'AI_DOC_EMPTY', f => f.put('ai/USAGE.md', '')],
  ['wrong version', 'AI_VERSION_MISMATCH', f => f.registry.package.version = '2.0.0'],
  ['wrong installed version', 'AI_VERSION_MISMATCH', f => f.pkg.version = '2.0.0'],
  ['wrong identity', 'AI_PACKAGE_IDENTITY', f => f.pkg.name = '@other/tokens'],
  ['unknown schema', 'AI_REGISTRY_SCHEMA', f => f.registry.schemaVersion = '2.0.0'],
  ['weakened shipped schema', 'AI_SCHEMA_DRIFT', f => f.put('ai/registry.schema.json', '{}')],
  ['unknown policy field rejected', 'AI_REGISTRY_SCHEMA', f => f.registry.approved = true],
  ['source schema mismatch', 'AI_TOKEN_SCHEMA', f => f.put('tokens.json', {schemaVersion: '2.0.0'})],
  ['API drift', 'AI_API_DRIFT', f => f.put('index.js', 'export function changed() {}\n')],
  ['missing symbol', 'AI_API_SYMBOLS', f => f.registry.surfaces[0].symbols = ['absent']],
  ['unregistered export', 'AI_EXPORT_UNREGISTERED', f => f.pkg.exports['./extra'] = './extra.js'],
  ['missing Swift product', 'AI_SWIFT_PRODUCT', f => f.put('Package.swift', '')],
  ['missing example', 'AI_EXAMPLE_MISSING', f => rmSync(join(f.root, 'examples/swift.txt'))],
  ['duplicate example', 'AI_EXAMPLE_DUPLICATE', f => f.registry.examples.push(f.registry.examples[0])],
  ['duplicate API surface', 'AI_API_DUPLICATE', f => f.registry.surfaces.push(f.registry.surfaces[0])],
  ['broken heading', 'AI_DOC_ANCHOR', f => f.registry.surfaces[0].doc = 'ai/USAGE.md#absent'],
  ['nested broken link', 'AI_DOC_LINK', f => f.put('ai/USAGE.md', '# Usage\n[more](absent.md)')],
  ['traversal', 'AI_DOC_LINK', f => f.registry.compatibility = '../outside.md'],
  ['invalid JSON', 'AI_JSON', f => f.put('tokens.json', '{')],
  ['symlink escape', 'AI_DOC_LINK', f => { rmSync(join(f.root, 'ai/USAGE.md')); symlinkSync(new URL(import.meta.url), join(f.root, 'ai/USAGE.md')); }]
];
for (const [name, id, mutate] of negatives) test(name, t => {
  const f = fixture(t); mutate(f); const result = f.run();
  assert.equal(result.ok, false); assert.ok(result.errors.some(error => error.id === id), JSON.stringify(result));
  assert.ok(result.errors.every(error => error.repair === 'ai/INTEGRATION.md#contract-failures'));
});
test('linked relative docs and cycles terminate', t => {
  const f = fixture(t); f.put('ai/USAGE.md', '# Usage\n[other](../CHANGELOG.md)'); f.put('CHANGELOG.md', '[back](ai/USAGE.md#usage)'); assert.equal(f.run().ok, true);
});
test('declaration inventory covers TS types and Swift members', () => {
  assert.deepEqual(declaredSymbols('export type Theme = 1;\nexport interface RGBA {}\nexport declare function color(): RGBA;\n', 'typescript'), ['RGBA', 'Theme', 'color']);
  assert.deepEqual(declaredSymbols('public struct RGBA {\n public let r: Int\n public init(red: Int) {}\n public func contrast() {}\n}', 'swift'), ['RGBA', 'contrast', 'init', 'r']);
});
test('CLI requires explicit exact version and emits stable JSON/nonzero', t => {
  const f = fixture(t); f.run();
  for (const version of ['latest', '^1.2.3', '', '1.2.3']) {
    const result = spawnSync(process.execPath, [new URL('../scripts/check-ai-contract.mjs', import.meta.url).pathname, '--root', f.root, '--expected-name', '@fixture/tokens', '--expected-version', version], {encoding: 'utf8'});
    assert.equal(result.status, version === '1.2.3' ? 0 : 1);
    assert.equal(JSON.parse(result.stdout).ok, version === '1.2.3');
  }
});

for (const path of ['ai/registry.json', 'package.json', 'tokens.json']) {
  for (const value of [null, false, true, 0, 1, '', 'text', [], [1]]) {
    test(`reject JSON shape ${path}: ${JSON.stringify(value)}`, t => {
      const f = fixture(t); f.run(); f.put(path, JSON.stringify(value));
      const result = checkContract({root: f.root, expectedName: '@fixture/tokens', expectedVersion: '1.2.3'});
      assert.equal(result.ok, false);
      assert.ok(result.errors.some(error => error.id === 'AI_JSON_SHAPE' && error.path === path), JSON.stringify(result));
    });
  }
}
for (const exports of [{}, [], ['./index.js'], null, false, './index.js', {'.': []}, {'.': {}}, {'.': null}, {'.': {import: {default: './index.js'}}}, {'.': {import: './index.js'}, import: './index.js'}, {'.': {require: './index.js'}}, {'./only': './index.js'}, {'.': './index.js', './*': './index.js'}]) {
  test(`reject unsupported export map ${JSON.stringify(exports)}`, t => {
    const f = fixture(t); f.pkg.exports = exports;
    const result = f.run(); assert.equal(result.ok, false);
    assert.ok(result.errors.some(error => ['AI_EXPORT_SHAPE', 'AI_EXPORT_UNREGISTERED'].includes(error.id)), JSON.stringify(result));
  });
}
test('supported nonempty conditional export targets are checked', t => {
  const f = fixture(t); f.pkg.exports = {'.': {types: './index.js', import: './index.js', default: './index.js'}, './data': './index.js'};
  assert.equal(f.run().ok, true);
});
for (const path of ['root-relative', '/absent.md', 'C:/docs/README.md', 'file:///docs/README.md', '\\\\server\\docs\\README.md']) {
  test(`reject absolute markdown link ${path}`, t => {
    const f = fixture(t);
    const pointer = path === 'root-relative' ? join(f.root, 'ai/README.md') : path;
    f.put('ai/USAGE.md', `# Usage\n[absolute](${pointer})`);
    const result = f.run(); assert.equal(result.ok, false);
    assert.ok(result.errors.some(error => error.id === 'AI_DOC_LINK' && error.path === pointer), JSON.stringify(result));
  });
}
for (const markdown of ['[more][missing]', '[missing][]', '[missing]\n\n[missing]: absent.md', '[more][target]\n\n[target]: absent.md', '[more][target]\n\n[target]: README.md']) {
  test(`reject reference markdown ${JSON.stringify(markdown)}`, t => {
    const f = fixture(t); f.put('ai/USAGE.md', `# Usage\n${markdown}`);
    const result = f.run(); assert.equal(result.ok, false);
    assert.ok(result.errors.some(error => error.id === 'AI_DOC_SYNTAX'), JSON.stringify(result));
  });
}
test('reference-like syntax in code is not navigation', t => {
  const f = fixture(t); f.put('ai/USAGE.md', '# Usage\n`bindings[key][theme]`\n```js\n[value][key]\n```\n[inline](README.md)');
  assert.equal(f.run().ok, true);
});

for (const [name, example] of [
  ['span', '`[example](absent.md)`'],
  ['backtick fence', '```md\n[example](absent.md)\n```'],
  ['tilde fence', '~~~md\n[example](absent.md)\n~~~']
]) {
  test(`inline links in a code ${name} are examples, but prose links are checked`, t => {
    const f = fixture(t);
    const markdown = `# Usage\n${example}\n[real navigation](README.md)\n`;
    f.put('ai/USAGE.md', markdown);
    assert.deepEqual(f.run(), {ok: true, errors: []});
    f.put('ai/USAGE.md', `${markdown}[broken navigation](missing-prose.md)\n`);
    const result = f.run();
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(error => error.id === 'AI_DOC_LINK' && error.path === 'ai/missing-prose.md'));
  });
}

for (const target of ['missing.md', 'README.md']) {
  test(`escaped backticks outside fences fail closed even with target ${target}`, t => {
    const f = fixture(t);
    f.put('ai/USAGE.md', '# Usage\nUse \\`literal [broken](' + target + ') \\` here.\n');
    const result = f.run();
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(error => error.id === 'AI_DOC_SYNTAX' && error.path === 'ai/USAGE.md'));
    const cli = spawnSync(process.execPath, [new URL('../scripts/check-ai-contract.mjs', import.meta.url).pathname,
      '--root', f.root, '--expected-name', '@fixture/tokens', '--expected-version', '1.2.3'], {encoding: 'utf8'});
    assert.equal(cli.status, 1);
    assert.ok(JSON.parse(cli.stdout).errors.some(error => error.id === 'AI_DOC_SYNTAX'));
  });
}
for (const example of [
  '[plain](README.md) and `[example](missing.md)`',
  '```md\nUse \\`literal [broken](missing.md) \\` here.\n```\n[plain](README.md)',
  '~~~md\nUse \\`literal [broken](missing.md) \\` here.\n~~~\n[plain](README.md)'
]) {
  test(`escaped-backtick guard preserves supported plain/code links: ${JSON.stringify(example)}`, t => {
    const f = fixture(t);
    f.put('ai/USAGE.md', `# Usage\n${example}\n`);
    assert.deepEqual(f.run(), {ok: true, errors: []});
  });
}

for (const entry of ['stdin', 'missing-path']) {
  test(`import with ${entry} argv entry is safe and does not execute the CLI`, t => {
    const f = fixture(t); f.run();
    const moduleURL = new URL('../scripts/check-ai-contract.mjs', import.meta.url).href;
    const options = {root: f.root, expectedName: '@fixture/tokens', expectedVersion: '1.2.3'};
    const result = spawnSync(process.execPath, ['--input-type=module', '-'], {
      cwd: f.root, encoding: 'utf8',
      input: `${entry === 'missing-path' ? `process.argv[1] = ${JSON.stringify(join(f.root, 'absent-entry.mjs'))};` : ''}
        const {checkContract} = await import(${JSON.stringify(moduleURL)});
        console.log(JSON.stringify(checkContract(${JSON.stringify(options)})));`
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    assert.deepEqual(JSON.parse(result.stdout), {ok: true, errors: []});
  });
}

test('CLI invoked through a symlink still checks and returns failing exits', t => {
  const f = fixture(t); f.run();
  const entry = join(f.root, 'checker-link.mjs');
  symlinkSync(new URL('../scripts/check-ai-contract.mjs', import.meta.url), entry);
  for (const [version, exit, id] of [['1.2.3', 0, null], ['9.9.9', 1, 'AI_VERSION_MISMATCH']]) {
    const result = spawnSync(process.execPath, [entry, '--root', f.root,
      '--expected-name', '@fixture/tokens', '--expected-version', version], {encoding: 'utf8'});
    assert.equal(result.status, exit);
    const report = JSON.parse(result.stdout);
    assert.equal(report.ok, exit === 0);
    if (id) assert.ok(report.errors.some(error => error.id === id));
  }
});
