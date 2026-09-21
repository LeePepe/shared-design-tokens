// Producer-local contract integrity check, not a shared-ci policy/approval engine.
// Never imports or executes the inspected package. Expected version is caller supplied.
import {readFileSync, realpathSync, statSync} from 'node:fs';
import {resolve, relative, dirname, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import Ajv from 'ajv';

const schemaBytes = readFileSync(new URL('../ai/registry.schema.json', import.meta.url));
const validate = new Ajv({allErrors: true, strict: true}).compile(JSON.parse(schemaBytes));
const exactVersion = /^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/;
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// Bounded declaration inventory for this package's generated ESM/d.ts and public
// Swift facade. Byte fingerprints additionally detect signature/member changes.
// Not an AST parser or a proof of source compatibility; compile fixtures separately.
export function declaredSymbols(text, format) {
  const pattern = format === 'swift'
    ? /^\s*public\s+(?:static\s+)?(?:enum|struct|let|var|func)\s+(\w+)|^\s*public\s+(init)\s*\(/gm
    : /^export\s+(?:declare\s+)?(?:const|let|function|type|interface|class)\s+(\w+)/gm;
  if (format === 'asset') return [];
  return [...new Set([...text.matchAll(pattern)].map(match => match[1] ?? match[2]))].sort();
}

export function checkContract({root, expectedName, expectedVersion}) {
  const errors = [];
  const fail = (id, path, message) => errors.push({id, path, message, repair: 'ai/INTEGRATION.md#contract-failures'});
  if (!root || !expectedName || !exactVersion.test(expectedVersion ?? '')) {
    fail('AI_INPUT', '', 'Supply root, exact package name and exact expected version; no floating/latest fallback.');
    return {ok: false, errors};
  }
  let base;
  try { base = realpathSync(root); } catch { fail('AI_ROOT', root, 'Package root is unavailable.'); return {ok: false, errors}; }
  function read(path, id = 'AI_FILE_MISSING') {
    try {
      if (!path || isAbsolute(path) || path.includes('\\') || path.split('/').includes('..')) throw Error('unsafe relative path');
      const target = realpathSync(resolve(base, path));
      const rel = relative(base, target);
      if (rel.startsWith('../') || isAbsolute(rel) || !statSync(target).isFile()) throw Error('outside root or not a file');
      return readFileSync(target);
    } catch (error) { fail(id, path, `Unavailable or unsafe file: ${error.message}`); return null; }
  }
  function json(path) {
    const bytes = read(path);
    if (!bytes) return null;
    let value;
    try { value = JSON.parse(bytes); } catch { fail('AI_JSON', path, 'Invalid JSON.'); return null; }
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      fail('AI_JSON_SHAPE', path, 'Expected a JSON object, not null, an array or a primitive.');
      return null;
    }
    return value;
  }
  const registry = json('ai/registry.json');
  const pkg = json('package.json');
  if (!registry || !pkg) return {ok: false, errors};
  if (!validate(registry)) {
    fail('AI_REGISTRY_SCHEMA', 'ai/registry.json', JSON.stringify(validate.errors));
    return {ok: false, errors};
  }
  const shippedSchema = read('ai/registry.schema.json');
  if (shippedSchema && !shippedSchema.equals(schemaBytes)) fail('AI_SCHEMA_DRIFT', 'ai/registry.schema.json', 'Schema differs from this checker version.');
  if (pkg.name !== expectedName || registry.package.name !== expectedName) fail('AI_PACKAGE_IDENTITY', 'ai/registry.json', 'Expected name differs from package/registry.');
  if (pkg.version !== expectedVersion || registry.package.version !== expectedVersion) fail('AI_VERSION_MISMATCH', 'ai/registry.json', 'Expected version differs from package/registry.');
  const source = json(registry.tokenSchema.source);
  if (source && source.schemaVersion !== registry.tokenSchema.version) fail('AI_TOKEN_SCHEMA', registry.tokenSchema.source, 'Token schema version differs from registry.');

  const visited = new Set();
  function link(pointer, from = '') {
    const [path, anchor, ...extra] = pointer.split('#');
    if (isAbsolute(path) || path.includes('\\') || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(path)) {
      fail('AI_DOC_LINK', pointer, 'Use a portable relative document path, not an absolute path or URI.');
      return;
    }
    // Registry pointers are root-relative. Markdown links are normalized from
    // their document but must still resolve to files within the inspected root.
    const target = from ? relative(base, resolve(base, dirname(from), path || from.split('/').at(-1))) : path;
    const bytes = read(target, 'AI_DOC_LINK');
    if (!bytes) return;
    const text = bytes.toString();
    if (extra.length || (anchor && ![...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map(m => m[1].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s/g, '-')).includes(anchor))) {
      fail('AI_DOC_ANCHOR', pointer, 'Heading anchor is absent.');
    }
    if (!target.endsWith('.md') || visited.has(target)) return;
    visited.add(target);
    if (!text.trim()) fail('AI_DOC_EMPTY', target, 'Document is empty.');
    // This deliberately small checker supports inline links only. A shortcut
    // reference is a link only when defined; reject definitions as well as
    // full/collapsed reference syntax, instead of silently skipping targets.
    // Code spans/fences are examples, not navigation (see docs/ai-checker.md).
    const prose = text.replace(/^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[ \t]*$/gm, '').replace(/(`+)[\s\S]*?\1/g, '');
    if (/^[ \t]{0,3}\[[^\]\n]+\]:/m.test(prose) || /\[[^\]\n]+\][ \t\n]*\[[^\]\n]*\]/.test(prose)) {
      fail('AI_DOC_SYNTAX', target, 'Reference-style Markdown links are unsupported; use inline [label](relative-path) links.');
    }
    for (const match of prose.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
      if (/^https?:\/\//.test(match[1])) continue; // Citations only; no network resolution.
      link(match[1], target);
    }
  }
  for (const path of [...Object.values(registry.documents), registry.compatibility, registry.changelog]) link(path);
  const exampleIDs = new Set();
  for (const example of registry.examples) {
    if (exampleIDs.has(example.id)) fail('AI_EXAMPLE_DUPLICATE', example.path, 'Duplicate example ID.');
    exampleIDs.add(example.id);
    read(example.path, 'AI_EXAMPLE_MISSING'); link(example.doc);
  }
  const surfacePaths = new Set();
  for (const surface of registry.surfaces) {
    if (surfacePaths.has(surface.path)) fail('AI_API_DUPLICATE', surface.path, 'Duplicate API surface.');
    surfacePaths.add(surface.path);
    link(surface.doc);
    const bytes = read(surface.path, 'AI_API_MISSING');
    if (!bytes) continue;
    if (sha256(bytes) !== surface.sha256) fail('AI_API_DRIFT', surface.path, 'API artifact fingerprint differs; review the API/docs and explicitly update the registry.');
    const names = declaredSymbols(bytes.toString(), surface.format);
    if (JSON.stringify(names) !== JSON.stringify([...surface.symbols].sort())) fail('AI_API_SYMBOLS', surface.path, 'Declaration inventory differs from registry.');
  }
  function exportTarget(value) {
    if (typeof value !== 'string' || !value.startsWith('./') || !surfacePaths.has(value.slice(2))) {
      fail('AI_EXPORT_UNREGISTERED', 'package.json', 'Each export target must be a registered ./relative file.');
    }
  }
  const exports = pkg.exports;
  if (!exports || typeof exports !== 'object' || Array.isArray(exports) || !Object.hasOwn(exports, '.') || !Object.keys(exports).length) {
    fail('AI_EXPORT_SHAPE', 'package.json', 'Expected a nonempty subpath export map including the root entry.');
  } else {
    for (const [key, value] of Object.entries(exports)) {
      if (key !== '.' && (!/^\.\/[A-Za-z0-9_./-]+$/.test(key) || key.split('/').includes('..'))) {
        fail('AI_EXPORT_SHAPE', 'package.json', `Unsupported export key: ${key}`);
      }
      if (typeof value === 'string') exportTarget(value);
      else if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length) {
        for (const [condition, target] of Object.entries(value)) {
          if (!['types', 'import', 'default'].includes(condition)) fail('AI_EXPORT_SHAPE', 'package.json', `Unsupported export condition: ${condition}`);
          exportTarget(target);
        }
      } else fail('AI_EXPORT_SHAPE', 'package.json', 'Export entries must be strings or nonempty supported condition maps.');
    }
  }
  const manifest = read('Package.swift');
  if (manifest && !manifest.toString().includes(`.library(name: "${registry.package.swiftProduct}",`)) fail('AI_SWIFT_PRODUCT', 'Package.swift', 'Declared Swift product is missing.');
  return {ok: errors.length === 0, errors};
}

// Node resolves module URLs through symlinks; argv may retain /var or a link.
// Compare real paths so direct CLI invocation cannot silently skip validation.
let isDirectInvocation = false;
try {
  isDirectInvocation = Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
} catch {
  // Imports from stdin or virtual entrypoints may have no resolvable argv file.
}
if (isDirectInvocation) {
  const args = process.argv.slice(2);
  const allowed = ['--root', '--expected-name', '--expected-version'];
  const valid = args.length === 6 && args.every((arg, i) => i % 2 || allowed.includes(arg)) && new Set(args.filter((_, i) => i % 2 === 0)).size === 3;
  const options = valid ? Object.fromEntries(args.reduce((pairs, arg, i) => i % 2 ? pairs : [...pairs, [arg, args[i + 1]]], [])) : {};
  const result = checkContract({root: options['--root'], expectedName: options['--expected-name'], expectedVersion: options['--expected-version']});
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}
