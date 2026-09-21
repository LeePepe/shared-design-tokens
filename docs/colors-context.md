# Colors context
- layer: colors
- gate_tier: local-fast (Node + installed headless Chrome/Chromium); Swift compile/test also run in CI
- depends_on: none (audited Basalt data snapshot, not runtime dependency)
- paths: tokens/**, scripts/**, dist/**, Sources/**, .github/**, package.json, package-lock.json, Package.swift
- test_paths: tests/** (Swift test target explicitly uses tests/DesignTokensTests)
- roles: source, validator, generator, consumer-test
- owns: JSON source/schema, pinned upstream snapshot, JS/TS/CSS generation, Swift data API and tests
- gates: `npm test` (includes `npm run test:browser`, real CSSOM/computed-style, browser required); `npm run generate:check`; `npm run test:consumer`; `npm run test:pack`; `swift build`; `swift test`
- red lines: constitution applies; do not introduce UI imports or upstream-style global CSS overrides.
Future NativeDesignKit may be a separate target depending on DesignTokens, with platform-specific UI implementations. That target is not present.
