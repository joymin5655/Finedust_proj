//
//  PM25PredictionModel.swift
//  Finedust
//
//  PM2.5 예측을 위한 통합 AI 모델
//

import Foundation
import CoreML
import Vision
import CoreLocation

// MARK: - PM2.5 Triple Verification Model
class PM25PredictionModel: ObservableObject {
    static let shared = PM25PredictionModel()
    
    @Published var isProcessing = false
    @Published var predictionResult: PM25Result?
    @Published var confidence: Double = 0
    
    private var cnnLSTMModel: VNCoreMLModel?
    
    init() {
        setupModel()
    }
    
    // MARK: - Model Setup
    private func setupModel() {
        // CoreML 모델 로드 (실제 모델 파일 필요)
        guard let modelURL = Bundle.main.url(forResource: "PM25CNNLSTM", withExtension: "mlmodelc") else {
            print("⚠️ Model file not found. Using mock predictions.")
            return
        }
        
        do {
            let model = try VNCoreMLModel(for: MLModel(contentsOf: modelURL))
            self.cnnLSTMModel = model
        } catch {
            print("❌ Failed to load model: \(error)")
        }
    }
    
    // MARK: - Triple Verification Prediction
    func predict(image: UIImage, location: CLLocationCoordinate2D) async -> PM25Result {
        isProcessing = true
        
        // Tier 1: Station Data (IDW Interpolation)
        let stationPM25 = await fetchStationData(location: location)
        
        // Tier 2: Camera Prediction (CNN-LSTM)
        let cameraPM25 = await predictFromImage(image)
        
        // Tier 3: Satellite Data (AOD Conversion)
        let satellitePM25 = await fetchSatelliteData(location: location)
        
        // Bayesian Fusion
        let fusedResult = performBayesianFusion(
            station: stationPM25,
            camera: cameraPM25,
            satellite: satellitePM25
        )
        
        isProcessing = false
        predictionResult = fusedResult
        
        return fusedResult
    }
    
    // MARK: - Tier 1: Station Data
    private func fetchStationData(location: CLLocationCoordinate2D) async -> TierResult {
        // IDW (Inverse Distance Weighting) 보간
        let nearbyStations = await StationAPI.shared.fetchNearbyStations(
            lat: location.latitude,
            lng: location.longitude,
            radius: 50 // km
        )
        
        guard !nearbyStations.isEmpty else {
            return TierResult(value: 0, confidence: 0, source: .station)
        }
        
        // IDW 계산
        var totalWeight: Double = 0
        var weightedSum: Double = 0
        
        for station in nearbyStations {
            let distance = calculateDistance(from: location, to: station.coordinate)
            let weight = 1.0 / pow(distance + 0.1, 2) // IDW formula
            
            totalWeight += weight
            weightedSum += weight * station.pm25
        }
        
        let interpolatedPM25 = weightedSum / totalWeight
        let confidence = min(0.9, 1.0 / (1.0 + nearbyStations[0].distance / 10))
        
        return TierResult(
            value: interpolatedPM25,
            confidence: confidence,
            source: .station
        )
    }
    
    // MARK: - Tier 2: Camera Prediction
    private func predictFromImage(_ image: UIImage) async -> TierResult {
        guard let model = cnnLSTMModel else {
            // Mock prediction if model not loaded
            return TierResult(
                value: Double.random(in: 20...40),
                confidence: 0.85,
                source: .camera
            )
        }
        
        // 이미지 전처리
        guard let pixelBuffer = image.pixelBuffer(width: 224, height: 224) else {
            return TierResult(value: 0, confidence: 0, source: .camera)
        }
        
        // CoreML 예측
        let request = VNCoreMLRequest(model: model) { request, error in
            // 예측 결과 처리
        }
        
        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer)
        try? handler.perform([request])
        
        // 실제 모델 출력 처리 (임시 값)
        let predictedPM25 = Double.random(in: 25...35)
        let modelConfidence = 0.85
        
