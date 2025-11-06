//
//  Station.swift
//  AirLens
//
//  Air quality monitoring station model
//

import Foundation
import CoreLocation

// MARK: - Station Model
struct Station: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let latitude: Double
    let longitude: Double
    let country: String
    let pm25: Double
    let pm10: Double?
    let aqi: Int?
    let updatedAt: Date

    // Additional pollutants
    let no2: Double?
    let o3: Double?
    let so2: Double?
    let co: Double?

    // Metadata
    let source: String // e.g., "WAQI", "AirKorea", "EPA"
    let credibility: Double // 0.0 to 1.0

    // Computed properties
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }

    var pm25Category: PM25Category {
        PM25Category.from(pm25: pm25)
    }

    var isDataFresh: Bool {
        let tenMinutesAgo = Date().addingTimeInterval(-600)
        return updatedAt > tenMinutesAgo
    }

    // CodingKeys for JSON mapping
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case latitude = "lat"
        case longitude = "lon"
        case country
        case pm25
        case pm10
        case aqi
        case updatedAt
        case no2
        case o3
        case so2
        case co
        case source
        case credibility
    }
}

// MARK: - PM2.5 Category
enum PM25Category: String, Codable {
    case good
    case moderate
    case unhealthy
    case veryUnhealthy
    case hazardous

    static func from(pm25: Double) -> PM25Category {
        switch pm25 {
        case 0..<12:
            return .good
        case 12..<35.5:
            return .moderate
        case 35.5..<55.5:
            return .unhealthy
        case 55.5..<150.5:
            return .veryUnhealthy
        default:
            return .hazardous
        }
    }

    var label: String {
        switch self {
        case .good: return "Good"
        case .moderate: return "Moderate"
        case .unhealthy: return "Unhealthy"
        case .veryUnhealthy: return "Very Unhealthy"
        case .hazardous: return "Hazardous"
        }
    }

    var emoji: String {
        switch self {
        case .good: return "😊"
        case .moderate: return "😐"
        case .unhealthy: return "😷"
        case .veryUnhealthy: return "🤢"
        case .hazardous: return "☠️"
        }
    }

    var color: String {
        switch self {
        case .good: return "00E400" // Green
        case .moderate: return "FFFF00" // Yellow
        case .unhealthy: return "FF7E00" // Orange
        case .veryUnhealthy: return "FF0000" // Red
        case .hazardous: return "8F3F97" // Purple
        }
    }

    var description: String {
        switch self {
        case .good:
            return "Air quality is satisfactory. Outdoor activities are encouraged."
        case .moderate:
            return "Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion."
        case .unhealthy:
            return "Everyone may begin to experience health effects. Limit outdoor activities."
        case .veryUnhealthy:
            return "Health alert: The risk of health effects is increased for everyone. Avoid outdoor activities."
        case .hazardous:
            return "Health warning of emergency conditions. Stay indoors and use air purifiers."
        }
    }

    // Accessibility voice description
    var voiceDescription: String {
        "\(label). \(description)"
    }
}

// MARK: - Station Statistics
struct StationStatistics: Codable {
    let averagePM25: Double
    let maxPM25: Double
    let minPM25: Double
    let stationsCount: Int
    let countriesCount: Int
    let lastUpdated: Date

    init(stations: [Station]) {
        let pm25Values = stations.map { $0.pm25 }
        self.averagePM25 = pm25Values.isEmpty ? 0 : pm25Values.reduce(0, +) / Double(pm25Values.count)
        self.maxPM25 = pm25Values.max() ?? 0
        self.minPM25 = pm25Values.min() ?? 0
        self.stationsCount = stations.count
        self.countriesCount = Set(stations.map { $0.country }).count
        self.lastUpdated = Date()
    }
}

// MARK: - Nearby Stations Result
struct NearbyStationsResult {
    let stations: [Station]
    let center: CLLocationCoordinate2D
    let radius: Double // in kilometers

    var closest: Station? {
        stations.first
    }

    var averagePM25: Double {
        guard !stations.isEmpty else { return 0 }
        return stations.map { $0.pm25 }.reduce(0, +) / Double(stations.count)
    }
}
