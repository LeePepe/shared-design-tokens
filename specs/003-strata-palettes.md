# Strata five-family color foundations

Status: additive implementation candidate, unreleased. Source design is Strata
v0.2 at commit `b4bff430517ed2e2944f814d8b5ab89a1866ee33` of the reference
prototype. This scope expands color data without changing runtime API or schema.

## Contract

- Preserve every pre-existing token, brand mapping, series identity and contrast
  pair. Ocean and graphite retain their meaning and values.
- Add explicit `strata-blue`, `strata-green`, `strata-pink`, `strata-yellow` and
  `strata-purple` brands. Existing accent/onAccent lookup resolves primary and
  on-brand text; additional named roles use existing explicit-theme color lookup.
- `brand.strata-<family>.*` owns seed, seed-ink, primary, hover, active, subtle,
  text and on-accent. `product.strata.<family>.surface.*` owns page, region, card,
  inset, hover and selected. Material panel/content/control and ambient colors
  are family/mode specific. Shared text, status, chart, border and material edge,
  highlight, inner-edge and shadow roles preserve the approved source semantics.
- Color data is edited only in `tokens/colors.json`; provenance identifies the
  original custom design and exact source commit. Generated data is reproducible.
- Status meaning and chart identities remain independent of brand. Chart roles
  do not join persisted `product.series.*` identities or imply accessible text.
- No provider UI imports, no Basalt selectors/authority changes, no fallback,
  no alias from a new family to a legacy brand, no OS inference or native blur.

## Acceptance

Declared opaque text/surface, brand on-primary/hover/active, seed and status pairs
must reach 4.5 in both modes. Translucent material colors preserve intended percentage alpha (two-decimal
normalization of the reference hex serialization, with exact RGB);
actual material composition/readability belongs to the native consumer and its
runtime evidence. Tests lock the prior source payload, cover all five families,
mode-sensitive surfaces and material roles, verify exact source reference values,
and prove low-contrast source changes fail generation. Node/Swift/CSS parity,
packed consumers, exact committed Swift consumer and all existing gates remain.

## Release boundary

This source candidate does not issue a release, tag or registry publication.
Version 0.2.0 metadata is prepared but unreleased; publication remains a separate
step after required exact-head checks, review, applicable Owner approval and
external consumer evidence. Native candidate evidence may use an isolated bare
Git mirror with a local-only v0.2.0 tag at the frozen candidate SHA and must label
that provenance.
Remote released-dependency verification starts only after the immutable release
is available. Release policy and npm publication restrictions are unchanged.
