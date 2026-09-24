---
layer: Tokens
owns:
  - tokens/**
  - dist/**
  - ai/**
  - scripts/*.mjs
  - tests/*.mjs
  - tests/consumer/**
  - examples/data/*.mjs
  - examples/data/*.ts
  - examples/data/*.json
  - package.json
  - package-lock.json
depends_on: []
gate:
  test: npm test
  generate: npm run generate:check
  consumer: npm run test:consumer
  pack: npm run test:pack
  ai: npm run check:ai
  contract: npm run test:contract
red_lines:
  - tokens/colors.json is the only editable color authority; generated files are never hand-edited.
  - Unknown IDs, missing modes, invalid colors or references and generation drift fail closed.
  - CSS is exclusively --lp-* variables under explicit data-lp-theme selectors; no global or Basalt overrides.
  - The runtime package has zero dependencies; Ajv and TypeScript stay dev-only.
---

# Tokens

Source of truth, validation, generation and the shipped AI contract for
`@leepepe/design-tokens`.

- **Source:** `tokens/colors.json` against `tokens/schema.json`; audited
  upstream snapshot in `tokens/upstream/`.
- **Generator:** `scripts/generate.mjs` (with `scripts/source.mjs`) writes
  `dist/` and `Sources/DesignTokens/GeneratedColors.swift`; `generate:check`
  fails on drift.
- **Contract:** `ai/` travels with the package; `scripts/check-ai-contract.mjs`
  is the bounded checker ([scope](../../ai-checker.md)).
- **Tests:** `tests/*.test.mjs`. `npm test` includes the real Chrome CSSOM
  suite (`scripts/browser-css.mjs` fails closed without Chrome/Chromium or a
  valid `CHROME_BIN`). Pack, consumer and contract harnesses install the real
  tarball into disposable consumers.
- **Toolchain:** Node >=22 (CI pins Node 22), exact Ajv 8.17.1 and
  TypeScript 5.9.3 dev tools.

Run one gate: `scripts/context/run Tokens --gate test` (through
`scripts/verify --layer Tokens`).
