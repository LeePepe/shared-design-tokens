# Compatibility

This contract is for release `0.1.0` (Git tag `v0.1.0`), registry schema `1.0.0`, token schema `1.0.0`. npm and Swift share the tag: npm consumers install the tarball built from it, Swift consumers pin `exact: "0.1.0"`. Package, token-schema and registry-schema versions are distinct.

The authoritative [platform and toolchain matrix](../docs/compatibility.md#matrix) separates declared floors from actual local verification. 0.1.0 preserves the candidate.0/candidate.1 runtime API and generated colors. New surface: version-matched docs, registry and executable data fixtures; checker uses Ajv only as a development dependency, not runtime.

The existing [version policy](../docs/compatibility.md#api--version-contract) owns breaking/additive changes. No token IDs are deprecated or renamed in this release and no alias API exists. A future removal needs an explicit deprecation/migration proposal and compatibility evidence; there is no promised time-based candidate support window. Stable-release major/minor policy does not make an unreleased candidate safe to consume by a floating range.

Before any upgrade, pin the reviewed artifact/revision, read its [changelog](../CHANGELOG.md) and [migration](MIGRATION.md), run the same consumer fixture against old and new inputs, and retain the old lockfile/artifact for rollback. Source candidate tests, remote resolution, release and product acceptance remain separate evidence.
