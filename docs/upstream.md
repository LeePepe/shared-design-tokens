# Basalt baseline audit

Pinned **`@nocoo/basalt@2.1.8`**, MIT (Zheng Li, 2026). Observed published `latest` through the npm registry web retrieval on 2026-09-21, and exact-version package metadata through both unpkg and jsDelivr. Runtime implementation does not dynamically fetch latest. No broad replication of Basalt theme authority.

## Evidence / access limitations
- Registry observation: https://registry.npmjs.org/@nocoo%2fbasalt/latest returned version 2.1.8 (web extraction).
- Exact package: https://cdn.jsdelivr.net/npm/@nocoo/basalt@2.1.8/package.json and https://unpkg.com/@nocoo/basalt@2.1.8/package.json both identify 2.1.8/MIT.
- Direct host npm registry requests failed with ENOTCONN / curl 35; the machine's default corporate proxy returned 404 for this version. No credentials/configuration were changed. Used public version-pinned CDN package files instead, NOT fabricated npm-install output.
- `tokens/upstream/basalt-2.1.8/manifest.json` records fetched paths, URLs, SHA-256 bytes. It is an audited file snapshot, not a claim that the full npm tarball integrity was verified or upstream React executed.

## Actual public interface
`package.json` exports root `.`, `./components/*`, `./providers/*`, `./charts/*`, `./styles`, `./styles/tailwind`, `./styles/standalone`. Root exports `ThemeProvider` but **not** `useTheme`; the latter is exported by `@nocoo/basalt/providers/theme`. No invented JS `tokens` export exists in this audited root declaration.

`ThemeProviderProps`: children, storageKey, defaultTheme, persist, controlled theme, onThemeChange, applyToDocument. `BasaltTheme` is light/dark/system. Provider implementation toggles document `.light`/`.dark` and `data-mode`; setting applyToDocument=false delegates root ownership to the host. Future adapters must use these public APIs and explicitly resolve system to light/dark before passing our data API.

Public CSS entry `@nocoo/basalt/styles/tailwind` imports internal `tokens.css`/`base.css`; audited CSS uses `--basalt-*` HSL values. Do **not** import private `dist/styles/tokens.css` in an app or override upstream variables with this package. Our CSS emits only `--lp-*`, activated by explicit `[data-lp-theme]`.

## Derivation
A small subset of upstream HSL literals is converted to 8-bit encoded sRGB: CSS HSL conversion, each channel multiplied by 255 and rounded to nearest integer (half up), alpha 1. Source retains original HSL per light/dark mode and exact CSS variable locator. Independent CSS-HSL test verifies every derived literal against the pinned CSS bytes. Rounding quantizes up to half a byte per channel; this is intentionally not a bit-identical floating-point CSS rendering claim.

Foundation aliases feed brand/status/product layers. Brand ocean uses upstream primary; graphite uses foreground/background. Generic info/warning/critical have paired on-colors. Product series cobalt/rose/leaf use named chart-blue/pink/green, never upstream chart-N positions. No success/gain/loss inference from green; meanings and labels belong to consumers. This package neither selects Recharts nor replaces Financial's existing ECharts contract.
