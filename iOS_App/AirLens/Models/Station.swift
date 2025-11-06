//
//  Station.swift
//  AirLens
//
//  Air quality monitoring station model
//

import Foundation
import CoreLocation

struct Station: Codable, Identifiable {
    let id: String
    let name: String
    let country: String
    let city: String
    let latitude: Double
    let longitude: Double
    let pm25: Double
    let pm10: Double
    let aqi: Int
    let lastUpdate: String
    let source: String
    let dominantPollutant: String?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case country
        case city
        case latitude
        case longitude
        case pm25
        case pm10
        case aqi
        case lastUpdate = "last_update"
        case source
        case dominantPollutant = "dominant_pollutant"
    }

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }

    var aqiLevel: AQILevel {
        AQILevel.from(aqi: aqi)
    }

    var pm25Level: PM25Level {
        PM25Level.from(value: pm25)
    }
}

enum AQILevel {
    case good
    case moderate
    case unhealthyForSensitive
    case unhealthy
    case veryUnhealthy
    case hazardous

    static func from(aqi: Int) -> AQILevel {
        switch aqi {
        case 0...50:
            return .good
        case 51...100:
            return .moderate
        case 101...150:
            return .unhealthyForSensitive
        case 151...200:
            return .unhealthy
        case 201...300:
            return .veryUnhealthy
        default:
            return .hazardous
        }
    }

    var color: String {
        switch self {
        case .good:
            return "green"
        case .moderate:
            return "yellow"
        case .unhealthyForSensitive:
            return "orange"
        case .unhealthy:
            return "red"
        case .veryUnhealthy:
            return "purple"
        case .hazardous:
            return "maroon"
        }
    }

    var description: String {
        switch self {
        case .good:
            return "Good"
        case .moderate:
            return "Moderate"
        case .unhealthyForSensitive:
            return "Unhealthy for Sensitive Groups"
        case .unhealthy:
            return "Unhealthy"
        case .veryUnhealthy:
            return "Very Unhealthy"
        case .hazardous:
            return "Hazardous"
        }
    }
}

enum PM25Level {
    case good
    case moderate
    case unhealthyForSensitive
    case unhealthy
    case hazardous

    static func from(value: Double) -> PM25Level {
        switch value {
        case 0...12:
            return .good
        case 12.1...35:
            return .moderate
        case 35.1...55:
            return .unhealthyForSensitive
        case 55.1...150:
            return .unhealthy
        default:
            return .hazardous
        }
    }

    var color: String {
        switch self {
        case .good:
            return "green"
        case .moderate:
            return "yellow"
        case .unhealthyForSensitive:
            return "orange"
        case .unhealthy:
            return "red"
        case .hazardous:
            return "purple"
        }
    }

    var gradientColors: [String] {
        switch self {
        case .good:
            return ["#10b981", "#34d399"]
        case .moderate:
            return ["#f59e0b", "#fbbf24"]
        case .unhealthyForSensitive:
            return ["#f97316", "#fb923c"]
        case .unhealthy:
            return ["#ef4444", "#f87171"]
        case .hazardous:
            return ["#8b5cf6", "#a78bfa"]
        }
    }

    var description: String {
        switch self {
        case .good:
            return "Good"
        case .moderate:
            return "Moderate"
        case .unhealthyForSensitive:
            return "Unhealthy for Sensitive Groups"
        case .unhealthy:
            return "Unhealthy"
        case .hazardous:
            return "Hazardous"
        }
    }

    var message: String {
        switch self {
        case .good:
            return "Air quality is satisfactory, and air pollution poses little or no risk."
        case .moderate:
            return "Air quality is acceptable. However, there may be a risk for some people."
        case .unhealthyForSensitive:
            return "Members of sensitive groups may experience health effects."
        case .unhealthy:
            return "Everyone may begin to experience health effects."
        case .hazardous:
            return "Health alert: The risk of health effects is increased for everyone."
        }
    }
}

struct StationListResponse: Codable {
    let stations: [Station]
    let total: Int
}
