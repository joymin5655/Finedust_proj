//
//  Constants.swift
//  AirLens
//
//  Created on 2025-11-06
//

import Foundation
import SwiftUI

// MARK: - App Constants
enum Constants {
    
    // MARK: - API Configuration
    enum API {
        static let baseURL = "https://airlens-api.onrender.com"
        static let localURL = "http://localhost:8000"
        static let timeout: TimeInterval = 30
        static let maxRetries = 3
        
        // API Keys (Store securely in production)
        static let waqiAPIKey = "YOUR_WAQI_API_KEY"
        static let googleMapsAPIKey = "YOUR_GOOGLE_MAPS_API_KEY"
    }
    
    // MARK: - Cache Configuration
    enum Cache {
        static let expirationTime: TimeInterval = 3600 // 1 hour
        static let maxCacheSize: Int = 100 * 1024 * 1024 // 100 MB
        static let maxPredictionHistory = 50
    }
    
    // MARK: - Map Configuration
    enum Map {
        static let defaultZoom: Float = 2.5
        static let minZoom: Float = 1.5
        static let maxZoom: Float = 5.0
        static let nearbyRadius: Double = 50.0 // km
        static let clusterRadius: Double = 100.0 // km
    }
    
    // MARK: - PM2.5 Thresholds
    enum PM25 {
        static let good: ClosedRange<Double> = 0...12
        static let moderate: ClosedRange<Double> = 13...35
        static let unhealthy: ClosedRange<Double> = 36...55
        static let veryUnhealthy: ClosedRange<Double> = 56...150
        static let hazardous: Double = 150
    }
    
    // MARK: - Colors
    enum Colors {
        // PM2.5 Category Colors
        static let goodColor = Color(hex: "#00E400")
        static let moderateColor = Color(hex: "#FFFF00")
        static let unhealthyColor = Color(hex: "#FF7E00")
        static let veryUnhealthyColor = Color(hex: "#FF0000")
        static let hazardousColor = Color(hex: "#8F3F97")
        
        // App Theme Colors
        static let primaryColor = Color(hex: "#007AFF")
        static let secondaryColor = Color(hex: "#5AC8FA")
        static let accentColor = Color(hex: "#FF9500")
        static let backgroundDark = Color(hex: "#0A0A0C")
        static let backgroundLight = Color(hex: "#1C1C1E")
    }
    
    // MARK: - Animation
    enum Animation {
        static let defaultDuration: Double = 0.3
        static let longDuration: Double = 0.6
        static let springResponse: Double = 0.4
        static let springDampingFraction: Double = 0.8
        static let globeRotationSpeed: Double = 0.5 // degrees per frame
    }
    
    // MARK: - Notification Names
    enum Notifications {
        static let stationsUpdated = Notification.Name("stationsUpdated")
        static let policiesUpdated = Notification.Name("policiesUpdated")
        static let predictionCompleted = Notification.Name("predictionCompleted")
        static let locationUpdated = Notification.Name("locationUpdated")
    }
    
    // MARK: - User Defaults Keys
    enum UserDefaultsKeys {
        static let hasSeenOnboarding = "hasSeenOnboarding"
        static let selectedLanguage = "selectedLanguage"
        static let notificationsEnabled = "notificationsEnabled"
        static let autoRefreshEnabled = "autoRefreshEnabled"
        static let measurementUnit = "measurementUnit"
        static let mapStyle = "mapStyle"
    }
    
    // MARK: - App Info
    enum App {
        static let name = "AirLens"
        static let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        static let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        static let bundleID = Bundle.main.bundleIdentifier ?? "com.airlens.app"
        static let supportEmail = "support@airlens.app"
        static let privacyURL = URL(string: "https://airlens.app/privacy")!
        static let termsURL = URL(string: "https://airlens.app/terms")!
    }
    
    // MARK: - Date Formats
    enum DateFormat {
        static let display = "MMM d, yyyy"
        static let displayWithTime = "MMM d, yyyy h:mm a"
        static let api = "yyyy-MM-dd'T'HH:mm:ss'Z'"
        static let short = "MM/dd"
        static let time = "h:mm a"
    }
    
    // MARK: - Image Names
    enum Images {
        static let appIcon = "AppIcon"
        static let earthTexture = "earth-texture"
        static let particleTexture = "particle"
        static let placeholder = "photo"
    }
    
    // MARK: - Accessibility
    enum Accessibility {
        static let globeHint = "Double tap to interact with the globe"
        static let stationHint = "Double tap to view station details"
        static let cameraHint = "Double tap to take a photo for PM2.5 prediction"
        static let policyHint = "Double tap to view policy details"
    }
}