import {readFileSync} from 'node:fs';
import Ajv from 'ajv';
import {resolveSource} from './source.mjs';
const ajv = new Ajv({allErrors: true, strict: true, strictNumbers: true});
const validate = ajv.compile(JSON.parse(readFileSync(new URL('../tokens/styles.schema.json', import.meta.url))));
export const styleCategories = Object.freeze(['spacing', 'dimension', 'radius', 'border', 'opacity', 'duration', 'stagger', 'typography', 'curve', 'spring', 'shadow']);

/** Theme-independent immutable data. Rendering, scaling and theme resolution belong to adapters. */
export function resolveStyles(source, colorSource) {
  if (!validate(source)) throw new Error(`style schema: ${ajv.errorsText(validate.errors)}`);
  const colorIDs = new Set(Object.keys(resolveSource(colorSource).colors));
  const tokens = new Map();
  for (const token of source.tokens) {
    if (tokens.has(token.id)) throw new Error(`duplicate style id: ${token.id}`);
    const category = token.id.split('.')[0];
    if (category === 'typography' && token.value.lineHeight < token.value.size) throw new Error(`style lineHeight below size: ${token.id}`);
    if (category === 'shadow' && !colorIDs.has(token.value.colorToken)) throw new Error(`unknown shadow color: ${token.value.colorToken}`);
    tokens.set(token.id, token);
  }
  for (const category of styleCategories) {
    if (![...tokens.keys()].some(id => id.startsWith(category + '.'))) throw new Error(`missing style category: ${category}`);
  }
  // Object property order is canonical as well as token order.
  function canonical(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
    return value;
  }
  return {schemaVersion: source.schemaVersion, units: canonical(source.units), tokens: Object.fromEntries([...tokens.keys()].sort().map(id => [id, canonical(tokens.get(id).value)]))};
}
