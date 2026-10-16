import Foundation
import XCTest
import DesignTokens

final class StyleTokensTests: XCTestCase {
    func testScalarValuesMatchEveryResolvedSourceValue() throws {
        let values = try resolved()
        let categories: [(String, [String], (String) throws -> Double)] = [
            ("spacing", StyleTokens.spacingIDs, StyleTokens.spacing),
            ("dimension", StyleTokens.dimensionIDs, StyleTokens.dimension),
            ("radius", StyleTokens.radiusIDs, StyleTokens.radius),
            ("border", StyleTokens.borderIDs, StyleTokens.border),
            ("opacity", StyleTokens.opacityIDs, StyleTokens.opacity),
            ("duration", StyleTokens.durationIDs, StyleTokens.duration),
            ("stagger", StyleTokens.staggerIDs, StyleTokens.stagger)
        ]
        for (category, ids, lookup) in categories {
            XCTAssertEqual(ids, values.keys.filter { $0.hasPrefix(category + ".") }.sorted())
            for id in ids { XCTAssertEqual(try lookup(id), values[id] as? Double, id) }
            for invalid in ["missing", "typography.body", ""] {
                XCTAssertThrowsError(try lookup(invalid)) { error in
                    XCTAssertEqual(error as? StyleTokenError, .unknownToken(invalid))
                }
            }
        }
    }

    func testStructuredValuesMatchEveryResolvedSourceValue() throws {
        let values = try resolved()
        for id in StyleTokens.typographyIDs {
            let actual = try StyleTokens.typography(id)
            let value = try XCTUnwrap(values[id] as? [String: Any])
            XCTAssertEqual(actual.size, value["size"] as? Double)
            XCTAssertEqual(actual.weight, value["weight"] as? Double)
            XCTAssertEqual(actual.lineHeight, value["lineHeight"] as? Double)
            XCTAssertEqual(actual.tracking, value["tracking"] as? Double)
            XCTAssertEqual(actual.relativeTo, value["relativeTo"] as? String)
            XCTAssertEqual(actual.monospacedDigits, value["monospacedDigits"] as? Bool)
        }
        for id in StyleTokens.curveIDs {
            let actual = try StyleTokens.curve(id)
            let value = try XCTUnwrap(values[id] as? [String: Double])
            XCTAssertEqual(actual.x1, value["x1"])
            XCTAssertEqual(actual.y1, value["y1"])
            XCTAssertEqual(actual.x2, value["x2"])
            XCTAssertEqual(actual.y2, value["y2"])
        }
        for id in StyleTokens.springIDs {
            let actual = try StyleTokens.spring(id)
            let value = try XCTUnwrap(values[id] as? [String: Double])
            XCTAssertEqual(actual.response, value["response"])
            XCTAssertEqual(actual.dampingFraction, value["dampingFraction"])
            XCTAssertEqual(actual.blendDuration, value["blendDuration"])
        }
        for id in StyleTokens.shadowIDs {
            let actual = try StyleTokens.shadow(id)
            let value = try XCTUnwrap(values[id] as? [String: Any])
            XCTAssertEqual(actual.colorToken, value["colorToken"] as? String)
            XCTAssertEqual(actual.opacity, value["opacity"] as? Double)
            XCTAssertEqual(actual.radius, value["radius"] as? Double)
            XCTAssertEqual(actual.x, value["x"] as? Double)
            XCTAssertEqual(actual.y, value["y"] as? Double)
            for theme in Theme.allCases { _ = try DesignTokens.color(actual.colorToken, theme: theme) }
        }
    }

    func testStructuredLookupsFailClosedWithOriginalID() {
        let lookups: [(String) throws -> Void] = [
            { _ = try StyleTokens.typography($0) }, { _ = try StyleTokens.curve($0) },
            { _ = try StyleTokens.spring($0) }, { _ = try StyleTokens.shadow($0) }
        ]
        for lookup in lookups {
            for invalid in ["missing", "spacing.sm", ""] {
                XCTAssertThrowsError(try lookup(invalid)) { error in
                    XCTAssertEqual(error as? StyleTokenError, .unknownToken(invalid))
                }
            }
        }
    }

    func testValuesAreSendableAcrossActorBoundaries() async throws {
        let typography = try StyleTokens.typography("typography.body")
        let curve = try StyleTokens.curve("curve.standard")
        let spring = try StyleTokens.spring("spring.standard")
        let shadow = try StyleTokens.shadow("shadow.small")
        let sameValues = await Task.detached { () -> Bool in
            typography.size > 0 && curve.x1 >= 0 && spring.response > 0 && shadow.radius >= 0
        }.value
        XCTAssertTrue(sameValues)
    }

    private func resolved() throws -> [String: Any] {
        let file = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().appendingPathComponent("dist/styles.resolved.json")
        let decoded = try XCTUnwrap(JSONSerialization.jsonObject(with: Data(contentsOf: file)) as? [String: Any])
        return try XCTUnwrap(decoded["tokens"] as? [String: Any])
    }
}
