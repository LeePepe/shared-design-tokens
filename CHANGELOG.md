# Changelog

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
