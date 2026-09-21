import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {render} from '../scripts/generate.mjs';
const source = () => JSON.parse(readFileSync(new URL('../tokens/colors.json', import.meta.url)));
test('generation is deterministic under token/brand/RGBA reordering and has all outputs', () => {
  const input = source(), first = render(input);
  input.tokens.reverse(); input.brands = Object.fromEntries(Object.entries(input.brands).reverse());
  assert.deepEqual(render(input), first);
  const reordered = source();
  for (const mode of ['light', 'dark']) {
    assert.ok(reordered.tokens.some(token => 'ref' in token.values[mode]), `reference propagation in ${mode}`);
    for (const token of reordered.tokens) {
      const value = token.values[mode];
      if (!('ref' in value)) token.values[mode] = Object.fromEntries(Object.entries(value).reverse());
    }
  }
  assert.deepEqual(render(reordered), first);
  assert.deepEqual(Object.keys(first).sort(), ['Sources/DesignTokens/GeneratedColors.swift','dist/colors.css','dist/colors.ts','dist/index.d.ts','dist/index.js','dist/resolved.json'].sort());
});
test('CLI --check fails on missing/drifted output and never repairs it', () => {
  const dir = mkdtempSync(join(tmpdir(), 'colors-check-'));
  const run = (...args) => spawnSync(process.execPath, ['scripts/generate.mjs','--out',dir,...args], {encoding:'utf8'});
  try {
    assert.equal(run('--check').status, 1);
    assert.equal(run().status, 0);
    assert.equal(run('--check').status, 0);
    for (const [relative, expected] of Object.entries(render(source()))) {
      assert.equal(readFileSync(join(dir,relative),'utf8'),expected,relative);
      assert.equal(readFileSync(new URL('../'+relative,import.meta.url),'utf8'),expected,`checked-in ${relative}`);
    }
    const path = join(dir,'dist/colors.css'); writeFileSync(path, 'drift');
    assert.equal(run('--check').status, 1);
    assert.equal(readFileSync(path,'utf8'), 'drift');
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test('invalid source makes the real generator command fail', () => {
  const dir = mkdtempSync(join(tmpdir(),'colors-invalid-'));
  try {
    const input=source(); input.tokens[0].values.light.a=2;
    const file=join(dir,'invalid.json'); writeFileSync(file,JSON.stringify(input));
    const result=spawnSync(process.execPath,['scripts/generate.mjs','--source',file,'--out',dir],{encoding:'utf8'});
    assert.equal(result.status,1); assert.match(result.stderr,/schema/);
  } finally {rmSync(dir,{recursive:true,force:true});}
});
