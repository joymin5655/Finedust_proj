//
//  Colors.swift
//  AirLens
//
//  Brand colors and theme definitions
//

import SwiftUI

extension Color {
    // MARK: - Brand Colors
    static let brandGreen = Color(hex: "#30d158")
    static let brandYellow = Color(hex: "#ffd60a")
    static let brandOrange = Color(hex: "#ff9f0a")
    static let brandRed = Color(hex: "#ff453a")
    static let brandPurple = Color(hex: "#bf5af2")
    static let brandMaroon = Color(hex: "#8b0000")
    static let brandBlue = Color(hex: "#0a84ff")
    
    // MARK: - Gradient Backgrounds
    static var primaryGradient: LinearGradient {
        LinearGradient(
            colors: [Color(hex: "#4A90E2"), Color(hex: "#7B68EE")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    static var darkGradient: LinearGradient {
        LinearGradient(
            colors: [Color.black, Color(hex: "#1a1a2e")],
            startPoint: .top,
            endPoint: .bottom
        )
    }
    
    // MARK: - Helper for Hex Colors
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b, a: UInt64
        switch hex.count {
        case 6: // RGB (24-bit)
            (r, g, b, a) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF, 255)
        case 8: // ARGB (32-bit)
            (r, g, b, a) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF, (int >> 24) & 0xFF)
        default:
            (r, g, b, a) = (0, 0, 0, 255)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - AQI Level Colors
extension AQILevel {
    var swiftUIColor: Color {
        switch self {
        case .good: return .brandGreen
        case .moderate: return .brandYellow
        case .unhealthyForSensitive: return .brandOrange
        case .unhealthy: return .brandRed
        case .veryUnhealthy: return .brandPurple
        case .hazardous: return .brandMaroon
        }
    }
    
    var gradientColors: [Color] {
        switch self {
        case .good:
            return [Color.brandGreen, Color(hex: "#40e0d0")]
        case .moderate:
            return [Color.brandYellow, Color(hex: "#ffb347")]
        case .unhealthyForSensitive:
            return [Color.brandOrange, Color.brandRed]
        case .unhealthy:
            return [Color.brandRed, Color(hex: "#dc143c")]
        case .veryUnhealthy:
            return [Color.brandPurple, Color(hex: "#8b008b")]
        case .hazardous:
            return [Color.brandMaroon, Color(hex: "#4b0000")]
        }
    }
}
