# Executable examples

All data is synthetic. There is no UI/demo, business repository, network service or product adoption in these fixtures. These are complete runnable sources, not pseudocode.

| Fixture | Coverage | Run |
|---|---|---|
| [JS data](../examples/data/usage.mjs) | Light/dark, valid/invalid IDs, brand-independent identity across sorting/filtering | `node examples/data/usage.mjs` in source or installed package |
| [TS data](../examples/data/usage.ts) | Strict public API typing, expected compile-time invalid-ID rejection, emitted runtime checks | Installed-artifact recipe in [integration](INTEGRATION.md#npm-artifact) |
| [Swift data](../examples/data/swift/Sources/TokenExample/main.swift) | Public DesignTokens product, both modes/brands, typed error, stable series | Source harness: `npm run test:swift-consumer -- <full-local-SHA>` |
| [Migration](../examples/data/migration.mjs) with [legacy fixture](../examples/data/legacy-colors.json) | Synthetic local adapter v0 to semantic bindings, equality and rollback | `node examples/data/migration.mjs` |

Provider maintainer commands: `npm run test:ai-checker` tests the checker against synthetic packages before use; `npm run check:ai` checks source linkage; `npm run test:contract` packs and installs a fresh artifact, checks it, compiles/runs shipped examples and tests deliberately damaged copies. Each command must exit zero. Existing `npm run test:pack` separately runs installed CSS in a real browser; neither is visual acceptance.

The source contract harness prepares test-only tools with offline `npm ci` from
the provider's exact manifest/lockfile, then installs the real token tarball and
checks that locked tool versions, resolved URLs and integrities remain unchanged.
Run the root `npm ci` first to cache the locked tarball bytes; package-index
metadata is not required. `node --test tests/contract-pack-offline.test.mjs`
repeats the actual harness with a new cache containing only integrity-verified
locked tarball content, and proves Ajv metadata is absent before and after.
Missing locked tarball bytes fail rather than enabling a network fallback.

The contract harness retains a tarball, SHA-256, installed consumer and JSON receipt in a unique temporary directory (or beneath `TOKENS_EVIDENCE_DIR`). The Swift harness does the same for the exact local Git resolution. Neither uses remote fetch/publish. Provider harness scripts are source-development tools, not npm runtime entry points; only the bounded checker is shipped for consumer tooling.
