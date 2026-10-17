# Changelog

## 0.2.0 — style foundations and five Strata palettes

- Add five explicit Strata brands, six family-sensitive neutral surfaces, brand states and material RGBA roles from approved custom Strata v0.2.
- Add brand-independent semantic text/status/chart colors and declared opaque contrast pairs. Existing colors/brands/series and runtime APIs remain unchanged.
- Immutable tag, artifact digest and external consumer verification are recorded in release notes. Native UI acceptance remains consumer-owned.

- Add authoritative `tokens/styles.json` and strict style schema: typography, spacing, dimensions/hit targets, radius, border, opacity, shadow, duration, curve, spring and stagger data.
- Generate immutable Swift `StyleTokens` and JS/TS `/styles` data APIs plus resolved JSON. Styles fail closed on unknown/wrong-category IDs; existing color data/APIs/errors are unchanged.
- Extend source, packed and exact-revision consumer checks. No UI imports, new runtime dependencies or platform-floor changes; npm registry publication remains disabled.
- Expands the historical color-only scope while preserving all legacy data and APIs. Version 0.1.1 has no style API; consumers adopt exact 0.2.0 after release verification.

## 0.1.1 — license metadata now MIT; LICENSE file included (Git tag `v0.1.1`)

- `package.json` / `package-lock.json` license changes from `UNLICENSED` to `MIT`, matching `LICENSE`.
- The repository `LICENSE` (MIT) ships in this tag; the `v0.1.0` tag had none.
- No runtime API, token ID, color value or generated artifact changes.
- Swift consumers pin `exact: "0.1.1"`; npm consumers install the tarball built from tag `v0.1.1` (no npm registry publication; `package.json` stays `private`).

## 0.1.0 — first release (Git tag `v0.1.0`)

- First immutable release of the candidate.1 color data and contract; no runtime API, token ID, color value or generated artifact changes.
- Swift consumers pin `.package(url: "https://github.com/LeePepe/shared-design-tokens.git", exact: "0.1.0")`; npm consumers install the tarball built from the tag (no npm registry publication; `package.json` stays `private`).
- Repository follows the shared-ci repo contract (`AGENTS.md`, `scripts/verify`, `quality / aggregate`).

## 0.1.0-candidate.1 — private, unpublished

- Add version-matched AI contract, bounded registry/schema checker, packaged prerequisites and executable JS/TS/Swift synthetic data and migration fixtures.
- Verify real npm tarball installation and exact-local-revision external Swift consumption; no remote-fetch, released-package or product-adoption claim.
- Clarify future NativeDesignKit as an independent Apple repository; current origin and public package/module identities are unchanged.
- No runtime API, token ID, color value or generated artifact changes; no deprecations or breaking runtime changes. No shared-ci policy, Owner-exception or downgrade enforcement is implemented.

## 0.1.0-candidate.0 — private, unpublished

Initial color data candidate: JS/TS/CSS/JSON, pure-data Swift, deterministic generation, provenance and consumer tests. Historical evidence is in [color verification](docs/verification.md).
