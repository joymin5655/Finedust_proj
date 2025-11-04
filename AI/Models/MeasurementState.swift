import Foundation
import SwiftUI
import Combine

// MARK: - Measurement Process States

enum MeasurementStep: Int, CaseIterable {
    case idle = 0
    case locating = 1
    case capturing = 2
    case processing = 3
    case tier1Station = 4
    case tier2Camera = 5
    case tier3Satellite = 6
    case fusion = 7
    case complete = 8
    case failed = 9
    
    var title: String {
        switch self {
        case .idle: return "Ready"
        case .locating: return "Getting Location"
        case .capturing: return "Capturing Frames"
        case .processing: return "Processing Images"
        case .tier1Station: return "Station Data"
        case .tier2Camera: return "Camera Analysis"
        case .tier3Satellite: return "Satellite Data"
        case .fusion: return "Verification"
        case .complete: return "Complete"
        case .failed: return "Failed"
        }
    }
    
    var description: String {
        switch self {
        case .idle:
            return "Tap to start measurement"
        case .locating:
            return "Finding nearby air quality stations..."
        case .capturing:
            return "Capturing 30 frames from camera..."
        case .processing:
            return "Selecting best 15 frames and extracting features..."
        case .tier1Station:
            return "Fetching data from nearby monitoring stations..."
        case .tier2Camera:
            return "Running AI model inference on captured images..."
        case .tier3Satellite:
            return "Getting satellite AOD data from Sentinel-5P..."
        case .fusion:
            return "Cross-validating all data sources..."
        case .complete:
            return "Measurement complete with high confidence"
        case .failed:
            return "Measurement failed. Please try again."
        }
    }
    
    var icon: String {
        switch self {
        case .idle: return "camera.circle"
        case .locating: return "location.circle.fill"
        case .capturing: return "camera.fill"
        case .processing: return "waveform.circle.fill"
        case .tier1Station: return "antenna.radiowaves.left.and.right"
        case .tier2Camera: return "brain.head.profile"
        case .tier3Satellite: return "globe.americas.fill"
        case .fusion: return "checkmark.seal.fill"
        case .complete: return "checkmark.circle.fill"
        case .failed: return "xmark.circle.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .idle: return .gray
        case .locating: return .blue
        case .capturing: return .blue
        case .processing: return .blue
        case .tier1Station: return .orange
        case .tier2Camera: return .purple
        case .tier3Satellite: return .green
        case .fusion: return .indigo
        case .complete: return .green
        case .failed: return .red
        }
    }
    
    var progress: Double {
        return Double(self.rawValue) / Double(MeasurementStep.complete.rawValue)
    }
}

// MARK: - Tier Result Model

struct TierResult: Identifiable {
    let id = UUID()
    let tier: Int
    let name: String
    let pm25Value: Float
    let confidence: Float
    let weight: Float
    let status: TierStatus
    let details: String
    
    enum TierStatus {
        case loading
        case success
        case failed
        case unavailable
        
        var color: Color {
            switch self {
            case .loading: return .blue
            case .success: return .green
            case .failed: return .red
            case .unavailable: return .gray
            }
        }
        
        var icon: String {
            switch self {
            case .loading: return "hourglass"
            case .success: return "checkmark.circle.fill"
            case .failed: return "xmark.circle.fill"
            case .unavailable: return "minus.circle.fill"
            }
        }
    }
}

// MARK: - Measurement State Manager

@MainActor
class MeasurementStateManager: ObservableObject {
    @Published var currentStep: MeasurementStep = .idle
    @Published var overallProgress: Double = 0.0
    @Published var captureProgress: Float = 0.0
    @Published var frameCount: Int = 0
    @Published var selectedFrameCount: Int = 0
    
    @Published var tier1Result: TierResult?
    @Published var tier2Result: TierResult?
    @Published var tier3Result: TierResult?
    
    @Published var finalPM25: Float = 0
    @Published var finalConfidence: Float = 0
    @Published var finalUncertainty: Float = 0
    
    @Published var statusMessage: String = ""
    @Published var detailedLog: [String] = []
    
    func updateStep(_ step: MeasurementStep) {
        withAnimation(.easeInOut(duration: 0.3)) {
            currentStep = step
            overallProgress = step.progress
            statusMessage = step.description
        }
        
        addLog("Step: \(step.title)")
    }
    
    func updateCaptureProgress(_ progress: Float, frames: Int) {
        withAnimation {
            captureProgress = progress
            frameCount = frames
        }
    }
    
    func updateTier1(pm25: Float, confidence: Float, stationCount: Int) {
        withAnimation {
            tier1Result = TierResult(
                tier: 1,
                name: "Nearby Stations",
                pm25Value: pm25,
                confidence: confidence,
                weight: confidence,
                status: .success,
                details: "Based on \(stationCount) stations within 10km"
            )
        }
        addLog("Tier 1: PM2.5 = \(String(format: "%.1f", pm25)) µg/m³ (Conf: \(String(format: "%.0f", confidence * 100))%)")
    }
    
    func updateTier2(pm25: Float, confidence: Float, inferenceTime: Double) {
        withAnimation {
            tier2Result = TierResult(
                tier: 2,
                name: "Camera AI Model",
                pm25Value: pm25,
                confidence: confidence,
                weight: confidence,
                status: .success,
                details: "CNN-LSTM inference in \(String(format: "%.2f", inferenceTime))s"
            )
        }
        addLog("Tier 2: PM2.5 = \(String(format: "%.1f", pm25)) µg/m³ (Conf: \(String(format: "%.0f", confidence * 100))%)")
    }
    
    func updateTier3(pm25: Float, confidence: Float, aodValue: Float) {
        withAnimation {
            tier3Result = TierResult(
                tier: 3,
                name: "Satellite AOD",
                pm25Value: pm25,
                confidence: confidence,
                weight: confidence,
                status: .success,
                details: "Sentinel-5P AOD: \(String(format: "%.3f", aodValue))"
            )
        }
        addLog("Tier 3: PM2.5 = \(String(format: "%.1f", pm25)) µg/m³ (Conf: \(String(format: "%.0f", confidence * 100))%)")
    }
    
    func updateFinalResult(pm25: Float, confidence: Float, uncertainty: Float) {
        withAnimation {
            finalPM25 = pm25
            finalConfidence = confidence
            finalUncertainty = uncertainty
        }
        addLog("Final: PM2.5 = \(String(format: "%.1f", pm25)) ± \(String(format: "%.1f", uncertainty)) µg/m³")
        addLog("Confidence: \(String(format: "%.0f", confidence * 100))%")
    }
    
    func addLog(_ message: String) {
        let timestamp = DateFormatter.localizedString(from: Date(), dateStyle: .none, timeStyle: .medium)
        detailedLog.append("[\(timestamp)] \(message)")
    }
    
    func reset() {
        withAnimation {
            currentStep = .idle
            overallProgress = 0
            captureProgress = 0
            frameCount = 0
            selectedFrameCount = 0
            
            tier1Result = nil
            tier2Result = nil
            tier3Result = nil
            
            finalPM25 = 0
            finalConfidence = 0
            finalUncertainty = 0
            
            statusMessage = ""
            detailedLog.removeAll()
        }
    }
}
