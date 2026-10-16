# Compatibility

This contract is for release `0.1.1` (Git tag `v0.1.1`), registry schema `1.0.0`, token schema `1.0.0`. npm and Swift share the tag: npm consumers install the tarball built from it, Swift consumers pin `exact: "0.1.1"`. Package, token-schema and registry-schema versions are distinct.

The authoritative [platform and toolchain matrix](../docs/compatibility.md#matrix) separates declared floors from actual local verification. 0.1.1 preserves the 0.1.0 runtime API and generated colors; licensing metadata only. The checker uses Ajv only as a development dependency, not runtime.

The existing [version policy](../docs/compatibility.md#api--version-contract) owns breaking/additive changes. No token IDs are deprecated or renamed in this release and no alias API exists. A future removal needs an explicit deprecation/migration proposal and compatibility evidence; there is no promised time-based candidate support window. Stable-release major/minor policy does not make an unreleased candidate safe to consume by a floating range.

Before any upgrade, pin the reviewed artifact/revision, read its [changelog](../CHANGELOG.md) and [migration](MIGRATION.md), run the same consumer fixture against old and new inputs, and retain the old lockfile/artifact for rollback. Source candidate tests, remote resolution, release and product acceptance remain separate evidence.

The working-tree style addition is unreleased and absent from v0.1.1. It is an additive minor-release candidate, preserves old colors and APIs, and retains data-only platform floors. Style source schema is 1.0.0, independent of color/registry schemas. Use reviewed exact-commit candidate evidence before any separately authorized version assignment; do not claim v0.1.1 provides styles.

Strata color families are additive unreleased data for a proposed 0.2.0 candidate. No old ID, value, brand or series changes. Exact candidate mirror tests do not establish released-dependency resolution.
