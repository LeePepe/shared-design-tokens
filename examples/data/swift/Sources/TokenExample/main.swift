import DesignTokens

enum ExampleFailure: Error { case assertion }
var assertions = 0
@MainActor func check(_ condition: Bool) throws {
    guard condition else { throw ExampleFailure.assertion }
    assertions += 1
}
let bindings = ["synthetic-alpha": "product.series.cobalt", "synthetic-beta": "product.series.rose"]
for theme in Theme.allCases {
    try check(DesignTokens.color("product.text.primary", theme: theme).a == 1)
    for brand in DesignTokens.brandIDs {
        try check(DesignTokens.brandColor(brand, role: .accent, theme: theme).a == 1)
        for keys in [bindings.keys.sorted(), bindings.keys.sorted().reversed().map { $0 }, ["synthetic-beta"]] {
            for key in keys {
                let series = try DesignTokens.seriesColor(key, bindings: bindings, theme: theme)
                try check(series.id == bindings[key])
                try check(series.color == DesignTokens.color(series.id, theme: theme))
            }
        }
    }
}
try check(DesignTokens.color("product.text.primary", theme: .light) != DesignTokens.color("product.text.primary", theme: .dark))
do {
    _ = try DesignTokens.color("invalid.synthetic.id", theme: .light)
    throw ExampleFailure.assertion
} catch TokenError.unknownToken(let id) {
    try check(id == "invalid.synthetic.id")
}
do {
    _ = try DesignTokens.seriesColor("missing-synthetic-key", bindings: bindings, theme: .dark)
    throw ExampleFailure.assertion
} catch TokenError.missingSeriesBinding(let key) {
    try check(key == "missing-synthetic-key")
}
try check(StyleTokens.spacing("spacing.lg") == 16)
try check(StyleTokens.typography("typography.body").size == 17)
try check(StyleTokens.curve("curve.standard").x1 == 0.2)
let shadow = try StyleTokens.shadow("shadow.small")
try check(DesignTokens.color(shadow.colorToken, theme: .light).a == 1)
do {
    _ = try StyleTokens.spacing("radius.small")
    throw ExampleFailure.assertion
} catch StyleTokenError.unknownToken(let id) {
    try check(id == "radius.small")
}
print("PASS Swift data: \(assertions) assertions")
