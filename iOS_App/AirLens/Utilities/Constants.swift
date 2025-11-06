//
//  Constants.swift
//  AirLens
//
//  Application constants and configuration
//

import Foundation
import SwiftUI

struct AppConstants {
    // MARK: - App Information
    static let appName = "AirLens"
    static let appVersion = "1.0.0"
    static let buildNumber = "1"

    // MARK: - API Configuration
    struct API {
        static let baseURL = "http://localhost:8000/api"
        static let timeout: TimeInterval = 30
        static let maxRetries = 3
    }

    // MARK: - Location
    struct Location {
        static let defaultRadius: Double = 100.0 // km
        static let updateDistance: Double = 100.0 // meters
    }

    // MARK: - Camera
    struct Camera {
        static let jpegCompressionQuality: CGFloat = 0.8
        static let imageMaxSize: CGSize = CGSize(width: 1920, height: 1080)
    }

    // MARK: - UI Constants
    struct UI {
        static let cornerRadius: CGFloat = 12
        static let largePadding: CGFloat = 20
        static let mediumPadding: CGFloat = 16
        static let smallPadding: CGFloat = 8

        static let iconSize: CGFloat = 24
        static let largeIconSize: CGFloat = 48

        static let animationDuration: Double = 0.3
    }

    // MARK: - PM2.5 Thresholds
    struct PM25Thresholds {
        static let good: Double = 12.0
        static let moderate: Double = 35.0
        static let unhealthyForSensitive: Double = 55.0
        static let unhealthy: Double = 150.0
        // > 150 is hazardous
    }

    // MARK: - AQI Thresholds
    struct AQIThresholds {
        static let good = 0...50
        static let moderate = 51...100
        static let unhealthyForSensitive = 101...150
        static let unhealthy = 151...200
        static let veryUnhealthy = 201...300
        // > 300 is hazardous
    }

    // MARK: - Language Options
    enum Language: String, CaseIterable {
        case english = "en"
        case korean = "ko"

        var displayName: String {
            switch self {
            case .english:
                return "English"
            case .korean:
                return "한국어"
            }
        }

        var flag: String {
            switch self {
            case .english:
                return "🇺🇸"
            case .korean:
                return "🇰🇷"
            }
        }
    }

    // MARK: - Sample Globe Stations
    static let globeStations: [(name: String, city: String, country: String, lat: Double, lon: Double)] = [
        ("Washington D.C.", "Washington", "USA", 38.9072, -77.0369),
        ("Seoul", "Seoul", "South Korea", 37.5665, 126.9780),
        ("Brussels", "Brussels", "Belgium", 50.8503, 4.3517),
        ("Beijing", "Beijing", "China", 39.9042, 116.4074),
        ("Delhi", "Delhi", "India", 28.7041, 77.1025),
        ("London", "London", "UK", 51.5074, -0.1278),
        ("Tokyo", "Tokyo", "Japan", 35.6762, 139.6503),
        ("Sydney", "Sydney", "Australia", -33.8688, 151.2093)
    ]

    // MARK: - Mock Policies for Globe View
    static let mockPolicies: [Policy] = [
        Policy(
            id: "1",
            country: "USA",
            title: "Clean Air Act Amendments",
            description: "Comprehensive federal law regulating air emissions from stationary and mobile sources",
            category: .emissions,
            effectiveDate: "2024-01-01",
            authority: "Environmental Protection Agency",
            link: "https://www.epa.gov/clean-air-act-overview",
            credibilityScore: 0.98
        ),
        Policy(
            id: "2",
            country: "South Korea",
            title: "Fine Dust Management Act",
            description: "Special measures for reducing fine dust pollution and protecting public health",
            category: .health,
            effectiveDate: "2024-03-01",
            authority: "Ministry of Environment",
            link: nil,
            credibilityScore: 0.96
        ),
        Policy(
            id: "3",
            country: "Belgium",
            title: "EU Air Quality Directive",
            description: "European Union standards for ambient air quality and cleaner air",
            category: .monitoring,
            effectiveDate: "2024-02-15",
            authority: "European Commission",
            link: "https://ec.europa.eu/environment/air/",
            credibilityScore: 0.97
        ),
        Policy(
            id: "4",
            country: "China",
            title: "Air Pollution Prevention Action Plan",
            description: "National initiative to reduce PM2.5 concentrations and improve air quality",
            category: .emissions,
            effectiveDate: "2024-01-10",
            authority: "Ministry of Ecology and Environment",
            link: nil,
            credibilityScore: 0.92
        ),
        Policy(
            id: "5",
            country: "India",
            title: "National Clean Air Programme",
            description: "Comprehensive plan for prevention, control and abatement of air pollution",
            category: .monitoring,
            effectiveDate: "2024-02-01",
            authority: "Central Pollution Control Board",
            link: nil,
            credibilityScore: 0.94
        )
    ]
}
