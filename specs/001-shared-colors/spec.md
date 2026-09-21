# Shared colors v1 — approved task scope
Status: specification written before implementation; private unpublished candidate.

## Intent
Provide platform-neutral, testable sRGB data shared by Web data consumers and future iOS/macOS UI packages, without sharing view code. Audit actual published `@nocoo/basalt` and pin a version/license/public exports before taking baseline values. No React/runtime Basalt dependency in this package; no Web adapter or native components.

## Source contract
Schema version `1.0.0`, color space `srgb`; RGBA uses integer RGB channels 0…255 and numeric alpha 0…1. Every token has stable dot-separated ID prefixed with one of `foundation`, `brand`, `status`, `product`, explicit light/dark values (literal RGBA or same-mode reference), and provenance. References form a DAG, no unknown references. Every public product token has a stable semantic ID equal to its token ID. Brand definitions may select only brand tokens; series bindings select product-series IDs by externally persisted identity, never by array position/hash/order. Product series must not transitively depend on brand/status.

## API and behavior
Runtime JS/TS and pure Swift expose lookup by ID and theme, explicit brand lookup, stable series lookup by a caller-supplied keyed binding, and errors for unknown inputs. Values match generated CSS and resolved JSON exactly. Swift stores immutable typed values and Sendable types; no UI imports. Consumers supply light/dark explicitly (no OS inference). Foundation values derive from a documented subset of pinned Basalt CSS; product vocabulary remains generic. At least two selectable brands and three product series demonstrate separation.

## Acceptance
- Node validator rejects missing fields/modes/provenance, bad IDs/duplicates, invalid RGBA, illegal layer dependencies, missing references and cycles.
- Deterministic generator with `--check` fails on absent/drifted outputs; source reorder yields same output.
- Light/dark Swift, JS and CSS match source resolution. Named opaque normal-text/surface pairs meet WCAG 2 ratio >=4.5, including intentionally invalid fixture proving the gate fails.
- TDD red then green through public interfaces; runtime/type consumer fixture, npm pack-installed consumer, Swift build/test, clean regeneration are actually executed with exit-code logs.
- Stable series identity survives brand/theme changes, filtering and sorting. Unknown input cannot silently fall back.
- Docs include attribution, source ownership, integration, compatibility/upgrade/rollback and deferred work; CI read-only and credential-free. CI presence is not required-check enforcement.

## Non-goals
UI, color-blindness certification, simulator/device validation, a full Basalt theme reimplementation, runtime dynamic palettes, P3/HDR, adapters, resolver service, global registry, publication and business migrations.
