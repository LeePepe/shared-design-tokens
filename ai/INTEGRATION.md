# Integration

## npm artifact

Prerequisites: Node >=22, npm, and the release tarball built from tag `v0.1.0` (`npm pack` in a checkout of that tag) plus its SHA-256 from the release notes. There is no npm registry publication. Verify its digest against the handoff before installing; a matching version string alone does not authenticate bytes. The runtime has no dependencies, permissions or install hooks. Development-only checker and TS execution require exact Ajv 8.17.1 and TypeScript 5.9.3.

Commands below are executable recipes after replacing `<release.tgz>` with that verified local file; they are not registry-publication instructions. Start in an empty disposable consumer directory:

```sh
npm init -y
npm install --ignore-scripts --no-audit --no-fund --save-exact /path/to/<release.tgz>
npm install --ignore-scripts --no-audit --no-fund --save-dev --save-exact ajv@8.17.1 typescript@5.9.3
node node_modules/@leepepe/design-tokens/scripts/check-ai-contract.mjs --root node_modules/@leepepe/design-tokens --expected-name @leepepe/design-tokens --expected-version 0.1.0
node node_modules/@leepepe/design-tokens/examples/data/usage.mjs
node node_modules/@leepepe/design-tokens/examples/data/migration.mjs
node node_modules/typescript/bin/tsc --strict --target ES2022 --module NodeNext --moduleResolution NodeNext --outDir node_modules/@leepepe/design-tokens/examples/data/compiled node_modules/@leepepe/design-tokens/examples/data/usage.ts
node node_modules/@leepepe/design-tokens/examples/data/compiled/usage.js
```

Expect checker JSON `ok: true`, no errors, exit 0; each fixture prints PASS. Locate the entry at `node_modules/@leepepe/design-tokens/ai/README.md` and cross-check the installed manifest/registry version against your lockfile. Keep the original installed contract unchanged; emitted JS is a disposable build output. In a real TS project, copy the fixture into the consumer's source tree and compile with its own pinned toolchain.

Uninstall: first remove imports, scoped CSS references and dependent code, then `npm uninstall @leepepe/design-tokens`; verify the consumer build and lockfile. Rollback is [explicit](MIGRATION.md), not a change to generated provider files.

## Swift revision

Swift tools 6.0+; public product `DesignTokens`. Pin the release tag exactly, never a branch or range: `.package(url: "https://github.com/LeePepe/shared-design-tokens.git", exact: "0.1.0")`, with `.product(name: "DesignTokens", package: "shared-design-tokens")`. The release notes record the tag's commit SHA and the external-consumer evidence.

The runnable [external fixture manifest](../examples/data/swift/Package.swift) instead consumes a local Git URL with an exact revision. Its dependency identity `tokens-provider` belongs to the fixture's local bare mirror, not a renamed remote. From a clean, committed source checkout run `npm run test:swift-consumer -- <full-local-SHA>`. The harness retains its mirror, `Package.resolved`, actual dependency checkout and output receipt outside the source tree. It asserts resolution equals the requested SHA, compares registry/docs bytes to that Git revision and runs the external executable against the public product. No source-path dependency or copying of provider sources is used.

Read the actual resolved checkout's `ai/README.md` and registry (under the consumer's `.build/checkouts`, as identified by its resolution receipt). Source docs are not App resources. Remove the product from target dependencies and the package from the consumer manifest to uninstall; resolve and build again. No platform deployment setting is changed by this provider phase.

## Contract failures

The [checker](../scripts/check-ai-contract.mjs) is a development tool; run it with Ajv available, separately from runtime consumption. The installed fixture proves it and all its inspected inputs are available without a provider source checkout. It emits `{ok, errors: [{id, path, message, repair}]}` and exit 1 on contract failure; use the diagnostic path and restore the exact reviewed artifact before retrying.

| Stable ID family | Repair |
|---|---|
| `AI_INPUT`, `AI_ROOT` | Supply an available root and explicit exact name/version |
| `AI_FILE_MISSING`, `AI_JSON`, `AI_JSON_SHAPE` | Restore readable, valid object-root JSON/prerequisites |
| `AI_PACKAGE_IDENTITY`, `AI_VERSION_MISMATCH` | Reconcile lockfile, manifest and registry; never fall back to latest |
| `AI_REGISTRY_SCHEMA`, `AI_SCHEMA_DRIFT`, `AI_TOKEN_SCHEMA` | Use this checker/schema version and compatible token schema |
| `AI_DOC_LINK`, `AI_DOC_ANCHOR`, `AI_DOC_EMPTY`, `AI_DOC_SYNTAX` | Restore portable inline links, headings and nonempty docs in the artifact |
| `AI_EXAMPLE_MISSING`, `AI_EXAMPLE_DUPLICATE` | Restore unique, runnable example entries |
| `AI_API_MISSING`, `AI_API_DRIFT`, `AI_API_SYMBOLS`, `AI_API_DUPLICATE` | Review actual API/docs, compile consumers, then explicitly update fingerprints if approved |
| `AI_EXPORT_SHAPE`, `AI_EXPORT_UNREGISTERED`, `AI_SWIFT_PRODUCT` | Restore declared public exports/product and corresponding surfaces |

Invalid color values/IDs and generation drift are tested by the existing source/runtime suites, not a general schema validator inside this checker. Unknown policy fields are rejected, but that is not Owner exception or rule-downgrade enforcement. Read [bounded checker semantics](../docs/ai-checker.md) before interpreting a pass. Fingerprints and a PR-owned registry are integrity evidence, not a trusted external policy baseline.
