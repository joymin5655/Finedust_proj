//
//  PredictionResult.swift
//  AirLens
//
//  Created on 2025-11-06
//

import Foundation
import UIKit

// MARK: - Prediction Result Model
struct PredictionResult: Codable, Identifiable {
    let id: UUID = UUID()
    let pm25: Double
    let confidence: Double
    let breakdown: PredictionBreakdown
    let timestamp: Date
    let imageData: Data?
    let location: PredictionLocation?
    
    enum CodingKeys: String, CodingKey {
        case pm25, confidence, breakdown, timestamp
        case imageData = "image_data"
        case location
    }
    
    var pm25Category: PM25Category {
        PM25Category(pm25: pm25)
    }
    
    var formattedPM25: String {
        String(format: "%.1f", pm25)
    }
    
    var confidencePercentage: String {
        String(format: "%.0f%%", confidence * 100)
    }
}

// MARK: - Prediction Breakdown
struct PredictionBreakdown: Codable {
    let camera: Double          // 카메라 기반 예측값
    let station: Double?        // 가까운 측정소 데이터
    let satellite: Double?      // 위성 데이터
    let weather: Double?        // 날씨 데이터 기반
    
    var primarySource: String {
        if camera > 0.5 {
            return "Camera Analysis"
        } else if let station = station, station > 0.3 {
            return "Station Data"
        } else if let satellite = satellite, satellite > 0.2 {
            return "Satellite Data"
        } else {
            return "Combined Sources"
        }
    }
}

// MARK: - Prediction Location
struct PredictionLocation: Codable {
    let latitude: Double
    let longitude: Double
    let address: String?
    let city: String?
    let country: String?
}

// MARK: - Prediction History
struct PredictionHistory {
    let predictions: [PredictionResult]
    
    var averagePM25: Double {
        guard !predictions.isEmpty else { return 0 }
        return predictions.map { $0.pm25 }.reduce(0, +) / Double(predictions.count)
    }
    
    var trend: PredictionTrend {
        guard predictions.count >= 2 else { return .stable }
        
        let recent = predictions.prefix(5)
        let older = predictions.dropFirst(5).prefix(5)
        
        guard !older.isEmpty else { return .stable }
        
        let recentAvg = recent.map { $0.pm25 }.reduce(0, +) / Double(recent.count)
        let olderAvg = older.map { $0.pm25 }.reduce(0, +) / Double(older.count)
        
        let difference = recentAvg - olderAvg
        
        if difference > 10 {
            return .worsening
        } else if difference < -10 {
            return .improving
        } else {
            return .stable
        }
    }
}

enum PredictionTrend {
    case improving
    case stable
    case worsening
    
    var icon: String {
        switch self {
        case .improving: return "arrow.down.circle.fill"
        case .stable: return "equal.circle.fill"
        case .worsening: return "arrow.up.circle.fill"
        }
    }
    
    var color: String {
        switch self {
        case .improving: return "#4CAF50"
        case .stable: return "#FFC107"
        case .worsening: return "#F44336"
        }
    }
    
    var description: String {
        switch self {
        case .improving: return "Air quality is improving"
        case .stable: return "Air quality is stable"
        case .worsening: return "Air quality is worsening"
        }
    }
}