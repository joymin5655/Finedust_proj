//
//  DataModels.swift
//  AirLens
//
//  Core data models for the AirLens app
//

import Foundation
import CoreLocation
import SwiftUI

// MARK: - View Type
enum ViewType {
    case camera
    case globe
    case settings
}

// MARK: - PM2.5 Prediction
struct PM25Prediction: Codable, Identifiable {
    let id: UUID
    let pm25: Double
    let confidence: Double
    let uncertainty: Double
    let breakdown: PredictionBreakdown
    let sources: [String]
    let timestamp: Date
    
    init(pm25: Double, confidence: Double, uncertainty: Double, breakdown: PredictionBreakdown, sources: [String]) {
        self.id = UUID()
        self.pm25 = pm25
        self.confidence = confidence
        self.uncertainty = uncertainty
        self.breakdown = breakdown
        self.sources = sources
        self.timestamp = Date()
    }
}

struct PredictionBreakdown: Codable {
    let station: Double
    let camera: Double
    let satellite: Double
}

// MARK: - AQI Level
enum AQILevel {
    case good
    case moderate
    case unhealthyForSensitive
    case unhealthy
    case veryUnhealthy
    case hazardous
    
    static func from(pm25: Double) -> AQILevel {
        switch pm25 {
        case 0...12:
            return .good
        case 12.1...35:
            return .moderate
        case 35.1...55:
            return .unhealthyForSensitive
        case 55.1...150:
            return .unhealthy
        case 150.1...250:
            return .veryUnhealthy
        default:
            return .hazardous
        }
    }
    
    var name: String {
        switch self {
        case .good: return "Good"
        case .moderate: return "Moderate"
        case .unhealthyForSensitive: return "Unhealthy for Sensitive Groups"
        case .unhealthy: return "Unhealthy"
        case .veryUnhealthy: return "Very Unhealthy"
        case .hazardous: return "Hazardous"
        }
    }
    
    var color: String {
        switch self {
        case .good: return "brandGreen"
        case .moderate: return "brandYellow"
        case .unhealthyForSensitive: return "brandOrange"
        case .unhealthy: return "brandRed"
        case .veryUnhealthy: return "brandPurple"
        case .hazardous: return "brandMaroon"
        }
    }
}

// MARK: - Location Details
struct LocationDetails {
    let city: String
    let country: String
    let flag: String
    let coordinate: CLLocationCoordinate2D
    
    var latitude: Double {
        coordinate.latitude
    }
    
    var longitude: Double {
        coordinate.longitude
    }
}

// MARK: - Policy Category
enum PolicyCategory: String, Codable {
    case pm25Reduction = "PM2.5 Reduction"
    case ozoneProtection = "Ozone Layer Protection"
    case emissionStandards = "Emission Standards"
    case climateAction = "Climate Action"
    case publicHealth = "Public Health"
}

// MARK: - Policy
struct Policy: Codable, Identifiable {
    let id: String
    let country: String
    let authority: String
    let category: PolicyCategory
    let title: String
    let description: String
    let officialURL: String
    let credibility: Double
}

// MARK: - Monitoring Station
struct MonitoringStation: Identifiable {
    let id: UUID
    let name: String
    let country: String
    let coordinate: CLLocationCoordinate2D
    let pm25: Double
    
    init(name: String, country: String, latitude: Double, longitude: Double, pm25: Double = 0) {
        self.id = UUID()
        self.name = name
        self.country = country
        self.coordinate = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
        self.pm25 = pm25
    }
}

// MARK: - Gemini API Response
struct GeminiImageAnalysisResponse: Codable {
    let pm25: Double
    let confidence: Double
    let analysis: String
}

struct GeminiLocationResponse: Codable {
    let city: String
    let country: String
    let countryCode: String
}
