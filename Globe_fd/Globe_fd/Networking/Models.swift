//
//  Models.swift
//  Globe_fd
//
//  Created on 2025-11-05.
//

import Foundation
import SwiftUI

// MARK: - Station Model

struct Station: Codable, Identifiable {
    let id: String
    let name: String
    let latitude: Double
    let longitude: Double
    let country: String
    let pm25: Double
    let pm10: Double?
    let source: String
    let lastUpdated: Date
    
    enum CodingKeys: String, CodingKey {
        case id, name, latitude, longitude, country, pm25, pm10, source
        case lastUpdated = "last_updated"
    }
    
    var pm25Category: PM25Category {
        PM25Category(pm25: pm25)
    }
}

struct StationsResponse: Codable {
    let status: String
    let count: Int
    let data: [Station]
}

// MARK: - Policy Model

struct AirPolicy: Codable, Identifiable {
    let id: String
    let source: String
    let country: String
    let title: String
    let description: String?
    let url: String
    let credibilityScore: Double
    
    enum CodingKeys: String, CodingKey {
        case id, source, country, title, description, url
        case credibilityScore = "credibility_score"
    }
}

struct PoliciesResponse: Codable {
    let status: String
    let count: Int
    let data: [AirPolicy]
}

// MARK: - PM2.5 Category

enum PM25Category {
    case good, moderate, unhealthy, veryUnhealthy, hazardous
    
    init(pm25: Double) {
        if pm25 <= 12 {
            self = .good
        } else if pm25 <= 35 {
            self = .moderate
        } else if pm25 <= 55 {
            self = .unhealthy
        } else if pm25 <= 150 {
            self = .veryUnhealthy
        } else {
            self = .hazardous
        }
    }
    
    var color: Color {
        switch self {
        case .good:
            return Color(red: 0, green: 1, blue: 0)
        case .moderate:
            return Color(red: 1, green: 1, blue: 0)
        case .unhealthy:
            return Color(red: 1, green: 0.5, blue: 0)
        case .veryUnhealthy:
            return Color(red: 1, green: 0, blue: 0)
        case .hazardous:
            return Color(red: 0.5, green: 0, blue: 0)
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
}

// MARK: - Prediction Result

struct PredictionResult: Codable {
    let pm25: Double
    let confidence: Double
    let breakdown: PredictionBreakdown
    let timestamp: Date
}

struct PredictionBreakdown: Codable {
    let camera: Double
    let station: Double?
    let satellite: Double?
}
