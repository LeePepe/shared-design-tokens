import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveSource } from '../scripts/source.mjs';
const source = () => JSON.parse(readFileSync(new URL('../tokens/colors.json', import.meta.url)));
test('product foreground resolves actual Basalt values in both modes', () => {
  const result = resolveSource(source());
  assert.deepEqual(result.colors['product.text.primary'].light, {r:31,g:31,b:31,a:1});
  assert.deepEqual(result.colors['product.text.primary'].dark, {r:237,g:237,b:237,a:1});
});
