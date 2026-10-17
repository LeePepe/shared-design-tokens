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

Implemented: immutable color and style data and producer-local integrity checks. Planned elsewhere: independent Apple NativeDesignKit/SPM repository. Out of scope: UI, persistence, product migration, shared-ci policy/approval/downgrade checks, publication and network resolution.

## Style foundations (0.2.0)

Available in version 0.2.0; absent from v0.1.1. The [Swift facade](../Sources/DesignTokens/StyleTokens.swift) exposes `StyleTokens` and immutable Equatable/Sendable `TypographyToken`, `CubicBezierToken`, `SpringToken`, `ShadowToken`. The [ESM implementation](../dist/styles.js) and [declarations](../dist/styles.d.ts) are exported through `/styles`. File-readable assets are `/styles.resolved.json`, `/styles.source.json`, `/styles.schema.json`; no style CSS theme or framework adapter is emitted.

Both APIs expose category lookups and sorted category ID arrays for `spacing`, `dimension`, `radius`, `border`, `opacity`, `duration`, `stagger`, `typography`, `curve`, `spring` and `shadow`. Scalar categories return numbers/Double. Structured types contain:

| Type | Data |
| --- | --- |
| TypographyToken | size, weight, lineHeight, tracking, relativeTo, monospacedDigits |
| CubicBezierToken | x1, y1, x2, y2 |
| SpringToken | response, dampingFraction, blendDuration |
| ShadowToken | colorToken, opacity, radius, x, y |

Lengths are logical units; adapters map them to native points or web CSS pixels and apply appropriate Dynamic Type/user scaling. Font weight uses the 100–900 CSS scale. `relativeTo` identifies the type role (`largeTitle`, `title`, `title2`, `title3`, `headline`, `body`, `callout`, `subheadline`, `footnote`, `caption`, `caption2`); adapters supply the actual font. Durations/stagger/spring response/blend are seconds. Opacity/damping/curve coordinates are unitless. Curve x coordinates lie in 0…1; y may overshoot. Shadow colorToken is resolved with the existing explicit-theme color API; opacity composes with that color's alpha. A shadow's color role does not imply a text contrast guarantee.

```swift
let gap = try StyleTokens.spacing("spacing.lg")
let body = try StyleTokens.typography("typography.body")
let shadow = try StyleTokens.shadow("shadow.small")
let shadowColor = try DesignTokens.color(shadow.colorToken, theme: .dark)
```

```ts
import {spacing, typography, shadow} from '@leepepe/design-tokens/styles';
import {color} from '@leepepe/design-tokens';
const gap = spacing('spacing.lg');
const body = typography('typography.body');
const shadowSpec = shadow('shadow.small');
const shadowColor = color(shadowSpec.colorToken, 'dark');
```

JS data is deeply frozen and TypeScript style IDs are category-specific literal unions. Swift throws `StyleTokenError.unknownToken(originalID)` for missing or wrong-category IDs, leaving existing `TokenError` unchanged; JS throws `Error` with `unknown style token`. There is no arbitrary style-construction API, default theme, mutable registry or fallback. Current values have original project provenance; Basalt remains Web rendering/theme authority.

## Strata colors (0.2.0)

The [additive color specification](../specs/003-strata-palettes.md) defines five
explicit brands: `strata-blue`, `strata-green`, `strata-pink`, `strata-yellow`,
`strata-purple`. Existing `brandColor(brand, accent/onAccent, theme)` resolves
primary and on-brand text. Existing `color(id, theme)` reads further named roles;
no schema or runtime lookup API changes. Legacy ocean/graphite and all existing
series IDs retain their values and meaning. This addition is absent from v0.1.1.

| Prefix | Roles |
| --- | --- |
| `brand.strata-<family>.` | seed, seed-ink, primary, hover, active, subtle, text, on-accent |
| `product.strata.<family>.surface.` | page, region, card, inset, hover, selected |
| `product.strata.<family>.material.` | panel, content, control, ambient, ambient-soft, ambient-edge |
| `product.strata.text.` | primary, secondary |
| `status.strata.` | success, warning, error and corresponding `-surface` |
| `product.strata.chart.` | primary, secondary, tertiary |
| `product.strata.material.` | edge, highlight, inner-edge, shadow |

`product.strata.border` is the decorative border color. Named chart colors are
presentation roles, not series identities or status labels. Material values are
RGBA data, not native blur or a composited text contrast guarantee. The provider
declares opaque normal-text pairs in both modes; consumers verify actual
translucent composites. This does not change Basalt Web theme authority.
