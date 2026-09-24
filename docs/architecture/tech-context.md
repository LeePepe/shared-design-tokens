---
# Root layer map (repo-kit format). Every tracked path resolves to exactly one
# layer (leaf `owns`) or one `support` exclusion; `scripts/context/audit` checks it.
layer: _root
support:
  - patterns: ["*.md", ".gitignore", "docs/**", "specs/**", ".github/**", ".githooks/**", "scripts/verify", "scripts/ci/**"]
    reason: documentation, specs and CI wiring; checked by the contract audit and workflow-lint, not a layer gate
red_lines:
  - Dependencies point only in the direction listed in the table below.
  - The package ships color data only; no UI framework imports and no business data.
---

# shared-design-tokens tech context

| Layer | Responsibility | tech-context | depends_on |
|---|---|---|---|
| Tokens | Color source and schema, generator, JS/TS/CSS/JSON artifacts, AI contract, Node tests | `docs/architecture/tokens/tech-context.md` | (none) |
| Swift | `DesignTokens` SwiftPM data target, XCTest, Swift consumer fixture | `docs/architecture/swift/tech-context.md` | Tokens |

`Swift` depends on `Tokens` as data: `Sources/DesignTokens/GeneratedColors.swift`
is written by the Tokens generator and checked by its `generate:check` gate, and
the Swift consumer harness reads the shipped `ai/` contract. Nothing in Tokens
reads Swift sources.

The Basalt snapshot in `tokens/upstream/` is audited data, not a runtime
dependency (see [upstream](../upstream.md)). Invariants live in the
[constitution](../constitution.md); platform and version policy in
[compatibility](../compatibility.md).
