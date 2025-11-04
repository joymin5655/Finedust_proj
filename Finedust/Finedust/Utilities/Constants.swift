//
//  Constants.swift
//  Finedust
//
//  Global constants
//

import Foundation
import SwiftUI

enum AppConstants {
    static let appName = "AirLens"
    static let version = "2.0"
    static let buildNumber = "1"
}

enum APIConstants {
    static let waqiAPIKey = "demo"
    static let waqiBaseURL = "https://api.waqi.info"
    static let requestTimeout: TimeInterval = 30
    static let resourceTimeout: TimeInterval = 60
}

enum ModelConstants {
    static let modelName = "cnn_lstm_temporal"
    static let modelInputSize = CGSize(width: 224, height: 224)
    static let modelFrameCount = 15
    static let minConfidence = 0.5
    static let highConfidence = 0.9
}

enum LocationConstants {
    static let stationSearchRadius: Double = 50.0
    static let maxStationDistance: Double = 100.0
    static let minStationCount = 3
    static let maxStationCount = 10
    static let locationUpdateInterval: TimeInterval = 60
    static let stationUpdateInterval: TimeInterval = 600
    static let desiredAccuracy: Double = 100
    static let maxAccuracyError: Double = 1000
}

enum UIConstants {
    static let shortAnimation: Double = 0.2
    static let mediumAnimation: Double = 0.3
    static let longAnimation: Double = 0.5
    static let smallSpacing: CGFloat = 8
    static let mediumSpacing: CGFloat = 16
    static let largeSpacing: CGFloat = 24
    static let smallCornerRadius: CGFloat = 8
    static let mediumCornerRadius: CGFloat = 16
    static let largeCornerRadius: CGFloat = 24
    static let globeRadius: CGFloat = 150
    static let globeRotationSpeed: Double = 0.01
    static let particleCount = 2_000_000
}

enum PM25Thresholds {
    static let good: Double = 12
    static let moderate: Double = 35
    static let unhealthySensitive: Double = 55
    static let unhealthy: Double = 150
    static let veryUnhealthy: Double = 250
    
    static func level(for pm25: Double) -> PM25Level {
        switch pm25 {
        case 0...good: return .good
        case good...moderate: return .moderate
        case moderate...unhealthySensitive: return .unhealthySensitive
        case unhealthySensitive...unhealthy: return .unhealthy
        case unhealthy...veryUnhealthy: return .veryUnhealthy
        default: return .hazardous
        }
    }
}

enum PM25Level: String, CaseIterable {
    case good = "Good"
    case moderate = "Moderate"
    case unhealthySensitive = "Unhealthy for Sensitive"
    case unhealthy = "Unhealthy"
    case veryUnhealthy = "Very Unhealthy"
    case hazardous = "Hazardous"
    
    var color: Color {
        switch self {
        case .good: return .green
        case .moderate: return .yellow
        case .unhealthySensitive: return .orange
        case .unhealthy: return .red
        case .veryUnhealthy: return .purple
        case .hazardous: return Color(red: 0.5, green: 0, blue: 0.13)
        }
    }
    
    var emoji: String {
        switch self {
        case .good: return "😊"
        case .moderate: return "😐"
        case .unhealthySensitive: return "😷"
        case .unhealthy: return "😨"
        case .veryUnhealthy: return "😱"
        case .hazardous: return "☠️"
        }
    }
}

enum FusionConstants {
    static let stationConfidence = 0.85
    static let cameraConfidence = 0.90
    static let satelliteConfidence = 0.75
    static let minWeight = 0.1
    static let maxWeight = 1.0
    static let outlierThreshold = 2.0
}

enum ErrorMessages {
    static let locationPermissionDenied = "Location permission required"
    static let cameraPermissionDenied = "Camera permission required"
    static let networkError = "Network connection failed"
    static let modelNotFound = "AI model not found"
    static let predictionFailed = "Prediction failed"
}

extension Notification.Name {
    static let locationUpdated = Notification.Name("locationUpdated")
    static let stationDataUpdated = Notification.Name("stationDataUpdated")
    static let predictionCompleted = Notification.Name("predictionCompleted")
}
