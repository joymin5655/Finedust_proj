//
//  Models.swift
//  Globe_fd
//
//  Created by JOYMIN on 11/5/25.
//
import Foundation

// 측정소 모델
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
        case id, name, latitude, longitude
        case country, pm25, pm10, source
        case lastUpdated = "last_updated"
    }
}

struct StationsResponse: Codable {
    let status: String
    let count: Int
    let data: [Station]
}

// 정책 모델
struct AirPolicy: Codable, Identifiable {
    let id: String
    let source: String
    let country: String
    let title: String
    let description: String?
    let url: String
    let credibilityScore: Double
    
    enum CodingKeys: String, CodingKey {
        case id, source, country, title
        case description
        case url
        case credibilityScore = "credibility_score"
    }
}

struct PoliciesResponse: Codable {
    let status: String
    let count: Int
    let data: [AirPolicy]
}

// PM2.5 카테고리
enum PM25Category {
    case good, moderate, unhealthy, veryUnhealthy, hazardous
    
    init(pm25: Double) {
        if pm25 <= 12 { self = .good }
        else if pm25 <= 35 { self = .moderate }
        else if pm25 <= 55 { self = .unhealthy }
        else if pm25 <= 150 { self = .veryUnhealthy }
        else { self = .hazardous }
    }
    
    var color: UIColor {
        switch self {
        case .good: return UIColor(red: 0, green: 1, blue: 0, alpha: 1)
        case .moderate: return UIColor(red: 1, green: 1, blue: 0, alpha: 1)
        case .unhealthy: return UIColor(red: 1, green: 0.5, blue: 0, alpha: 1)
        case .veryUnhealthy: return UIColor(red: 1, green: 0, blue: 0, alpha: 1)
        case .hazardous: return UIColor(red: 0.5, green: 0, blue: 0, alpha: 1)
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

// 예측 결과
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
