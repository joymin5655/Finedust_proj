//
//  PredictionResult.swift
//  AirLens
//
//  Air quality prediction result with triple-source verification
//

import Foundation
import UIKit

// MARK: - Prediction Result
struct PredictionResult: Identifiable, Codable {
    let id: UUID
    let pm25: Double
    let confidence: Double // 0.0 to 1.0
    let uncertainty: Double // +/- μg/m³
    let breakdown: PredictionBreakdown
    let timestamp: Date

    // Optional image data (for history)
    var imageData: Data?

    // Computed properties
    var pm25Category: PM25Category {
        PM25Category.from(pm25: pm25)
    }

    var formattedPM25: String {
        String(format: "%.1f", pm25)
    }

    var confidencePercentage: String {
        String(format: "%.0f%%", confidence * 100)
    }

    var uncertaintyRange: String {
        String(format: "%.1f - %.1f μg/m³",
               max(0, pm25 - uncertainty),
               pm25 + uncertainty)
    }

    init(
        id: UUID = UUID(),
        pm25: Double,
        confidence: Double,
        uncertainty: Double,
        breakdown: PredictionBreakdown,
        timestamp: Date = Date(),
        imageData: Data? = nil
    ) {
        self.id = id
        self.pm25 = pm25
        self.confidence = confidence
        self.uncertainty = uncertainty
        self.breakdown = breakdown
        self.timestamp = timestamp
        self.imageData = imageData
    }
}

// MARK: - Prediction Breakdown
struct PredictionBreakdown: Codable {
    // Source contributions (weighted values)
    let camera: Double // Camera ML prediction weight
    let station: Double? // Station IDW interpolation weight
    let satellite: Double? // Satellite AOD conversion weight

    // Source raw values
    let cameraValue: Double
    let stationValue: Double?
    let satelliteValue: Double?

    // Source confidence levels
    let cameraConfidence: Double
    let stationConfidence: Double?
    let satelliteConfidence: Double?

    var totalWeight: Double {
        camera + (station ?? 0) + (satellite ?? 0)
    }

    var sourcesUsed: Int {
        var count = 1 // Camera always used
        if station != nil { count += 1 }
        if satellite != nil { count += 1 }
        return count
    }
}

// MARK: - Frame Feature
struct FrameFeature: Identifiable, Codable {
    let id: UUID
    let timestamp: Date
    let features: [Float] // 576-dim feature vector
    let quality: Double // 0.0 to 1.0
    let metadata: FrameMetadata

    var isGoodQuality: Bool {
        quality > 0.7
    }

    init(
        id: UUID = UUID(),
        timestamp: Date = Date(),
        features: [Float],
        quality: Double,
        metadata: FrameMetadata
    ) {
        self.id = id
        self.timestamp = timestamp
        self.features = features
        self.quality = quality
        self.metadata = metadata
    }
}

// MARK: - Frame Metadata
struct FrameMetadata: Codable {
    let brightness: Double // 0.0 to 1.0
    let contrast: Double
    let sharpness: Double
    let hasClouds: Bool
    let skyVisibility: Double // 0.0 to 1.0
    let timestamp: Date
    let location: LocationMetadata?

    var qualityScore: Double {
        // Weighted quality score
        let weights = [
            brightness: 0.2,
            contrast: 0.15,
            sharpness: 0.25,
            skyVisibility: 0.4
        ]
        return weights.reduce(0) { $0 + $1.key * $1.value }
    }
}

// MARK: - Location Metadata
struct LocationMetadata: Codable {
    let latitude: Double
    let longitude: Double
    let altitude: Double?
    let timestamp: Date
}

// MARK: - Prediction History
struct PredictionHistory: Codable {
    var predictions: [PredictionResult]
    let maxCount: Int = 50 // PRD specifies up to 50

    mutating func add(_ prediction: PredictionResult) {
        predictions.insert(prediction, at: 0)
        // Keep only most recent maxCount predictions
        if predictions.count > maxCount {
            predictions = Array(predictions.prefix(maxCount))
        }
    }

    func predictions(in dateRange: DateInterval) -> [PredictionResult] {
        predictions.filter { dateRange.contains($0.timestamp) }
    }

    func averagePM25(in dateRange: DateInterval) -> Double {
        let filtered = predictions(in: dateRange)
        guard !filtered.isEmpty else { return 0 }
        return filtered.map { $0.pm25 }.reduce(0, +) / Double(filtered.count)
    }
}

// MARK: - Quality Assessment Result
struct QualityAssessment {
    let score: Double // 0.0 to 1.0
    let issues: [QualityIssue]
    let recommendations: [String]

    var isAcceptable: Bool {
        score > 0.6
    }
}

enum QualityIssue: String, Codable {
    case lowBrightness = "Image is too dark"
    case highBrightness = "Image is too bright"
    case lowContrast = "Low contrast detected"
    case blurry = "Image is blurry"
    case noSky = "Sky not visible"
    case obstruction = "View is obstructed"
}
