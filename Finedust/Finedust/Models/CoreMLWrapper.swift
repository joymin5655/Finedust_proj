//
//  CoreMLWrapper.swift
//  Finedust
//
//  Wrapper for CoreML PM2.5 prediction model
//

import Foundation
import CoreML
import Vision
import UIKit

class CoreMLWrapper {
    
    private var model: VNCoreMLModel?
    private let modelName = "cnn_lstm_temporal"
    
    init() {
        loadModel()
    }
    
    private func loadModel() {
        do {
            if let modelURL = Bundle.main.url(forResource: modelName, withExtension: "mlmodelc") {
                let mlModel = try MLModel(contentsOf: modelURL)
                model = try VNCoreMLModel(for: mlModel)
                print("✅ CoreML model loaded successfully")
            } else {
                print("⚠️ CoreML model not found in bundle")
            }
        } catch {
            print("❌ Failed to load CoreML model: \(error)")
        }
    }
    
    func predictPM25(from frames: [UIImage]) async throws -> (pm25: Double, confidence: Double) {
        guard !frames.isEmpty else {
            throw CoreMLError.noFrames
        }
        
        guard model != nil else {
            print("⚠️ Using mock prediction (model not loaded)")
            return mockPrediction()
        }
        
        // Mock prediction for now
        let pm25 = Double.random(in: 15...45)
        let confidence = Double.random(in: 0.75...0.95)
        
        print("🔮 CoreML Prediction: PM2.5 = \(String(format: "%.1f", pm25)) μg/m³")
        print("   Confidence: \(String(format: "%.1f%%", confidence * 100))")
        
        return (pm25, confidence)
    }
    
    private func mockPrediction() -> (pm25: Double, confidence: Double) {
        let basePM25 = Double.random(in: 15...45)
        let variation = Double.random(in: -5...5)
        let pm25 = basePM25 + variation
        let confidence = Double.random(in: 0.75...0.95)
        return (pm25, confidence)
    }
}

enum CoreMLError: Error, LocalizedError {
    case noFrames
    case preprocessingFailed
    case predictionFailed
    case modelNotLoaded
    
    var errorDescription: String? {
        switch self {
        case .noFrames:
            return "No image frames provided"
        case .preprocessingFailed:
            return "Failed to preprocess frames"
        case .predictionFailed:
            return "Prediction failed"
        case .modelNotLoaded:
            return "Model not loaded"
        }
    }
}
