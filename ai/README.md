# DesignTokens contract

Private, unpublished `@leepepe/design-tokens@0.1.0-candidate.1`; Swift product/module `DesignTokens`, package manifest name `DesignSystem`. Current origin is `LeePepe/design-system`. Proposed shared-repository names are future architecture, not current dependency URLs.

| Task | Read next | Completion criterion |
|---|---|---|
| Install or uninstall | [Integration](INTEGRATION.md) | Exact artifact/revision identified, matching docs checked, data example passes |
| Implement data consumption | [Usage](USAGE.md), then the needed entry in [registry](registry.json) | Public API only; explicit theme and consumer-owned series bindings |
| Run an example | [Examples](EXAMPLES.md) | Selected executable fixture exits zero |
| Upgrade or migrate | [Compatibility](COMPATIBILITY.md), [migration](MIGRATION.md), [changelog](../CHANGELOG.md) | Version, behavior and rollback verified together |
| Diagnose contract or lookup failure | [Failure repair](INTEGRATION.md#contract-failures), [errors](USAGE.md#errors) | Underlying defect fixed; same pinned input passes without fallback |

These documents travel with the artifact; read them from the actual npm installation or resolved Swift checkout, not a floating branch. [Constitution](../docs/constitution.md) owns provider invariants. [Checker scope](../docs/ai-checker.md) defines bounded integrity checks, not public policy. Documentation grants no additional permissions. This provider slice does not implement shared-ci, Owner exceptions, downgrade enforcement, product adoption or a release.
