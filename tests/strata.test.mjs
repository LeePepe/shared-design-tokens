import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {color, brandColor, brandIDs} from '../dist/index.js';
import {resolveSource, contrast} from '../scripts/source.mjs';
const source=JSON.parse(readFileSync(new URL('../tokens/colors.json',import.meta.url)));
const legacy={tokens:source.tokens.filter(t=>!t.id.includes('.strata')),brands:Object.fromEntries(Object.entries(source.brands).filter(([k])=>!k.startsWith('strata-'))),contrastPairs:source.contrastPairs.filter(p=>!p.foreground.includes('.strata')&&!p.background.includes('.strata'))};
const families=['blue','green','pink','yellow','purple'];
test('Strata addition preserves every legacy source token, brand and pair',()=>{
  assert.equal(createHash('sha256').update(JSON.stringify(legacy)).digest('hex'),'befd0c2841299c73878770edae002def239fe9c56e14245a9943def112405b70');
});
test('five explicit families retain named primary, neutral and material roles in both modes',()=>{
  assert.deepEqual(brandIDs.filter(x=>x.startsWith('strata-')),families.map(x=>'strata-'+x).sort());
  for(const mode of ['light','dark']) {
    const pages=[];
    for(const family of families){
      const b=`brand.strata-${family}.`,p=`product.strata.${family}.`;
      assert.deepEqual(brandColor('strata-'+family,'accent',mode),color(b+'primary',mode));
      assert.deepEqual(brandColor('strata-'+family,'onAccent',mode),color(b+'on-accent',mode));
      for(const role of ['region','card','inset','hover','selected'])assert.notDeepEqual(color(p+'surface.'+role,mode),color(p+'surface.page',mode));
      for(const role of ['panel','content','control','ambient','ambient-soft','ambient-edge'])assert.ok(color(p+'material.'+role,mode).a<1);
      pages.push(color(p+'surface.page',mode));
      for(const state of ['primary','hover','active'])assert.ok(contrast(color(b+'on-accent',mode),color(b+state,mode))>=4.5);
    }
    assert.equal(new Set(pages.map(JSON.stringify)).size,5);
  }
  assert.deepEqual(color('brand.strata-blue.primary','light'),{r:40,g:89,b:188,a:1});
  assert.deepEqual(color('product.strata.purple.surface.card','dark'),{r:50,g:44,b:60,a:1});
  assert.equal(color('product.strata.blue.material.panel','light').a,158/255);
  assert.equal(color('product.strata.purple.material.content','dark').a,209/255);
  assert.throws(()=>brandColor('strata-orange','accent','light'),/unknown brand/);
});
test('declared Strata contrast remains a fail-closed source gate',()=>{
  const broken=structuredClone(source);
  broken.tokens.find(t=>t.id==='brand.strata-blue.on-accent').values.light={ref:'brand.strata-blue.primary'};
  assert.throws(()=>resolveSource(broken),/contrast/);
  for(const token of source.tokens.filter(t=>t.id.includes('.strata'))) {
    assert.equal(token.provenance.source,'local');
    assert.match(token.provenance.locator,/b4bff430517ed2e2944f814d8b5ab89a1866ee33/);
  }
});
