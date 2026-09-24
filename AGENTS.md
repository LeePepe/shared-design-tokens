# AGENTS.md — shared-design-tokens

Platform-neutral, pinned color data (`@leepepe/design-tokens` npm package and
`DesignTokens` SwiftPM product); no UI. Every agent that edits this repository
follows the protocol below. Tool-specific files (CLAUDE.md etc.) only point here.

## Read first

1. `docs/constitution.md` — non-negotiable provider invariants
2. `docs/architecture/tech-context.md` — layer table: layer → paths → depends_on
3. The leaf `tech-context.md` of every layer you touch (`Tokens`, `Swift`)
4. Feature intent and acceptance: `specs/001-shared-colors/`; consumer-facing
   contract: `ai/README.md` (it ships with every release)

## Protocol

Follow `LeePepe/shared-ci@761fe6b0b3ca5e2c57d244182d495ab8041851fa/ai/agent-protocol.md`
(https://github.com/LeePepe/shared-ci/blob/761fe6b0b3ca5e2c57d244182d495ab8041851fa/ai/agent-protocol.md).
It must be the same SHA as the `uses:` pins in `.github/workflows/`.

## Verify

```sh
git config core.hooksPath .githooks   # once per clone
scripts/ci/setup.sh                   # Node 22 + npm ci (Chrome/Chromium and Swift 6 must be installed)
scripts/verify                        # contract checks + changed layers vs origin/main (what pre-push runs)
scripts/verify --all                  # contract checks + every layer (what CI runs)
scripts/verify --layer Tokens         # one layer
```

The Swift `consumer` gate verifies the exact committed `HEAD`, so commit before
running it. Never `--no-verify`, never weaken or skip tests, never edit
policy/gates to pass.

## Required checks

Merging to `main` requires (target ruleset; applying it is an Owner step):

- `quality / aggregate`

`quality / aggregate` fails unless every lane of the shared-ci quality gate
passed on the PR head: `scripts/verify --all` on macOS, the Tokens layer on
Linux, contract audit, workflow-lint and the PR-body check.

## Red lines

- Color data only: the Swift target never imports UIKit, AppKit or SwiftUI; no
  business data, screens, services or native components here. Native UI lives
  in `LeePepe/shared-design-system`, which consumes this package by exact version.
- `tokens/colors.json` is the only editable color authority; generated files
  (`dist/`, `GeneratedColors.swift`) are reproducible and never hand-tuned.
- Unknown IDs, missing modes, invalid colors or references and generation drift
  fail closed; no silent fallbacks.
- Basalt stays the Web theme authority; this package emits only `--lp-*`
  variables under explicit selectors. Third-party attribution travels with
  derived values (`THIRD_PARTY_NOTICES.md`).
- Releases are immutable semver tags with release notes and external-consumer
  evidence (shared-ci W5). No npm registry publication without separate Owner
  authorization; `package.json` stays `private`.
- Non-public project configuration never enters git: keep it in a gitignored
  local file with a committed `.example` template.
- No personal account names, credential-profile paths or local home paths in the repo.

Approved exceptions:

- No `codex-review-target` review caller: this repository has no self-hosted
  review runner (S7 rollout decision). The required list above omits
  `codex-review-target / codex-review` until one exists.

## Dependencies

- `shared-ci` `761fe6b0b3ca5e2c57d244182d495ab8041851fa` — https://github.com/LeePepe/shared-ci/blob/761fe6b0b3ca5e2c57d244182d495ab8041851fa/ai/

Runtime dependencies: none. Dev tools are exact pins in `package-lock.json`.

## Delivery

- One task → one branch + worktree → one PR using `.github/pull_request_template.md`.
- Done = required checks green on the PR head SHA; a new push invalidates old evidence.
- CODEOWNERS paths (`.github/**`, `.githooks/**`, AGENTS.md, constitution,
  tech-context, `scripts/verify`, manifests and lockfiles) need Owner approval;
  until enforced, add the `owner-review` label.
- Public API, schema or contract changes update `ai/` and `CHANGELOG.md` in
  the same PR; breaking changes also update `ai/MIGRATION.md`.
