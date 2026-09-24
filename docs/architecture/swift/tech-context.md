---
layer: Swift
owns:
  - Sources/**
  - tests/DesignTokensTests/**
  - examples/data/swift/**
  - Package.swift
depends_on: [Tokens]
gate:
  build: swift build
  test: swift test
  consumer: bash -c 'npm run test:swift-consumer -- "$(git rev-parse HEAD)"'
red_lines:
  - The DesignTokens target never imports UIKit, AppKit or SwiftUI; Foundation only.
  - GeneratedColors.swift comes from the Tokens generator; never edit it by hand.
  - Public values are immutable Sendable data; no native Color objects.
---

# Swift

SwiftPM package `DesignSystem`, product and module `DesignTokens`, declared
floors iOS 15 / macOS 12 / watchOS 8 (data only). Tests live in
`tests/DesignTokensTests` (explicit test target path).

The `consumer` gate resolves `examples/data/swift` as an external package
against a bare Git mirror of the exact committed `HEAD` (not a path
dependency) and checks that the resolved `ai/` documents match that commit.
It needs a clean working tree, so commit before running it.

Platform coverage beyond the macOS host is declared, not tested; see
[compatibility](../../compatibility.md).
