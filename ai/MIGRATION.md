# Migration and rollback

## Synthetic local adapter v0 to 0.1.0

This first migration is a declared synthetic teaching fixture, not an inventory of any product's old colors. [legacy-colors.json](../examples/data/legacy-colors.json) is the fixed `synthetic-local-colors-v0` baseline: explicit light/dark foreground/canvas values and two stable local series keys. [migration.mjs](../examples/data/migration.mjs) implements the old local lookup, the semantic-token adapter, expected-behavior comparisons, and rollback. It uses only the public npm API.

1. Pin `0.1.0` exactly (npm tarball from tag `v0.1.0`, or Swift `exact: "0.1.0"`), keeping the old fixture/config available. Preconditions: explicit light/dark, immutable synthetic identity keys and no unknown legacy roles.
2. Map local foreground/canvas roles to `product.text.primary` / `product.surface.canvas`; map synthetic alpha/beta identities to `product.series.cobalt` / `product.series.rose`. These are adapter bindings, not provider rename aliases.
3. Keep series assignments keyed by identity while sorting/filtering; switch theme and brand independently. Let missing keys/roles fail instead of adopting a fallback.
4. Run the migration fixture: compare explicit expected RGBA to both adapters in both modes, verify identity under both brands and ordering, and exercise invalid role/key failures. Exit 0 and the printed assertion count are acceptance evidence for this synthetic path only.
5. Roll back by selecting the preserved local adapter and rerunning the same expected comparisons. For a real consumer, restore the prior reviewed dependency/lockfile and adapter together and run its own tests before removing the dependency.

No state is persisted or transformed; rollback in this fixture is fully reversible. It does not establish reversibility for product databases, old OS-theme inference or differently valued legacy palettes. A product with different values requires its own approved mapping and visual/behavioral acceptance; do not silently change its expected output to make this fixture pass.

## Candidate.0 or candidate.1 to 0.1.0

Runtime/color data is unchanged. Replace the candidate revision pin with the exact `0.1.0` release (Swift: `exact: "0.1.0"`, package identity `shared-design-tokens`), update matching contract docs, then run artifact and consumer checks. There are no token deprecations, renames or fallback aliases. Roll back to the exact candidate.0 artifact/revision and matching docs; candidate.1-specific contract tooling will no longer be available there. See [changelog](../CHANGELOG.md) and [existing provider rollback](../docs/compatibility.md#rollback).
