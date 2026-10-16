import Foundation
import XCTest
import DesignTokens

final class DesignTokensTests: XCTestCase {
    func testKnownValuesAndEveryResolvedValue() throws {
        let file = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent("dist/resolved.json")
        let decoded = try JSONSerialization.jsonObject(with: Data(contentsOf: file)) as! [String: Any]
        let colors = decoded["colors"] as! [String: [String: [String: Double]]]
        XCTAssertEqual(DesignTokens.ids, colors.keys.sorted())
        for (id, modes) in colors {
            for theme in Theme.allCases {
                let actual = try DesignTokens.color(id, theme: theme)
                let expected = modes[theme.rawValue]!
                XCTAssertEqual(Double(actual.r), expected["r"])
                XCTAssertEqual(Double(actual.g), expected["g"])
                XCTAssertEqual(Double(actual.b), expected["b"])
                XCTAssertEqual(actual.a, expected["a"])
            }
        }
        XCTAssertEqual(try DesignTokens.color("product.text.primary", theme: .light).r, 31)
        XCTAssertEqual(try DesignTokens.color("product.text.primary", theme: .dark).r, 237)
    }

    func testNoUnknownFallback() {
        XCTAssertThrowsError(try DesignTokens.color("missing", theme: .light))
        XCTAssertThrowsError(try DesignTokens.brandColor("missing", role: .accent, theme: .light))
        XCTAssertThrowsError(try DesignTokens.seriesColor("a", bindings: [:], theme: .light))
        XCTAssertThrowsError(try DesignTokens.seriesColor("a", bindings: ["a": "brand.ocean.accent"], theme: .light))
        XCTAssertThrowsError(try DesignTokens.seriesColor("a", bindings: ["a": "product.series.missing"], theme: .light))
        XCTAssertNil(Theme(rawValue: "system"))
    }

    func testStableSeriesUnderSortFilterBrandAndTheme() throws {
        let bindings = ["a": "product.series.cobalt", "b": "product.series.rose", "c": "product.series.leaf"]
        for theme in Theme.allCases {
            for brand in DesignTokens.brandIDs {
                _ = try DesignTokens.brandColor(brand, role: .accent, theme: theme)
                for key in bindings.keys.sorted().reversed().filter({ $0 != "b" }) {
                    let series = try DesignTokens.seriesColor(key, bindings: bindings, theme: theme)
                    XCTAssertEqual(series.id, bindings[key])
                    XCTAssertEqual(series.color, try DesignTokens.color(bindings[key]!, theme: theme))
                }
            }
        }
    }

    func testRealSRGBLuminanceNotPlaceholder() throws {
        let black = try RGBA(red: 0, green: 0, blue: 0)
        let white = try RGBA(red: 255, green: 255, blue: 255)
        let red = try RGBA(red: 255, green: 0, blue: 0)
        XCTAssertEqual(black.relativeLuminance, 0, accuracy: 1e-12)
        XCTAssertEqual(white.relativeLuminance, 1, accuracy: 1e-12)
        XCTAssertEqual(red.relativeLuminance, 0.2126, accuracy: 1e-12)
        XCTAssertEqual(try black.contrast(with: white), 21, accuracy: 1e-12)
        XCTAssertNotEqual(red.relativeLuminance, 0.5)
        let transparent = try RGBA(red: 0, green: 0, blue: 0, alpha: 0.5)
        XCTAssertThrowsError(try transparent.contrast(with: white))
        for alpha in [-0.1, 1.1, Double.nan, Double.infinity] {
            XCTAssertThrowsError(try RGBA(red: 0, green: 0, blue: 0, alpha: alpha))
        }
        XCTAssertThrowsError(try RGBA(red: -1, green: 0, blue: 0))
        XCTAssertThrowsError(try RGBA(red: 0, green: 256, blue: 0))
    }
}

final class StrataColorTests: XCTestCase {
    func testFiveExplicitFamiliesAndOpaqueReadability() throws {
        let families = ["blue", "green", "pink", "yellow", "purple"]
        for mode in Theme.allCases {
            for family in families {
                let prefix = "brand.strata-\(family)."
                let primary = try DesignTokens.color(prefix + "primary", theme: mode)
                XCTAssertEqual(try DesignTokens.brandColor("strata-" + family, role: .accent, theme: mode), primary)
                let onAccent = try DesignTokens.brandColor("strata-" + family, role: .onAccent, theme: mode)
                for state in ["primary", "hover", "active"] {
                    XCTAssertGreaterThanOrEqual(try onAccent.contrast(with: DesignTokens.color(prefix + state, theme: mode)), 4.5)
                }
                let secondary = try DesignTokens.color("product.strata.text.secondary", theme: mode)
                for role in ["page", "region", "card", "inset", "hover", "selected"] {
                    XCTAssertGreaterThanOrEqual(try secondary.contrast(with: DesignTokens.color("product.strata.\(family).surface.\(role)", theme: mode)), 4.5)
                }
            }
        }
        XCTAssertEqual(try DesignTokens.color("brand.strata-blue.primary", theme: .light), try RGBA(red: 40, green: 89, blue: 188))
        XCTAssertEqual(try DesignTokens.color("product.strata.purple.surface.card", theme: .dark), try RGBA(red: 50, green: 44, blue: 60))
        XCTAssertThrowsError(try DesignTokens.brandColor("strata-orange", role: .accent, theme: .light))
    }
}
