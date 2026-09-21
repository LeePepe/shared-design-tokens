import {color, brandColor, seriesColor, type Theme, type SeriesID, type RGBA} from '@leepepe/design-tokens';

const bindings: Readonly<Record<string, SeriesID>> = Object.freeze({
  'synthetic-alpha': 'product.series.cobalt', 'synthetic-beta': 'product.series.rose'
});
let assertions = 0;
function check(ok: boolean): void { if (!ok) throw Error('TS example assertion failed'); assertions++; }
for (const theme of ['light', 'dark'] satisfies Theme[]) {
  const foreground: RGBA = color('product.text.primary', theme);
  check(foreground.a === 1);
  for (const brand of ['ocean', 'graphite'] as const) {
    check(brandColor(brand, 'accent', theme).a === 1);
    for (const keys of [Object.keys(bindings), Object.keys(bindings).reverse(), ['synthetic-beta']]) {
      for (const key of keys) check(seriesColor(key, bindings, theme).id === bindings[key]);
    }
  }
}
let rejected = false;
try {
  // @ts-expect-error Illegal ID must fail at compile time and at runtime.
  color('invalid.synthetic.id', 'light');
} catch { rejected = true; }
check(rejected);
check(color('product.text.primary', 'light').r !== color('product.text.primary', 'dark').r);
console.log(`PASS TS data: ${assertions} assertions`);
