# Compatibility, upgrades and rollback

## Matrix
| Surface | Declared minimum / contract | Actually verified locally |
|---|---|---|
| Generator / tests | Node >=22; exact Ajv 8.17.1 and TypeScript 5.9.3 dev tools | Node 25.8.1, npm 11.11.0; locked offline clean install |
| JS consumer | ESM, no runtime or React dependencies | Packed package installed into isolated fixture and executed by Node |
| TS consumer | ESM NodeNext, strict TS | TypeScript 5.9.3 positive/negative compilation and emitted JS execution |
| Swift data | Swift tools/language 6.0; Foundation only; Sendable immutable values | Swift 6.4, arm64 macOS host build and XCTest |
| iOS | package deployment iOS 15+ | Not cross-compiled, no simulator/device/UI validation |
| macOS | package deployment macOS 12+ | Host macOS only; not tested on macOS 12 hardware |
| watchOS | package deployment watchOS 8+ (data only) | Not built/tested on watchOS |
| CSS data | Explicit light/dark; unknown boundaries invalidate owned properties | Google Chrome 153.0.8010.53 on macOS: source and installed-tgz CSSOM/computed RGBA, all tokens and scope cases; no visual/UI test |
| Linux | Read-only Node CI targets ubuntu-24.04 with fail-closed Chrome discovery | Hosted runner execution and Linux Swift not verified locally |

These are this data target's conservative declared floors, **not** consumer platform changes. VitalStride's iOS18/macOS15/watchOS11 and AIDash's Swift6.2/iOS26/macOS26 remain untouched. Declared compiler minimum 6.0 is not a claim that this machine ran Swift 6.0. No HSB conversion API exists; luminance uses actual sRGB math, not non-AppKit placeholder values.

## API / version contract
Package is private `0.1.0-candidate.0`, never published by this task. Source `schemaVersion=1.0.0` is independent from package version; unknown schema versions fail. Public strings (`product.*`, brand IDs, token IDs) are stable identities, not display labels or positions. Persist series bindings in the consumer's own data; do not rebuild them from a sorted/filtered index. Theme affects values only; brand is a separate lookup and cannot flow transitively into product.series.

In pre-1.0 candidates, consumers pin an exact reviewed commit/artifact. After stable release, removals/renames, changes to semantic meaning, field units, required platforms or API signatures require a major version. Additive IDs are minor; bug fixes that preserve meaning may be patch, but any visible color change needs review, contrast checks and native/Web parity evidence. Never reuse a retired series ID for another meaning. Deprecate aliases before removing them; no silent fallback aliasing at runtime.

## Upgrading Basalt
1. Choose an explicit published version; retain exact metadata, license, public provider/CSS evidence and byte hashes. Review public exports rather than relying on private source paths.
2. Update pinned schema/upstream metadata and source provenance together; convert and inspect only intended foundation values, not a wholesale theme copy. Review ID/value diffs and contrast pairs.
3. Run all documented gates and parent spec + quality review. Keep brand/series mappings stable. Do not auto-adopt upstream chart-N ordering.
4. Create a separately authorized release; coordinate adapter/UI consumer validation independently.

## Rollback
Pin consumers to the previous reviewed exact commit/artifact; restore that revision's source, schema, provenance and generated outputs as one unit and rerun checks. Never repair a rollback by editing generated CSS or Swift alone. This candidate made no consumer changes, so there is no deployed migration to undo.

## Explicitly deferred
NativeDesignKit/UI targets, Web React adapter, business migration, persisted assignment store, simulator/device/UI/visual/a11y certification, full recursive layer resolver/hooks/anti-corruption machinery, online branch/ruleset required enforcement and publication. CI file existence is not CI execution or merge protection. MY-1569 native planning must not concurrently modify this color candidate's root manifest/source/schema/generator/API.
