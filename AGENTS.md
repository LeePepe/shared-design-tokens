# design-system — Agent index

Read [constitution](docs/constitution.md), then [root context](docs/context.md).
The constitution owns invariants; contexts own technical facts; feature specs own intent and acceptance.

| Scope | Read next |
|---|---|
| Token source, schema, generator, JS/CSS/Swift data, tests or CI | [Colors context](docs/colors-context.md) |
| Shared color feature | [Spec](specs/001-shared-colors/spec.md), [plan](specs/001-shared-colors/plan.md), [tasks](specs/001-shared-colors/tasks.md) |
| Consumer integration or upgrades | [Compatibility](docs/compatibility.md), [upstream provenance](docs/upstream.md) |
| Contract/docs, installed package integration, examples or migration | [AI task router](ai/README.md), [Colors context](docs/colors-context.md) |

## Delivery and planning

- Work only in the task's isolated worktree; keep the primary checkout on `main` and preserve other agents' work.
- Branch → independent review → PR → applicable CI → merge. No direct main push, forced history rewrite, hook bypass or unapproved package/App release.
- `DesignTokens` is data-only. Future `NativeDesignKit` belongs in an independent Apple repository consuming DesignTokens through SPM; business-repository migration is separate work. The current repository remains `LeePepe/design-system`; no rename or new repository is claimed.
- MY-1569 is the historical native-component request. Any native spec/plan/tasks and context belong to that independent Apple scope under normal review, using the actual reviewed colors API. Preserve the colors specification; NativeDesignKit is not implemented here.
- Current planning uses the versioned `specs/` documents; no `.specify` tooling is installed or claimed. Missing tooling is not missing product authorization. If additional scaffolding is necessary, propose the smallest reviewed documentation change rather than inventing an approved baseline.
- Tests and platform coverage live in the colors context and compatibility document. The documented single-leaf route is not a machine-verified recursive resolver; CI configuration is not proof of remote required-check enforcement.

## Before writing

- Before pushing or opening a PR, verify the actual fetch/push URL and target repository; ask the Owner about any remote of unclear ownership.
- Account and credential selection is owned by the Owner's private agent configuration and, per Owner decision, is not kept in this repository. Before writing, confirm the authenticated account has the required permission on the target repository; if that cannot be verified or does not match, stop and report instead of falling back to an environment token or another account.
