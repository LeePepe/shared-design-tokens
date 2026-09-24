import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {luminance,contrast,resolveSource} from '../scripts/source.mjs';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source = JSON.parse(read('tokens/colors.json'));
const base = 'tokens/upstream/basalt-2.1.8/';

test('pinned upstream artifacts retain verified hashes and exact public API evidence', () => {
  const manifest=JSON.parse(read(base+'manifest.json'));
  assert.equal(manifest.version,source.upstream.version);
  for(const entry of manifest.files) assert.equal(createHash('sha256').update(read(base+entry.path)).digest('hex'),entry.sha256,entry.path);
  const pkg=JSON.parse(read(base+'package.json'));
  assert.equal(pkg.version,'2.1.8'); assert.equal(pkg.license,'MIT');
  assert.equal(pkg.exports['./providers/*'].import,'./dist/providers/*.js');
  assert.equal(pkg.exports['./styles/standalone'],'./dist/styles/standalone.css');
  assert.match(read(base+'dist/providers/theme.d.ts'),/export declare function useTheme/);
  assert.match(read(base+'dist/providers/theme.d.ts'),/applyToDocument\?: boolean/);
  assert.doesNotMatch(read(base+'dist/index.d.ts'),/export.*useTheme/);
});

test('all upstream HSL literals convert to source sRGB bytes with defined rounding', () => {
  const blocks=read(base+'dist/styles/tokens.css').split('}').slice(0,2);
  // CSS Color HSL algorithm, independent from the initial Python colorsys import.
  function fromHSL(text) {
    const [h,s100,l100]=text.split(' ').map(parseFloat), s=s100/100, l=l100/100;
    const a=s*Math.min(l,1-l);
    const channel=n=> {const k=(n+h/30)%12; return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))));};
    return {r:channel(0),g:channel(8),b:channel(4),a:1};
  }
  for(const token of source.tokens.filter(t=>t.provenance.source==='basalt')) {
    const variable=token.provenance.locator.split('#')[1];
    for(const [i,mode] of ['light','dark'].entries()) {
      const actual=blocks[i].match(new RegExp(variable+':\\s*([^;]+);'))?.[1];
      assert.equal(actual,token.provenance.upstreamHsl[mode],`${token.id}/${mode} origin`);
      assert.deepEqual(token.values[mode],fromHSL(actual),`${token.id}/${mode} conversion`);
    }
  }
});

test('contrast math has black/white/red reference vectors, no placeholder 0.5', () => {
  const black={r:0,g:0,b:0,a:1}, white={r:255,g:255,b:255,a:1};
  assert.equal(luminance(black),0); assert.equal(luminance(white),1);
  assert.equal(luminance({r:255,g:0,b:0}),0.2126);
  assert.equal(contrast(black,white),21);
  assert.equal(contrast(black,black),1);
  assert.throws(()=>contrast({...black,a:0.5},white),/opaque/);
});

test('all declared contrast pairs pass, and key text/surface gates cannot disappear', () => {
  const result=resolveSource(source);
  for(const fg of ['product.text.primary','product.text.secondary']) for(const bg of ['product.surface.canvas','product.surface.raised']) {
    assert.ok(source.contrastPairs.some(p=>p.foreground===fg && p.background===bg && p.minimum>=4.5));
  }
  for(const pair of source.contrastPairs) for(const theme of ['light','dark']) {
    assert.ok(contrast(result.colors[pair.foreground][theme],result.colors[pair.background][theme])>=pair.minimum);
  }
});

test('Swift source data layer never imports a UI framework', () => {
  for(const file of readdirSync(new URL('../Sources/DesignTokens/',import.meta.url))) {
    assert.doesNotMatch(read('Sources/DesignTokens/'+file),/import\s+(SwiftUI|UIKit|AppKit)/);
  }
});
