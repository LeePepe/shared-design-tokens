# Compatibility

This contract is for version `0.2.0` (immutable Git tag `v0.2.0` after release verification), registry schema `1.0.0`, token schema `1.0.0`. npm and Swift share the tag: npm consumers install the tarball built from it, Swift consumers pin `exact: "0.2.0"`. Package, token-schema and registry-schema versions are distinct.

The authoritative [platform and toolchain matrix](../docs/compatibility.md#matrix) separates declared floors from actual local verification. 0.2.0 preserves existing color values and lookup APIs while adding styles and five Strata families. The checker uses Ajv only as a development dependency, not runtime.

The existing [version policy](../docs/compatibility.md#api--version-contract) owns breaking/additive changes. No token IDs are deprecated or renamed in this release and no alias API exists. A future removal needs an explicit deprecation/migration proposal and compatibility evidence; there is no promised time-based candidate support window. Stable-release major/minor policy does not make an unreleased candidate safe to consume by a floating range.

Before any upgrade, pin the reviewed artifact/revision, read its [changelog](../CHANGELOG.md) and [migration](MIGRATION.md), run the same consumer fixture against old and new inputs, and retain the old lockfile/artifact for rollback. Source candidate tests, remote resolution, release and product acceptance remain separate evidence.

Version 0.2.0 adds platform-neutral styles and explicit Strata palettes, preserves
legacy brands/series and data-only platform floors. Source style/color schemas
remain 1.0.0. The last earlier immutable release v0.1.1 has neither addition.
Source candidate tests and local mirror resolution remain distinct from verified
remote tag/artifact consumption; consult release notes for final evidence.
