import {readFileSync} from 'node:fs';
import Ajv from 'ajv';
const ajv = new Ajv({allErrors: true, strict: true});
const validate = ajv.compile(JSON.parse(readFileSync(new URL('../tokens/schema.json', import.meta.url))));
const modes = ['light', 'dark'];
const allowed = {foundation:['foundation'], brand:['foundation','brand'], status:['foundation','status'], product:['foundation','brand','status','product']};

/** WCAG 2 relative luminance, not HSB brightness; input channels are sRGB bytes. */
export function luminance({r,g,b}) {
  const linear = [r,g,b].map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
export function contrast(fg, bg) {
  if (fg.a !== 1 || bg.a !== 1) throw new Error('contrast requires opaque colors; composite explicitly first');
  const a = luminance(fg), b = luminance(bg);
  return (Math.max(a,b) + 0.05) / (Math.min(a,b) + 0.05);
}

/** Validate before resolving; generation has no network or UI dependency. */
export function resolveSource(source) {
  if (!validate(source)) throw new Error(`schema: ${ajv.errorsText(validate.errors)}`);
  const tokens = new Map();
  for (const token of source.tokens) {
    if (tokens.has(token.id)) throw new Error(`duplicate id: ${token.id}`);
    if (!token.id.startsWith(`${token.layer}.`)) throw new Error(`layer/id mismatch: ${token.id}`);
    if (token.layer === 'product' ? token.semanticId !== token.id : token.semanticId !== undefined) throw new Error(`semantic id mismatch: ${token.id}`);
    if (token.provenance.source === 'basalt' && !token.provenance.upstreamHsl) throw new Error(`missing upstream HSL: ${token.id}`);
    tokens.set(token.id, token);
  }
  const colors = {};
  function resolve(id, mode, chain = [], series = false) {
    const token = tokens.get(id);
    if (!token) throw new Error(`missing reference: ${id}`);
    if (chain.includes(id)) throw new Error(`cycle: ${[...chain,id].join(' -> ')}`);
    if (series && ['brand','status'].includes(token.layer)) throw new Error(`series depends on ${token.layer}: ${id}`);
    const value = token.values[mode];
    if (!('ref' in value)) return {r:value.r, g:value.g, b:value.b, a:value.a};
    const target = tokens.get(value.ref);
    if (!target) throw new Error(`missing reference: ${value.ref}`);
    if (!allowed[token.layer].includes(target.layer)) throw new Error(`illegal layer reference: ${id} -> ${value.ref}`);
    return resolve(value.ref, mode, [...chain,id], series);
  }
  for (const id of [...tokens.keys()].sort()) colors[id] = Object.fromEntries(modes.map(mode => [mode, resolve(id, mode, [], id.startsWith('product.series.'))]));
  const brands = Object.fromEntries(Object.keys(source.brands).sort().map(name => {
    const mapping = source.brands[name];
    for (const id of Object.values(mapping)) if (!tokens.has(id) || !id.startsWith(`brand.${name}.`)) throw new Error(`invalid brand reference: ${name}/${id}`);
    return [name, {accent:mapping.accent, onAccent:mapping.onAccent}];
  }));
  for (const pair of source.contrastPairs) for (const mode of modes) {
    if (!colors[pair.foreground] || !colors[pair.background]) throw new Error('missing contrast reference');
    const ratio = contrast(colors[pair.foreground][mode], colors[pair.background][mode]);
    if (ratio < pair.minimum) throw new Error(`contrast ${pair.foreground}/${pair.background}/${mode}: ${ratio} < ${pair.minimum}`);
  }
  return {schemaVersion:source.schemaVersion, colorSpace:source.colorSpace, colors, brands};
}
