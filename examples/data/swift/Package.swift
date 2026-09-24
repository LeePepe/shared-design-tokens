// swift-tools-version: 6.0
import PackageDescription
import Foundation

// Executed by the provider harness with a local bare Git repository and full SHA.
guard let repository = ProcessInfo.processInfo.environment["TOKENS_REPOSITORY_URL"],
      let revision = ProcessInfo.processInfo.environment["TOKENS_REVISION"],
      revision.range(of: "^[a-f0-9]{40}$", options: .regularExpression) != nil else {
    fatalError("Supply TOKENS_REPOSITORY_URL and a full TOKENS_REVISION; no floating fallback")
}
let package = Package(
    name: "TokenExample",
    platforms: [.macOS(.v12)],
    dependencies: [.package(url: repository, revision: revision)],
    targets: [.executableTarget(name: "TokenExample", dependencies: [
        .product(name: "DesignTokens", package: "tokens-provider")
    ])]
)
