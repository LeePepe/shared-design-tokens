import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolveSource} from '../scripts/source.mjs';
const source = () => JSON.parse(readFileSync(new URL('../tokens/colors.json', import.meta.url)));
const mutations = {
  'missing light mode': s => delete s.tokens[0].values.light,
  'missing provenance': s => delete s.tokens[0].provenance,
  'unknown schema version': s => s.schemaVersion = '2.0.0',
  'invalid id': s => s.tokens[0].id = 'Foundation.BAD',
  'duplicate id': s => s.tokens.push(s.tokens[0]),
  'invalid RGBA channel': s => s.tokens[0].values.light.r = 256,
  'invalid fractional RGB': s => s.tokens[0].values.light.r = 1.5,
  'invalid alpha': s => s.tokens[0].values.light.a = -0.1,
  'non-finite channel': s => s.tokens[0].values.light.r = NaN,
  'unknown field typo': s => s.tokens[0].colourSpace = 'p3',
  'missing reference': s => s.tokens[0].values.light = {ref: 'foundation.missing'},
  'cycle reference': s => s.tokens[0].values.light = {ref: s.tokens[0].id},
  'semantic identity mutation': s => s.tokens.at(-1).semanticId = 'product.series.other',
  'foundation depending on brand': s => s.tokens[0].values.light = {ref:'brand.ocean.accent'},
  'series depending on brand': s => s.tokens.at(-1).values.dark = {ref:'brand.ocean.accent'},
  'series indirect brand dependency': s => {s.tokens.at(-1).values.dark = {ref:'product.text.primary'}; s.tokens.find(t => t.id === 'product.text.primary').values.dark = {ref:'brand.ocean.accent'};},
  'brand map selecting series': s => s.brands.ocean.accent = 'product.series.cobalt',
  'low contrast': s => s.tokens.find(t => t.id === 'product.text.primary').values.light = {ref:'foundation.background'},
  'transparent contrast pair': s => s.tokens.find(t => t.id === 'foundation.foreground').values.dark.a = 0.5,
  'contrast threshold weakened': s => s.contrastPairs[0].minimum = 1,
};
for (const [name, mutate] of Object.entries(mutations)) test(`reject ${name}`, () => {
  const input = source(); mutate(input);
  assert.throws(() => resolveSource(input), Error, name);
});
test('resolver is insensitive to source token ordering', () => {
  const input = source(), before = resolveSource(input); input.tokens.reverse();
  assert.deepEqual(resolveSource(input), before);
});
