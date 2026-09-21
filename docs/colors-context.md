# Colors context
- layer: colors
- gate_tier: local-fast (Node + installed headless Chrome/Chromium); Swift compile/test also run in CI
- depends_on: none (audited Basalt data snapshot, not runtime dependency)
- paths: tokens/**, scripts/**, ai/**, examples/data/**, dist/**, Sources/**, .github/**, package.json, package-lock.json, Package.swift
- test_paths: tests/** (Swift test target explicitly uses tests/DesignTokensTests)
- roles: source, validator, generator, consumer-test
- owns: JSON source/schema, pinned upstream snapshot, JS/TS/CSS generation, Swift data API and tests, producer contract/index and synthetic data examples
- gates: `npm test` (includes `npm run test:browser`, real CSSOM/computed-style, browser required); `npm run generate:check`; `npm run test:consumer`; `npm run test:pack`; `npm run check:ai`; `npm run test:contract`; `swift build`; `swift test`; `npm run test:swift-consumer -- <exact-local-commit>` (clean committed candidate required)
- red lines: constitution applies; do not introduce UI imports or upstream-style global CSS overrides.
Future NativeDesignKit belongs in an independent Apple repository depending on DesignTokens via SPM. No Apple component target or new repository is created here. For installed artifact checks and their limits, read [checker scope](ai-checker.md) and the [task router](../ai/README.md).
