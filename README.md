# design-system — color data candidate

Private, unpublished `@leepepe/design-tokens@0.1.0-candidate.0` / Swift `DesignTokens`. This first version ships **color data only**, not UI components. `tokens/colors.json` is the editable source of truth; JSON Schema and deterministic generation produce JS/TS, scoped CSS, resolved JSON and Swift.

## Start here

- [Specification](specs/001-shared-colors/spec.md), [plan](specs/001-shared-colors/plan.md), [tasks](specs/001-shared-colors/tasks.md)
- [Constitution](docs/constitution.md), [technical context](docs/context.md)
- [Basalt baseline and public API audit](docs/upstream.md), [third-party notices](THIRD_PARTY_NOTICES.md)
- [Compatibility / upgrade / rollback / deferred work](docs/compatibility.md)

## Layers and units

| Layer | Purpose | Example |
|---|---|---|
| foundation | Version-pinned Basalt-derived primitives | `foundation.foreground` |
| brand | Explicit brand-specific accent choices | `brand.ocean.accent` |
| status | Generic communicative roles, paired on-colors | `status.warning`, `status.on-warning` |
| product | Independently namespaced reusable semantics | `product.text.primary`, `product.series.cobalt` |

`schemaVersion: "1.0.0"`, `colorSpace: "srgb"`; RGB channels are integers **0…255**, alpha **0…1**. Tokens have explicit light/dark values or same-mode references, stable IDs and provenance. Product `semanticId` equals `id`. References are validated as a DAG. Series cannot transitively depend on brand or status.

Nine declared opaque text/surface or on-color pairs are contrast-gated at >=4.5 in both modes. This is not a claim that all possible token combinations, chart hues or UI components meet accessibility requirements. Include labels/patterns where needed. No business meaning is inferred from hue.

## Web / TypeScript consumer

Use an exact reviewed local tarball or commit; nothing has been published. The runtime package has **zero dependencies**, including no React. Ajv/TypeScript are generator/test dev dependencies only.

```ts
import {color, brandColor, seriesColor, type SeriesID} from '@leepepe/design-tokens';
const foreground = color('product.text.primary', 'dark'); // {r:237,g:237,b:237,a:1}
const accent = brandColor('ocean', 'accent', 'light');
const bindings: Record<string, SeriesID> = { persistentKey: 'product.series.cobalt' };
const series = seriesColor('persistentKey', bindings, 'dark'); // {id, color}
```

Keep the identity -> series-ID binding in consumer-owned persisted data; never assign from sorted/filtered array indices. The example key is not a shared domain model. Both brand switches and rendering order leave series IDs unchanged. Invalid IDs/themes/brand roles or absent bindings throw; there is no default fallback.

```css
/* Import @leepepe/design-tokens/colors.css using your bundler. */
.example { color: var(--lp-product-text-primary); background: var(--lp-product-surface-canvas); }
```

Set `data-lp-theme="light"` or `"dark"` on the intended scope. Unattributed descendants inherit; nested light/dark scopes override normally. An explicit unsupported value (including `system`, empty or misspelled values) invalidates only this package's own variables at that boundary and through unattributed descendants; a valid nested scope restores them. CSS `var()` fallbacks then apply, rather than silently receiving the ancestor theme. Unrelated custom properties are untouched. No automatic `:root`, OS preference or Basalt CSS override is emitted. Basalt remains Web component/theme authority: pin `@nocoo/basalt@2.1.8`, use its actual public providers/styles, resolve `system` explicitly in any future adapter. This package does not pick a chart renderer and does not replace an existing ECharts contract.

Public exports: root ESM + `.d.ts`, `/colors.css`, `/resolved.json`, `/source.json`, `/schema.json`. `dist/colors.ts` is also pregenerated and compile-tested as a readable immutable data artifact, not an extra public export. Upstream audit snapshots are not public exports.

## Swift data consumer

Add a local Swift package dependency for this candidate, then `.product(name: "DesignTokens", package: "design-system-colors")` (the dependency identity follows your local folder or explicit package identity). At a future reviewed Git revision the repository identity is `design-system`.

```swift
import DesignTokens
let color = try DesignTokens.color("product.text.primary", theme: .dark)
// Encoded sRGB bytes, not native Color objects:
let red = Double(color.r) / 255.0
let series = try DesignTokens.seriesColor(
    "persistentKey", bindings: ["persistentKey": "product.series.cobalt"], theme: .light
)
let ratio = try color.contrast(with: DesignTokens.color("product.surface.canvas", theme: .dark))
```

`Theme`, `BrandRole`, `RGBA`, `SeriesColor`, `TokenError` and `DesignTokens` are public immutable/Sendable data APIs. `RGBA(red:green:blue:alpha:)` rejects out-of-range/nonfinite inputs; `relativeLuminance` implements WCAG sRGB math; `contrast(with:)` rejects translucent colors instead of guessing a compositing surface. No HSB API or placeholder non-AppKit values exist.

Root `Package.swift` currently has only a `DesignTokens` library and its tests. A future **separate** `NativeDesignKit` UI target may depend on it, with native per-platform implementations; do not add UI imports to this target. Declared floors: Swift tools 6.0, iOS15/macOS12/watchOS8. Those are data-target declarations, not consumer migrations or device-validation claims. See the compatibility matrix.

## Reproduce

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test # requires Chrome/Chromium; includes test:browser
npm run generate:check
npm run test:consumer
npm run test:pack
swift build
swift test
```

Browser tests use Node standard library to launch an isolated, short-lived headless Chrome/Chromium, load the delivered CSS and compare computed sRGB RGBA for every token in both themes, inheritance, nesting and invalid boundaries. A duplicate wrong declaration proves the gate detects winning overrides. Set `CHROME_BIN` to an executable, or use standard Chrome/Chromium commands on PATH / the standard macOS application location (Windows installation paths are also searched, not locally verified). Missing browsers and invalid explicit overrides fail, never skip. `npm run test:browser` runs this suite alone; `test:pack` also checks the CSS exported by the actually installed tarball. No UI framework, server or screenshot test is used.

After intentional source changes: `npm run generate`, then repeat the gates. Generator supports `--check`, `--source <file>`, `--out <directory>`; `--check` never repairs files. Tests regenerate into an empty temporary directory, compare every output byte, and prove missing/drifted/invalid input exits nonzero. npm packing installs into an isolated consumer, type-checks positive and negative APIs and runs actual emitted JS.

CI has read-only permissions and no provider credentials. Its presence does not establish required checks or prove a hosted run. All current execution evidence is from the local host, not iOS/macOS UI validation.
