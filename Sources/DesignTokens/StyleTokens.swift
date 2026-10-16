/// Unknown IDs and wrong-category requests never select a default value.
public enum StyleTokenError: Error, Equatable, Sendable {
    case unknownToken(String)
}

/// Typography lengths are logical units; adapters own scalable native/web fonts.
public struct TypographyToken: Equatable, Sendable {
    public let size: Double
    public let weight: Double
    public let lineHeight: Double
    public let tracking: Double
    public let relativeTo: String
    public let monospacedDigits: Bool
}

/// Unitless timing control points. x coordinates are in 0...1; y may overshoot.
public struct CubicBezierToken: Equatable, Sendable {
    public let x1: Double
    public let y1: Double
    public let x2: Double
    public let y2: Double
}

/// Response and blend duration are seconds; damping fraction is in (0, 1].
public struct SpringToken: Equatable, Sendable {
    public let response: Double
    public let dampingFraction: Double
    public let blendDuration: Double
}

/// No literal colors: resolve colorToken with an explicit theme using DesignTokens.color.
public struct ShadowToken: Equatable, Sendable {
    public let colorToken: String
    public let opacity: Double
    public let radius: Double
    public let x: Double
    public let y: Double
}

/// Generated platform-neutral style data, with no theme selection or UI dependencies.
public enum StyleTokens {
    public static let schemaVersion = "1.0.0"
    public static var spacingIDs: [String] { spacingTable.keys.sorted() }
    public static func spacing(_ id: String) throws -> Double {
        guard let value = spacingTable[id] else { throw StyleTokenError.unknownToken(id) }
        return value
    }
    public static var dimensionIDs: [String] { dimensionTable.keys.sorted() }
    public static func dimension(_ id: String) throws -> Double {
        guard let value = dimensionTable[id] else { throw StyleTokenError.unknownToken(id) }
        return value
    }
    public static var radiusIDs: [String] { radiusTable.keys.sorted() }
    public static func radius(_ id: String) throws -> Double {
        guard let value = radiusTable[id] else { throw StyleTokenError.unknownToken(id) }
        return value
    }
    public static var borderIDs: [String] { borderTable.keys.sorted() }
    public static func border(_ id: String) throws -> Double {
        guard let value = borderTable[id] else { throw StyleTokenError.unknownToken(id) }
        return value
    }
    public static var opacityIDs: [String] { opacityTable.keys.sorted() }
    public static func opacity(_ id: String) throws -> Double {
        guard let value = opacityTable[id] else { throw StyleTokenError.unknownToken(id) }
        return value
    }
    public static var durationIDs: [String] { durationTable.keys.sorted() }
    public static func duration(_ id: String) throws -> Double {
        guard let value = durationTable[id] else { throw StyleTokenError.unknownToken(id) }
        return value
    }
    public static var staggerIDs: [String] { staggerTable.keys.sorted() }
    public static func stagger(_ id: String) throws -> Double {
        guard let value = staggerTable[id] else { throw StyleTokenError.unknownToken(id) }
        return value
    }
    public static var typographyIDs: [String] { typographyTable.keys.sorted() }
    public static func typography(_ id: String) throws -> TypographyToken {
        guard let value = typographyTable[id] else { throw StyleTokenError.unknownToken(id) }
        return value
    }
    public static var curveIDs: [String] { curveTable.keys.sorted() }
    public static func curve(_ id: String) throws -> CubicBezierToken {
        guard let value = curveTable[id] else { throw StyleTokenError.unknownToken(id) }
        return value
    }
    public static var springIDs: [String] { springTable.keys.sorted() }
    public static func spring(_ id: String) throws -> SpringToken {
        guard let value = springTable[id] else { throw StyleTokenError.unknownToken(id) }
        return value
    }
    public static var shadowIDs: [String] { shadowTable.keys.sorted() }
    public static func shadow(_ id: String) throws -> ShadowToken {
        guard let value = shadowTable[id] else { throw StyleTokenError.unknownToken(id) }
        return value
    }
}
