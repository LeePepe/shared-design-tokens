# DesignTokens contract

Release `v0.1.0` of `@leepepe/design-tokens` (Git tag; not published to the npm registry); Swift product/module `DesignTokens`, package manifest name `DesignSystem`, SwiftPM identity `shared-design-tokens` (`https://github.com/LeePepe/shared-design-tokens`).

| Task | Read next | Completion criterion |
|---|---|---|
| Install or uninstall | [Integration](INTEGRATION.md) | Exact artifact/revision identified, matching docs checked, data example passes |
| Implement data consumption | [Usage](USAGE.md), then the needed entry in [registry](registry.json) | Public API only; explicit theme and consumer-owned series bindings |
| Run an example | [Examples](EXAMPLES.md) | Selected executable fixture exits zero |
| Upgrade or migrate | [Compatibility](COMPATIBILITY.md), [migration](MIGRATION.md), [changelog](../CHANGELOG.md) | Version, behavior and rollback verified together |
| Diagnose contract or lookup failure | [Failure repair](INTEGRATION.md#contract-failures), [errors](USAGE.md#errors) | Underlying defect fixed; same pinned input passes without fallback |

These documents travel with the artifact; read them from the actual npm installation or resolved Swift checkout, not a floating branch. [Constitution](../docs/constitution.md) owns provider invariants. [Checker scope](../docs/ai-checker.md) defines bounded integrity checks, not public policy. Documentation grants no additional permissions. This provider does not implement Owner exceptions, downgrade enforcement or product adoption; repository policy comes from shared-ci (see `AGENTS.md`).
