import {color, brandColor, seriesColor, type SeriesID, type RGBA} from '@leepepe/design-tokens';
const bindings: Readonly<Record<string, SeriesID>> = {sample: 'product.series.cobalt'};
const text: RGBA = color('product.text.primary', 'dark');
if (text.r !== 237 || text.a !== 1) throw new Error('wrong actual consumer value');
if (seriesColor('sample', bindings, 'light').id !== bindings.sample) throw new Error('unstable ID');
if (brandColor('ocean','accent','dark').a !== 1) throw new Error('brand alpha');
// Type-level negatives are compiled, never executed; JS negatives live in runtime tests.
function negativeContracts() {
  // @ts-expect-error unknown token
  color('product.unknown', 'light');
  // @ts-expect-error callers must resolve system mode
  color('product.text.primary', 'system');
  // @ts-expect-error status cannot be used as series identity
  seriesColor('sample', {sample:'status.info'}, 'light');
  // @ts-expect-error returned color is immutable
  text.r = 0;
  // @ts-expect-error unknown brand role
  brandColor('ocean', 'primary', 'light');
}
void negativeContracts;
console.log('TS consumer runtime passed');
