//
//  Extensions.swift
//  AirLens
//
//  Utility extensions for common operations
//

import Foundation
import SwiftUI

// MARK: - Color Extensions

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }

    static func from(pm25Level: PM25Level) -> Color {
        switch pm25Level {
        case .good:
            return Color(hex: "#10b981")
        case .moderate:
            return Color(hex: "#f59e0b")
        case .unhealthyForSensitive:
            return Color(hex: "#f97316")
        case .unhealthy:
            return Color(hex: "#ef4444")
        case .hazardous:
            return Color(hex: "#8b5cf6")
        }
    }

    static func from(aqiLevel: AQILevel) -> Color {
        switch aqiLevel {
        case .good:
            return Color(hex: "#00e400")
        case .moderate:
            return Color(hex: "#ffff00")
        case .unhealthyForSensitive:
            return Color(hex: "#ff7e00")
        case .unhealthy:
            return Color(hex: "#ff0000")
        case .veryUnhealthy:
            return Color(hex: "#8f3f97")
        case .hazardous:
            return Color(hex: "#7e0023")
        }
    }

    static func from(policyCategory: PolicyCategory) -> Color {
        switch policyCategory {
        case .emissions:
            return .red
        case .monitoring:
            return .blue
        case .health:
            return .green
        case .transportation:
            return .orange
        case .industry:
            return .purple
        case .research:
            return .cyan
        case .international:
            return .indigo
        }
    }
}

// MARK: - View Extensions

extension View {
    func cardStyle() -> some View {
        self
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }

    func glassEffect() -> some View {
        self
            .background(.ultraThinMaterial)
            .cornerRadius(16)
    }
}

// MARK: - Date Extensions

extension Date {
    func timeAgo() -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }

    func formatted(style: DateFormatter.Style = .medium) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = style
        formatter.timeStyle = .none
        return formatter.string(from: self)
    }
}

// MARK: - String Extensions

extension String {
    func toDate(format: String = "yyyy-MM-dd'T'HH:mm:ss") -> Date? {
        let formatter = DateFormatter()
        formatter.dateFormat = format
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        return formatter.date(from: self)
    }

    func countryFlag() -> String {
        let base: UInt32 = 127397
        var flag = ""
        for scalar in self.uppercased().unicodeScalars {
            if let scalarValue = UnicodeScalar(base + scalar.value) {
                flag.append(String(scalarValue))
            }
        }
        return flag
    }
}

// MARK: - Double Extensions

extension Double {
    func rounded(toPlaces places: Int) -> Double {
        let divisor = pow(10.0, Double(places))
        return (self * divisor).rounded() / divisor
    }

    func formatted(decimalPlaces: Int = 1) -> String {
        String(format: "%.\(decimalPlaces)f", self)
    }
}

// MARK: - Array Extensions

extension Array where Element == ChartDataPoint {
    static func from(methodology: Methodology) -> [ChartDataPoint] {
        [
            ChartDataPoint(label: "Image", value: methodology.imageAnalysis * 100),
            ChartDataPoint(label: "Weather", value: methodology.weatherData * 100),
            ChartDataPoint(label: "History", value: methodology.historicalTrends * 100),
            ChartDataPoint(label: "Satellite", value: methodology.satelliteData * 100)
        ]
    }
}