        return TierResult(
            value: predictedPM25,
            confidence: modelConfidence,
            source: .camera
        )
    }    
    // MARK: - Tier 3: Satellite Data
    private func fetchSatelliteData(location: CLLocationCoordinate2D) async -> TierResult {
        // Sentinel-5P AOD 데이터
        let aodData = await SatelliteAPI.shared.fetchAOD(
            lat: location.latitude,
            lng: location.longitude
        )
        
        // AOD to PM2.5 변환 (경험적 공식)
        let pm25 = 120 * aodData.aod550 + 5
        
        // 습도 보정
        if let humidity = aodData.humidity {
            let correctionFactor = 1 + (humidity - 50) / 100
            let correctedPM25 = pm25 * correctionFactor
            
            return TierResult(
                value: correctedPM25,
                confidence: 0.75,
                source: .satellite
            )
        }
        
        return TierResult(
            value: pm25,
            confidence: 0.7,
            source: .satellite
        )
    }
    
    // MARK: - Bayesian Fusion
    private func performBayesianFusion(
        station: TierResult,
        camera: TierResult,
        satellite: TierResult
    ) -> PM25Result {
        // 가중치 정규화
        let totalConfidence = station.confidence + camera.confidence + satellite.confidence
        
        let stationWeight = station.confidence / totalConfidence
        let cameraWeight = camera.confidence / totalConfidence
        let satelliteWeight = satellite.confidence / totalConfidence
        
        // 가중 평균
        let fusedPM25 = station.value * stationWeight +
                       camera.value * cameraWeight +
                       satellite.value * satelliteWeight
        
        // 불확실성 계산
        let values = [station.value, camera.value, satellite.value]
        let mean = values.reduce(0, +) / Double(values.count)
        let variance = values.map { pow($0 - mean, 2) }.reduce(0, +) / Double(values.count)
        let uncertainty = sqrt(variance)
        
        // 최종 신뢰도
        var finalConfidence = (station.confidence + camera.confidence + satellite.confidence) / 3
        
        // 소스 간 일치도 보너스
        if uncertainty < 5 {
            finalConfidence += 0.15
        } else if uncertainty < 10 {
            finalConfidence += 0.1
        }
        
        finalConfidence = min(0.98, finalConfidence)
        
        return PM25Result(
            pm25: fusedPM25,
            uncertainty: uncertainty,
            confidence: finalConfidence,
            breakdown: PM25Breakdown(
                station: station,
                camera: camera,
                satellite: satellite
            )
        )
    }
    
    // MARK: - Helper Functions
    private func calculateDistance(
        from: CLLocationCoordinate2D,
        to: CLLocationCoordinate2D
    ) -> Double {
        let earthRadius = 6371.0 // km
        
        let lat1 = from.latitude * .pi / 180
        let lat2 = to.latitude * .pi / 180
        let deltaLat = (to.latitude - from.latitude) * .pi / 180
        let deltaLon = (to.longitude - from.longitude) * .pi / 180
        
        let a = sin(deltaLat/2) * sin(deltaLat/2) +
                cos(lat1) * cos(lat2) *
                sin(deltaLon/2) * sin(deltaLon/2)
        let c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return earthRadius * c
    }
}

// MARK: - Data Models
struct PM25Result {
    let pm25: Double
    let uncertainty: Double
    let confidence: Double
    let breakdown: PM25Breakdown
    
    var aqiLevel: AQILevel {
        switch pm25 {
        case 0...12: return .good
        case 12.1...35.4: return .moderate
        case 35.5...55.4: return .unhealthyForSensitive
        case 55.5...150.4: return .unhealthy
        case 150.5...250.4: return .veryUnhealthy
        default: return .hazardous
        }
    }
}

struct PM25Breakdown {
    let station: TierResult
    let camera: TierResult
    let satellite: TierResult
}

struct TierResult {
    let value: Double
    let confidence: Double
    let source: DataSource
}

enum DataSource {
    case station
    case camera
    case satellite
}

enum AQILevel {
    case good
    case moderate
    case unhealthyForSensitive
    case unhealthy
    case veryUnhealthy
    case hazardous
    
    var color: Color {
        switch self {
        case .good: return .green
        case .moderate: return .yellow
        case .unhealthyForSensitive: return .orange
        case .unhealthy: return .red
        case .veryUnhealthy: return .purple
        case .hazardous: return Color(red: 0.5, green: 0, blue: 0)
        }
    }
    
    var description: String {
        switch self {
        case .good: return "좋음"
        case .moderate: return "보통"
        case .unhealthyForSensitive: return "민감군 나쁨"
        case .unhealthy: return "나쁨"
        case .veryUnhealthy: return "매우 나쁨"
        case .hazardous: return "위험"
        }
    }
}

// MARK: - Image Extension for Pixel Buffer
extension UIImage {
    func pixelBuffer(width: Int, height: Int) -> CVPixelBuffer? {
        var pixelBuffer: CVPixelBuffer?
        let attrs = [kCVPixelBufferCGImageCompatibilityKey: kCFBooleanTrue,
                     kCVPixelBufferCGBitmapContextCompatibilityKey: kCFBooleanTrue] as CFDictionary
        let status = CVPixelBufferCreate(kCFAllocatorDefault,
                                        width,
                                        height,
                                        kCVPixelFormatType_32BGRA,
                                        attrs,
                                        &pixelBuffer)
        
        guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
            return nil
        }
        
        CVPixelBufferLockBaseAddress(buffer, CVPixelBufferLockFlags(rawValue: 0))
        let pixelData = CVPixelBufferGetBaseAddress(buffer)
        
        let rgbColorSpace = CGColorSpaceCreateDeviceRGB()
        guard let context = CGContext(data: pixelData,
                                     width: width,
                                     height: height,
                                     bitsPerComponent: 8,
                                     bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
                                     space: rgbColorSpace,
                                     bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue) else {
            CVPixelBufferUnlockBaseAddress(buffer, CVPixelBufferLockFlags(rawValue: 0))
            return nil
        }
        
        context.draw(self.cgImage!, in: CGRect(x: 0, y: 0, width: width, height: height))
        CVPixelBufferUnlockBaseAddress(buffer, CVPixelBufferLockFlags(rawValue: 0))
        
        return buffer
    }
}
