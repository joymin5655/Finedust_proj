//
//  CameraViewModel.swift
//  AirLens
//
//  Created on 2025-11-06
//

import Foundation
import UIKit
import Combine
import CoreML
import Vision

@MainActor
class CameraViewModel: ObservableObject {
    @Published var selectedImage: UIImage?
    @Published var prediction: PredictionResult?
    @Published var predictionHistory: [PredictionResult] = []
    @Published var isProcessing = false
    @Published var error: String?
    @Published var confidence: Double = 0.0
    
    private let apiClient = APIClient.shared
    private let storageService = StorageService.shared
    private let locationService = LocationService.shared
    
    // MARK: - Image Processing
    
    // 이미지 선택
    func selectImage(_ image: UIImage) {
        selectedImage = image
        prediction = nil
        error = nil
    }
    
    // 이미지에서 PM2.5 예측
    func processImage(_ image: UIImage) async {
        isProcessing = true
        error = nil
        selectedImage = image
        
        do {
            // 이미지를 JPEG 데이터로 변환
            guard let imageData = image.jpegData(compressionQuality: 0.8) else {
                throw PredictionError.imageConversionFailed
            }
            
            // API로 예측 요청
            let result = try await apiClient.predictPM25(imageData: imageData)
            self.prediction = result
            
            // 히스토리에 추가
            predictionHistory.append(result)
            storageService.savePredictionHistory(predictionHistory)
            
            // 신뢰도 업데이트
            self.confidence = result.confidence
            
            print("✅ Prediction: PM2.5 = \(result.pm25), Confidence = \(result.confidence)")
        } catch {
            self.error = error.localizedDescription
            print("❌ Prediction error: \(error)")
        }
        
        isProcessing = false
    }
    
    // 로컬 CoreML 모델로 예측 (오프라인 모드)
    func processImageLocally(_ image: UIImage) async {
        isProcessing = true
        error = nil
        
        do {
            // CoreML 모델 로드 (임시 코드 - 실제 모델 필요)
            // let model = try VNCoreMLModel(for: AQIPredictor().model)
            
            // 이미지 처리
            guard let ciImage = CIImage(image: image) else {
                throw PredictionError.imageConversionFailed
            }
            
            // 임시 예측 결과 (실제로는 CoreML 모델 사용)
            let pm25Value = Double.random(in: 10...100)
            let confidenceValue = Double.random(in: 0.7...0.95)
            
            let breakdown = PredictionBreakdown(
                camera: 0.7,
                station: 0.2,
                satellite: 0.1,
                weather: nil
            )
            
            let location = locationService.currentLocation.map {
                PredictionLocation(
                    latitude: $0.latitude,
                    longitude: $0.longitude,
                    address: nil,
                    city: nil,
                    country: nil
                )
            }
            
            let result = PredictionResult(
                pm25: pm25Value,
                confidence: confidenceValue,
                breakdown: breakdown,
                timestamp: Date(),
                imageData: image.jpegData(compressionQuality: 0.5),
                location: location
            )
            
            self.prediction = result
            predictionHistory.append(result)
            
            print("✅ Local prediction: PM2.5 = \(pm25Value)")
        } catch {
            self.error = "Local prediction failed: \(error.localizedDescription)"
            print("❌ Local prediction error: \(error)")
        }
        
        isProcessing = false
    }
    
    // 예측 기록 로드
    func loadHistory() {
        if let history = storageService.loadPredictionHistory() {
            self.predictionHistory = history
        }
    }
    
    // 예측 기록 지우기
    func clearHistory() {
        predictionHistory.removeAll()
        storageService.clearPredictionHistory()
    }
    
    // 예측 결과 공유
    func sharePrediction() -> String {
        guard let prediction = prediction else {
            return "No prediction available"
        }
        
        return """
        🌍 AirLens PM2.5 Prediction
        
        PM2.5: \(prediction.formattedPM25) μg/m³
        Category: \(prediction.pm25Category.label) \(prediction.pm25Category.emoji)
        Confidence: \(prediction.confidencePercentage)
        
        Source: \(prediction.breakdown.primarySource)
        Time: \(prediction.timestamp.formatted())
        
        Download AirLens for real-time air quality monitoring
        """
    }
}

// MARK: - Error Types
enum PredictionError: LocalizedError {
    case imageConversionFailed
    case modelLoadFailed
    case predictionFailed
    case networkError
    
    var errorDescription: String? {
        switch self {
        case .imageConversionFailed:
            return "Failed to process image"
        case .modelLoadFailed:
            return "Failed to load AI model"
        case .predictionFailed:
            return "Prediction failed"
        case .networkError:
            return "Network connection error"
        }
    }
}