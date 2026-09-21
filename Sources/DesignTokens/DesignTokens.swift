import Foundation

public enum Theme: String, CaseIterable, Sendable { case light, dark }
public enum BrandRole: String, Sendable { case accent, onAccent }

public enum TokenError: Error, Equatable, Sendable {
    case unknownToken(String)
    case unknownBrand(String)
    case missingSeriesBinding(String)
    case invalidSeriesToken(String)
    case invalidRGBA
    case translucentContrast
}

/// Encoded sRGB bytes (not linear RGB, Display P3 or HSB). Alpha is 0...1.
public struct RGBA: Equatable, Sendable {
    public let r: UInt8
    public let g: UInt8
    public let b: UInt8
    public let a: Double

    public init(red: Int, green: Int, blue: Int, alpha: Double = 1) throws {
        guard (0...255).contains(red), (0...255).contains(green), (0...255).contains(blue),
              alpha.isFinite, (0...1).contains(alpha) else { throw TokenError.invalidRGBA }
        self.init(validatedR: UInt8(red), g: UInt8(green), b: UInt8(blue), a: alpha)
    }

    // Only the validated generator uses this internal initializer.
    init(validatedR: UInt8, g: UInt8, b: UInt8, a: Double) {
        self.r = validatedR; self.g = g; self.b = b; self.a = a
    }

    /// WCAG 2 relative luminance; independent of platform UI frameworks.
    public var relativeLuminance: Double {
        func linear(_ byte: UInt8) -> Double {
            let encoded = Double(byte) / 255
            return encoded <= 0.04045 ? encoded / 12.92 : pow((encoded + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
    }

    /// Requires opaque colors; caller must explicitly composite translucent colors first.
    public func contrast(with other: RGBA) throws -> Double {
        guard a == 1, other.a == 1 else { throw TokenError.translucentContrast }
        let x = relativeLuminance, y = other.relativeLuminance
        return (max(x, y) + 0.05) / (min(x, y) + 0.05)
    }
}

public struct SeriesColor: Equatable, Sendable {
    public let id: String
    public let color: RGBA
}

/// Immutable data facade. No OS theme detection, random assignment, persistence or fallback.
public enum DesignTokens {
    public static let schemaVersion = "1.0.0"
    public static let colorSpace = "srgb"
    public static var ids: [String] { table.keys.sorted() }
    public static var brandIDs: [String] { brands.keys.sorted() }
    public static var seriesIDs: [String] { ids.filter { $0.hasPrefix("product.series.") } }

    public static func color(_ id: String, theme: Theme) throws -> RGBA {
        guard let value = table[id]?[theme] else { throw TokenError.unknownToken(id) }
        return value
    }

    public static func brandColor(_ brand: String, role: BrandRole, theme: Theme) throws -> RGBA {
        guard let id = brands[brand]?[role] else { throw TokenError.unknownBrand(brand) }
        return try color(id, theme: theme)
    }

    /// Bindings are consumer-persisted identity -> semantic ID, never positions in a chart.
    public static func seriesColor(_ key: String, bindings: [String: String], theme: Theme) throws -> SeriesColor {
        guard let id = bindings[key] else { throw TokenError.missingSeriesBinding(key) }
        guard seriesIDs.contains(id) else { throw TokenError.invalidSeriesToken(id) }
        return SeriesColor(id: id, color: try color(id, theme: theme))
    }
}
