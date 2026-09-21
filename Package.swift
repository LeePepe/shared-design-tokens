// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "DesignSystem",
    platforms: [.iOS(.v15), .macOS(.v12), .watchOS(.v8)],
    products: [.library(name: "DesignTokens", targets: ["DesignTokens"])],
    targets: [
        .target(name: "DesignTokens"),
        .testTarget(name: "DesignTokensTests", dependencies: ["DesignTokens"], path: "tests/DesignTokensTests")
    ]
)
// Future NativeDesignKit belongs in an independent Apple repository consuming DesignTokens via SPM.
