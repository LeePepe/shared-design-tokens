import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {color, brandColor, seriesColor} from '@leepepe/design-tokens';

// Deliberately synthetic legacy adapter, not a product's historical palette.
const legacy = JSON.parse(readFileSync(new URL('./legacy-colors.json', import.meta.url)));
const roles = Object.freeze({foreground: 'product.text.primary', canvas: 'product.surface.canvas'});
const bindings = Object.freeze({'synthetic-alpha': 'product.series.cobalt', 'synthetic-beta': 'product.series.rose'});
function localAdapter(key, theme) {
  if (!Object.hasOwn(legacy.modes, theme) || !Object.hasOwn(legacy.modes[theme], key)) throw Error('Unknown local color');
  return legacy.modes[theme][key];
}
function tokenAdapter(key, theme) {
  if (Object.hasOwn(roles, key)) return color(roles[key], theme);
  return seriesColor(key, bindings, theme).color;
}
let assertions = 0;
assert.equal(legacy.version, 'synthetic-local-colors-v0'); assertions++;
for (const theme of ['light', 'dark']) {
  for (const key of Object.keys(legacy.modes[theme])) {
    const expected = legacy.modes[theme][key];
    let selected = localAdapter;
    assert.deepEqual(selected(key, theme), expected); assertions++;
    selected = tokenAdapter; // forward migration: only change adapter selection
    assert.deepEqual(selected(key, theme), expected); assertions++;
    selected = localAdapter; // rollback: preserved local values and stable keys
    assert.deepEqual(selected(key, theme), expected); assertions++;
  }
  for (const brand of ['ocean', 'graphite']) {
    assert.equal(brandColor(brand, 'accent', theme).a, 1); assertions++;
    for (const keys of [Object.keys(bindings), Object.keys(bindings).reverse(), ['synthetic-beta']]) {
      for (const key of keys) {
        assert.equal(seriesColor(key, bindings, theme).id, bindings[key]); assertions++;
        assert.deepEqual(tokenAdapter(key, theme), localAdapter(key, theme)); assertions++;
      }
    }
  }
}
for (const adapter of [localAdapter, tokenAdapter]) {
  for (const key of ['unknown-role', 'missing-synthetic-key']) { assert.throws(() => adapter(key, 'light')); assertions++; }
  assert.throws(() => adapter('foreground', 'system')); assertions++;
}
console.log(`PASS synthetic migration and rollback: ${assertions} assertions`);
