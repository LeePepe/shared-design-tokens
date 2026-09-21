import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {color,brandColor,seriesColor,tokenIDs,seriesIDs} from '../dist/index.js';
import {resolveSource} from '../scripts/source.mjs';
const source = JSON.parse(readFileSync(new URL('../tokens/colors.json',import.meta.url)));
test('runtime matches every source value for both themes; CSS stays namespaced', () => {
  const resolved=resolveSource(source), css=readFileSync(new URL('../dist/colors.css',import.meta.url),'utf8');
  assert.deepEqual(tokenIDs,Object.keys(resolved.colors));
  for(const mode of ['light','dark']) {
    for(const id of tokenIDs) {
      const c=color(id,mode); assert.deepEqual(c,resolved.colors[id][mode]);
      assert.ok(Object.isFrozen(c));
    }
  }
  assert.ok(!css.includes('--basalt-')); assert.ok(!css.includes(':root'));
});
test('series IDs survive sort/filter/theme/brand; no palette rotation', () => {
  const bindings={a:'product.series.cobalt',b:'product.series.rose',c:'product.series.leaf'};
  for(const mode of ['light','dark']) for(const brand of ['ocean','graphite']) {
    assert.deepEqual(brandColor(brand,'accent',mode),color(`brand.${brand}.accent`,mode));
    for(const key of ['c','a']) assert.deepEqual(seriesColor(key,bindings,mode),{id:bindings[key],color:color(bindings[key],mode)});
  }
  assert.equal(seriesIDs.length,3);
  assert.notDeepEqual(brandColor('ocean','accent','light'),brandColor('graphite','accent','light'));
});
test('all unknown values fail explicitly, including JS prototype names', () => {
  for (const id of ['missing','toString','__proto__']) assert.throws(()=>color(id,'light'),/unknown token/);
  for(const id of [null, ['product.text.primary'], {}]) assert.throws(()=>color(id,'light'),/unknown token/);
  assert.throws(()=>seriesColor(1,{'1':'product.series.cobalt'},'light'),/missing series binding/);
  assert.throws(()=>color('product.text.primary','system'),/unknown theme/);
  assert.throws(()=>brandColor('missing','accent','light'),/unknown brand/);
  assert.throws(()=>brandColor('ocean','toString','light'),/unknown brand role/);
  assert.throws(()=>seriesColor('missing',{},'light'),/missing series binding/);
  assert.throws(()=>seriesColor('a',{a:'brand.ocean.accent'},'light'),/invalid series token/);
  assert.throws(()=>seriesColor('a',{a:'product.series.missing'},'light'),/invalid series token/);
  assert.throws(()=>seriesColor('toString',{},'light'),/missing series binding/);
  assert.throws(()=>{color('product.text.primary','light').r=100;},TypeError);
});
