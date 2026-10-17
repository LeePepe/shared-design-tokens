# Platform-neutral style foundations — additive scope revision

Status: implementation candidate for review; unreleased. This scope expands the
historical color-only spec while preserving its color data and lookup behavior.
The NativeDesignKit Foundations/Controls work requires the provider to own style
values as well as colors. Native components, layout algorithms, accessibility
behavior, Liquid Glass and screenshots remain in shared-design-system.

## Authority and units

- `tokens/colors.json` remains the only editable color authority. Its schema,
  identifiers, existing resolved values, theme requirements and errors are unchanged.
- `tokens/styles.json` is the only editable non-color style authority, validated
  by `tokens/styles.schema.json`. Generated Swift/JS/TS/JSON is never edited.
- Style lengths are logical units: an adapter maps them to native points or web
  CSS pixels and applies appropriate accessibility scaling. Durations, stagger,
  spring response and blend duration are seconds. Weight is the CSS 100–900
  scale; opacity/damping/control points are unitless. This is not a native font
  implementation or a Basalt theme override.
- Every style category has stable IDs and project provenance. Typography includes
  a relative text role, line height, tracking and monospaced-digit intent. Shadow
  colors reference existing color IDs; callers resolve the theme explicitly.

## Public behavior

Add a theme-independent `StyleTokens` Swift data facade and an ESM/TypeScript
`@leepepe/design-tokens/styles` subpath. Categories: spacing, dimension, radius,
border, opacity, duration, stagger, typography, curve, spring and shadow. Values
are immutable, Swift values are Sendable, and unknown/wrong-category IDs fail
without fallback. Existing `TokenError` and all existing color APIs are unchanged.
The provider never chooses OS theme, native material, font renderer, animation,
layout, screen or business state.

## Acceptance

- Strict source validation rejects unknown schema/units/categories, duplicate IDs,
  missing categories/provenance, unknown fields, invalid/nonfinite values, invalid
  typography line height, curve x coordinates, spring damping and shadow references.
- Deterministic generation is insensitive to token/property order and fails on
  missing/drifted outputs without repairing them in check mode. Invalid styles
  fail before any output is written.
- Every generated JS and Swift value matches resolved source data; JS values are
  deeply frozen. Wrong-category and hostile property names fail closed.
- Real packed/external consumers compile and execute public color and style APIs,
  including negative types/errors. Existing browser color parity stays required.
- Contracts/changelog describe the addition and explicitly distinguish a local
  exact-commit candidate from an immutable release. No release, tag, registry
  publication, consumer pin upgrade or native-UI claim belongs to this PR.

## Compatibility and review

This is an additive provider scope revision requiring Owner review of the
constitution/index/layer contracts and manifest. It does not reduce existing
validation, policy or gates, add runtime dependencies, or change platform floors.
The last immutable release is v0.1.1, which does not contain styles. The working
tree prepares unreleased 0.2.0 manifest metadata and version-matched contracts
for the companion Strata addition.

This PR does not publish a release. Required exact-head checks, review,
applicable Owner approval and external consumer verification still precede the
separate immutable release and remote exact-version consumption. These
specifications describe prepared implementation and metadata; they do not
establish approval. No release policy or registry permission changes.
