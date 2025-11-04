//
//  Extensions.swift
//  Finedust
//
//  Useful extensions
//

import Foundation
import SwiftUI
import CoreLocation

extension Color {
    static func aqiColor(for pm25: Double) -> Color {
        switch pm25 {
        case 0...12: return .green
        case 12...35: return .yellow
        case 35...55: return .orange
        case 55...150: return .red
        case 150...: return .purple
        default: return .gray
        }
    }
}

extension Double {
    func toPM25String() -> String {
        "\(Int(self)) μg/m³"
    }
    
    func toPercentString() -> String {
        "\(Int(self * 100))%"
    }
    
    func rounded(toPlaces places: Int) -> Double {
        let divisor = pow(10.0, Double(places))
        return (self * divisor).rounded() / divisor
    }
    
    func toAQILevel() -> String {
        switch self {
        case 0...12: return "Good"
        case 12...35: return "Moderate"
        case 35...55: return "Unhealthy for Sensitive"
        case 55...150: return "Unhealthy"
        case 150...: return "Very Unhealthy"
        default: return "Unknown"
        }
    }
}

extension Date {
    func toRelativeString() -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }
    
    func toShortString() -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: self)
    }
    
    func isWithin(minutes: Int) -> Bool {
        let now = Date()
        let timeInterval = now.timeIntervalSince(self)
        return timeInterval < Double(minutes * 60)
    }
}

extension CLLocationCoordinate2D {
    func distance(to other: CLLocationCoordinate2D) -> Double {
        let location1 = CLLocation(latitude: self.latitude, longitude: self.longitude)
        let location2 = CLLocation(latitude: other.latitude, longitude: other.longitude)
        return location1.distance(from: location2) / 1000.0
    }
    
    func toCoordinateString() -> String {
        "\(String(format: "%.4f", latitude)), \(String(format: "%.4f", longitude))"
    }
}

extension View {
    @ViewBuilder
    func `if`<Transform: View>(_ condition: Bool, transform: (Self) -> Transform) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
}

extension Array where Element == Double {
    func average() -> Double {
        guard !isEmpty else { return 0 }
        return reduce(0, +) / Double(count)
    }
    
    func standardDeviation() -> Double {
        guard count > 1 else { return 0 }
        let avg = average()
        let variance = map { pow($0 - avg, 2) }.reduce(0, +) / Double(count - 1)
        return sqrt(variance)
    }
}

extension String {
    var localized: String {
        NSLocalizedString(self, comment: "")
    }
    
    func truncated(to length: Int, trailing: String = "...") -> String {
        if self.count > length {
            return String(self.prefix(length)) + trailing
        } else {
            return self
        }
    }
}
