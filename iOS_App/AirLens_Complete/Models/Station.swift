//
//  Station.swift
//  AirLens
//
//  Created on 2025-11-06
//

import Foundation
import CoreLocation

// MARK: - Station Model
struct Station: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let latitude: Double
    let longitude: Double
    let country: String
    let pm25: Double
    let pm10: Double?
    let aqi: Int?
    let source: String
    let lastUpdated: Date
    
    enum CodingKeys: String, CodingKey {
        case id, name, latitude, longitude, country
        case pm25, pm10, aqi, source
        case lastUpdated = "last_updated"
    }
    
    // 좌표 계산용 프로퍼티
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
    
    // PM2.5 카테고리 계산
    var pm25Category: PM25Category {
        PM25Category(pm25: pm25)
    }
    
    // 거리 계산
    func distance(from location: CLLocation) -> Double {
        let stationLocation = CLLocation(latitude: latitude, longitude: longitude)
        return location.distance(from: stationLocation) / 1000 // km로 변환
    }
}

// MARK: - PM2.5 Category
enum PM25Category {
    case good           // 0-12
    case moderate       // 13-35
    case unhealthy      // 36-55
    case veryUnhealthy  // 56-150
    case hazardous      // 150+
    
    init(pm25: Double) {
        switch pm25 {
        case 0...12:
            self = .good
        case 13...35:
            self = .moderate
        case 36...55:
            self = .unhealthy
        case 56...150:
            self = .veryUnhealthy
        default:
            self = .hazardous
        }
    }
    
    var color: String {
        switch self {
        case .good:
            return "#00E400"
        case .moderate:
            return "#FFFF00"
        case .unhealthy:
            return "#FF7E00"
        case .veryUnhealthy:
            return "#FF0000"
        case .hazardous:
            return "#8F3F97"
        }
    }
    
    var label: String {
        switch self {
        case .good:
            return "Good"
        case .moderate:
            return "Moderate"
        case .unhealthy:
            return "Unhealthy"
        case .veryUnhealthy:
            return "Very Unhealthy"
        case .hazardous:
            return "Hazardous"
        }
    }
    
    var description: String {
        switch self {
        case .good:
            return "Air quality is satisfactory"
        case .moderate:
            return "Acceptable for most people"
        case .unhealthy:
            return "Some may experience health effects"
        case .veryUnhealthy:
            return "Everyone may experience health effects"
        case .hazardous:
            return "Emergency conditions"
        }
    }
    
    var emoji: String {
        switch self {
        case .good:
            return "😊"
        case .moderate:
            return "🙂"
        case .unhealthy:
            return "😷"
        case .veryUnhealthy:
            return "🤢"
        case .hazardous:
            return "☠️"
        }
    }
}

// MARK: - Station Response
struct StationsResponse: Codable {
    let status: String
    let count: Int
    let data: [Station]
}

// MARK: - Station Statistics
struct StationStatistics {
    let totalStations: Int
    let averagePM25: Double
    let maxPM25: Double
    let minPM25: Double
    let countriesCount: Int
    
    init(from stations: [Station]) {
        self.totalStations = stations.count
        self.averagePM25 = stations.isEmpty ? 0 : 
            stations.map { $0.pm25 }.reduce(0, +) / Double(stations.count)
        self.maxPM25 = stations.map { $0.pm25 }.max() ?? 0
        self.minPM25 = stations.map { $0.pm25 }.min() ?? 0
        self.countriesCount = Set(stations.map { $0.country }).count
    }
}