# Usage

## Public data API

The [ESM implementation](../dist/index.js) and [TypeScript declarations](../dist/index.d.ts) own signatures and allowed string unions. `color` looks up a semantic ID in explicit `light`/`dark`; `brandColor` resolves a brand plus `accent`/`onAccent`; `seriesColor` resolves a stable synthetic/consumer key through caller-owned bindings. Exported `tokenIDs`, `brandIDs`, `seriesIDs`, `schemaVersion` and `colorSpace` describe the same data. Returned RGBA values are encoded sRGB bytes (RGB 0–255, alpha 0–1), not UI colors.

The public asset subpaths are `/colors.css`, `/resolved.json`, `/source.json`, `/schema.json` under `@leepepe/design-tokens`. JSON assets and `ai/registry.json` are file-readable data, not named ESM exports. Only subpaths in the [manifest](../package.json) are exported; `dist/colors.ts` and upstream snapshots are not additional public import paths.

The [Swift facade](../Sources/DesignTokens/DesignTokens.swift) owns `Theme`, `BrandRole`, `RGBA`, `SeriesColor`, `TokenError` and `DesignTokens`, including luminance and opaque contrast math. [Package.swift](../Package.swift) publishes only `DesignTokens`; no native UI module exists. The registry fingerprints these files and their public lexical declarations; compilation, not the lexical inventory, checks call-site compatibility.

## Themes and identity

Supply light/dark explicitly; consumers resolve OS or Basalt `system` values. CSS uses only `--lp-*` under `data-lp-theme`; unsupported explicit boundaries invalidate owned properties. See the existing [CSS contract](../README.md#web--typescript-consumer) and [Basalt audit](../docs/upstream.md). Basalt remains Web control/theme authority. These data examples do not authorize a new Web token-use policy or UI adapter.

Store identity-to-series bindings in the consumer, independently of brand, sort order and filtering. [Executable examples](EXAMPLES.md) demonstrate both modes, both brands and illegal IDs. Series colors do not assign business meaning or guarantee color-blind accessibility; supply labels/patterns in separately reviewed UI.

## Errors

JS throws on unknown IDs, invalid themes/brands/roles, absent bindings and non-series binding values; no fallback or token alias is installed. TypeScript rejects illegal literals at compile time; untrusted runtime input still needs validation. Swift uses typed themes and roles; its exact error cases are defined in `TokenError` in the linked facade. RGBA initialization rejects invalid/nonfinite values and contrast rejects translucency. A consumer must handle errors explicitly rather than substitute an arbitrary color.

Implemented: immutable color data and producer-local integrity checks. Planned elsewhere: independent Apple NativeDesignKit/SPM repository. Out of scope: UI, persistence, product migration, shared-ci policy/approval/downgrade checks, publication and network resolution.
