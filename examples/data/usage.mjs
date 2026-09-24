// Synthetic identities only; no UI, business data or persisted migration.
import assert from 'node:assert/strict';
import {color, brandColor, seriesColor} from '@leepepe/design-tokens';

const bindings = Object.freeze({'synthetic-alpha': 'product.series.cobalt', 'synthetic-beta': 'product.series.rose'});
let assertions = 0;
for (const theme of ['light', 'dark']) {
  assert.equal(color('product.text.primary', theme).a, 1); assertions++;
  for (const brand of ['ocean', 'graphite']) {
    assert.equal(brandColor(brand, 'accent', theme).a, 1); assertions++;
    for (const keys of [Object.keys(bindings), Object.keys(bindings).reverse(), ['synthetic-beta']]) {
      for (const key of keys) {
        const series = seriesColor(key, bindings, theme);
        assert.equal(series.id, bindings[key]); assertions++;
        assert.deepEqual(series.color, color(bindings[key], theme)); assertions++;
      }
    }
  }
}
assert.notDeepEqual(color('product.text.primary', 'light'), color('product.text.primary', 'dark')); assertions++;
for (const action of [
  () => color('invalid.synthetic.id', 'light'),
  () => color('product.text.primary', 'system'),
  () => seriesColor('missing-synthetic-key', bindings, 'dark'),
  () => seriesColor('synthetic-alpha', {'synthetic-alpha': 'product.text.primary'}, 'light')
]) { assert.throws(action); assertions++; }
console.log(`PASS JS data: ${assertions} assertions`);
