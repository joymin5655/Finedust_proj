//
//  Constants.swift
//  AirLens
//
//  App-wide constants (PRD specifications)
//

import Foundation
import SwiftUI

// MARK: - App Constants
enum AppConstants {
    static let appName = "AirLens"
    static let version = "1.0.0"
    static let buildNumber = "1"

    // PRD Performance Targets
    static let targetLocationLockTime: TimeInterval = 10.0 // AC-1
    static let targetInferenceTime: TimeInterval = 2.0 // AC-2
    static let targetEndToEndTime: TimeInterval = 10.0 // AC-2
    static let targetFPS: Int = 60 // AC-4

    // Memory Limits (PRD)
    static let maxCameraMemory: Int = 200 * 1024 * 1024 // 200MB
    static let maxGlobeMemory: Int = 500 * 1024 * 1024 // 500MB

    // Battery Target (PRD)
    static let maxBatteryPerPrediction: Double = 0.02 // 2%

    // Data Limits
    static let maxStations: Int = 30_000 // PRD: 30k+ stations
    static let maxHistoryCount: Int = 50 // PRD: up to 50 predictions
    static let topFramesCount: Int = 15 // PRD: top 15 frames
    static let featureDimension: Int = 576 // PRD: 576-dim features

    // Cache TTL
    static let stationCacheTTL: TimeInterval = 600 // 10 min
    static let satelliteCacheTTL: TimeInterval = 10800 // 3 hours
    static let policyCacheTTL: TimeInterval = 2592000 // 30 days

    // Network
    static let requestTimeout: TimeInterval = 30.0
    static let maxRetries: Int = 3
}

// MARK: - API Endpoints
enum APIEndpoints {
    static let baseURL = "https://api.airlens.app/v1"
    static let stations = "/stations"
    static let policies = "/policies"
    static let satellite = "/satellite/aod"
}

// MARK: - PM2.5 Thresholds (EPA Standard)
enum PM25Thresholds {
    static let good: ClosedRange<Double> = 0.0...12.0
    static let moderate: ClosedRange<Double> = 12.1...35.4
    static let unhealthy: ClosedRange<Double> = 35.5...55.4
    static let veryUnhealthy: ClosedRange<Double> = 55.5...150.4
    static let hazardous: ClosedRange<Double> = 150.5...500.0
}

// MARK: - Colors
enum AppColors {
    // AQI Colors (EPA Standard)
    static let aqiGood = Color(hex: "00E400")
    static let aqiModerate = Color(hex: "FFFF00")
    static let aqiUnhealthy = Color(hex: "FF7E00")
    static let aqiVeryUnhealthy = Color(hex: "FF0000")
    static let aqiHazardous = Color(hex: "8F3F97")

    // Color-blind friendly palette (PRD)
    static let aqiGoodCB = Color(hex: "009E73")
    static let aqiModerateCB = Color(hex: "F0E442")
    static let aqiUnhealthyCB = Color(hex: "E69F00")
    static let aqiVeryUnhealthyCB = Color(hex: "D55E00")
    static let aqiHazardousCB = Color(hex: "CC79A7")

    // App Theme
    static let primary = Color.blue
    static let secondary = Color.cyan
    static let accent = Color.green
    static let background = Color.black
}

// MARK: - Accessibility
enum AccessibilityConstants {
    static let minimumTapTargetSize: CGFloat = 44.0 // Apple HIG
    static let preferredDynamicTypeSize: UIContentSizeCategory = .large
    static let highContrastRatio: Double = 7.0 // WCAG AAA

    // VoiceOver labels
    static let globeViewLabel = "3D globe showing air quality stations worldwide"
    static let cameraViewLabel = "Camera view for AI-powered air quality prediction"
    static let policyViewLabel = "Environmental policies by country"
    static let statsViewLabel = "Air quality statistics and trends"
}

// MARK: - Notifications
enum NotificationConstants {
    static let aqiAlert = "com.airlens.notification.aqi_alert"
    static let policyUpdate = "com.airlens.notification.policy_update"
    static let predictionComplete = "com.airlens.notification.prediction_complete"
}

// MARK: - User Defaults Keys
enum UserDefaultsKeys {
    static let hasCompletedOnboarding = "hasCompletedOnboarding"
    static let enableNotifications = "enableNotifications"
    static let enableHaptics = "enableHaptics"
    static let dataRefreshInterval = "dataRefreshInterval"
    static let cachedStations = "cached_stations"
    static let cachedPolicies = "cached_policies"
    static let predictionHistory = "prediction_history"
    static let useColorBlindPalette = "useColorBlindPalette"
}

// MARK: - Haptic Feedback
enum HapticFeedback {
    static func success() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }

    static func warning() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.warning)
    }

    static func error() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.error)
    }

    static func impact(style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.impactOccurred()
    }
}

// MARK: - Color Extension
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
            (a, r, g, b) = (255, 0, 0, 0)
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
