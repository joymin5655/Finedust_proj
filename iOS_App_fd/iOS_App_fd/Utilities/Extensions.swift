//
//  Extensions.swift
//  AirLens
//
//  Useful extensions
//

import Foundation
import SwiftUI

// MARK: - Date Extensions
extension Date {
    func timeAgo() -> String {
        let calendar = Calendar.current
        let now = Date()
        let components = calendar.dateComponents([.second, .minute, .hour, .day, .weekOfYear, .month, .year], from: self, to: now)

        if let year = components.year, year >= 1 {
            return "\(year) year\(year == 1 ? "" : "s") ago"
        }
        if let month = components.month, month >= 1 {
            return "\(month) month\(month == 1 ? "" : "s") ago"
        }
        if let week = components.weekOfYear, week >= 1 {
            return "\(week) week\(week == 1 ? "" : "s") ago"
        }
        if let day = components.day, day >= 1 {
            return "\(day) day\(day == 1 ? "" : "s") ago"
        }
        if let hour = components.hour, hour >= 1 {
            return "\(hour) hour\(hour == 1 ? "" : "s") ago"
        }
        if let minute = components.minute, minute >= 1 {
            return "\(minute) minute\(minute == 1 ? "" : "s") ago"
        }
        if let second = components.second, second >= 3 {
            return "\(second) seconds ago"
        }

        return "just now"
    }

    func formatted(_ style: DateFormatter.Style = .medium) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = style
        formatter.timeStyle = .short
        return formatter.string(from: self)
    }
}

// MARK: - Double Extensions
extension Double {
    func rounded(toPlaces places: Int) -> Double {
        let divisor = pow(10.0, Double(places))
        return (self * divisor).rounded() / divisor
    }

    var formattedPM25: String {
        String(format: "%.1f", self)
    }

    var formattedPercentage: String {
        String(format: "%.0f%%", self * 100)
    }
}

// MARK: - Array Extensions
extension Array where Element == Double {
    var average: Double {
        guard !isEmpty else { return 0 }
        return reduce(0, +) / Double(count)
    }

    var standardDeviation: Double {
        guard count > 1 else { return 0 }
        let avg = average
        let variance = map { pow($0 - avg, 2) }.reduce(0, +) / Double(count)
        return sqrt(variance)
    }
}

// MARK: - View Extensions
extension View {
    /// Apply haptic feedback
    func hapticFeedback(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) -> some View {
        self.onTapGesture {
            HapticFeedback.impact(style: style)
        }
    }

    /// Accessibility-enhanced tap target
    func accessibleTapTarget(label: String, hint: String? = nil) -> some View {
        self
            .frame(minWidth: AccessibilityConstants.minimumTapTargetSize,
                   minHeight: AccessibilityConstants.minimumTapTargetSize)
            .accessibilityLabel(label)
            .accessibilityHint(hint ?? "")
    }

    /// Conditional modifier
    @ViewBuilder
    func `if`<Transform: View>(_ condition: Bool, transform: (Self) -> Transform) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
}

// MARK: - String Extensions
extension String {
    var localized: String {
        NSLocalizedString(self, comment: "")
    }

    func localized(with arguments: CVarArg...) -> String {
        String(format: localized, arguments: arguments)
    }
}

// MARK: - CLLocationCoordinate2D Extensions
import CoreLocation

extension CLLocationCoordinate2D: Equatable {
    public static func == (lhs: CLLocationCoordinate2D, rhs: CLLocationCoordinate2D) -> Bool {
        lhs.latitude == rhs.latitude && lhs.longitude == rhs.longitude
    }
}

extension CLLocationCoordinate2D: Hashable {
    public func hash(into hasher: inout Hasher) {
        hasher.combine(latitude)
        hasher.combine(longitude)
    }
}

// MARK: - Task Extensions
extension Task where Success == Never, Failure == Never {
    /// Sleep for specified seconds
    static func sleep(seconds: Double) async throws {
        try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
    }
}
