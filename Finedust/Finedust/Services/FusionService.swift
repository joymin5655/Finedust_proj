//
//  FusionService.swift
//  Finedust
//
//  Service for Bayesian fusion of PM2.5 sources
//

import Foundation

class FusionService {
    
    func fusePM25Estimates(
        station: Double?,
        camera: Double?,
        satellite: Double?,
        stationConfidence: Double = 0.85,
        cameraConfidence: Double = 0.90,
        satelliteConfidence: Double = 0.75
    ) -> FusionResult {
        
        var sources: [PM25Source] = []
        
        if let station = station {
            sources.append(PM25Source(value: station, confidence: stationConfidence, type: .station))
        }
        
        if let camera = camera {
            sources.append(PM25Source(value: camera, confidence: cameraConfidence, type: .camera))
        }
        
        if let satellite = satellite {
            sources.append(PM25Source(value: satellite, confidence: satelliteConfidence, type: .satellite))
        }
        
        guard !sources.isEmpty else {
            print("⚠️ No sources available for fusion")
            return FusionResult(finalPM25: 25.0, confidence: 0.5, uncertainty: 10.0, sources: [])
        }
        
        let result = performBayesianFusion(sources: sources)
        
        print("🔀 Fusion Result:")
        print("   Final PM2.5: \(String(format: "%.1f", result.finalPM25)) ± \(String(format: "%.1f", result.uncertainty)) μg/m³")
        print("   Confidence: \(String(format: "%.1f%%", result.confidence * 100))")
        
        return result
    }
    
    private func performBayesianFusion(sources: [PM25Source]) -> FusionResult {
        
        let totalConfidence = sources.map { $0.confidence }.reduce(0, +)
        let weights = sources.map { $0.confidence / totalConfidence }
        
        var weightedSum: Double = 0
        for (index, source) in sources.enumerated() {
            weightedSum += source.value * weights[index]
        }
        
        let finalPM25 = weightedSum
        
        var varianceSum: Double = 0
        for (index, source) in sources.enumerated() {
            let diff = source.value - finalPM25
            varianceSum += weights[index] * pow(diff, 2)
        }
        
        let uncertainty = sqrt(varianceSum)
        
        let baseConfidence = sources.map { $0.confidence }.reduce(0, +) / Double(sources.count)
        let agreementBonus = calculateAgreementBonus(sources: sources, finalPM25: finalPM25)
        let multiSourceBonus = sources.count > 1 ? 0.05 : 0.0
        
        let finalConfidence = min(1.0, baseConfidence + agreementBonus + multiSourceBonus)
        
        return FusionResult(
            finalPM25: finalPM25,
            confidence: finalConfidence,
            uncertainty: uncertainty,
            sources: sources
        )
    }
    
    private func calculateAgreementBonus(sources: [PM25Source], finalPM25: Double) -> Double {
        guard sources.count > 1 else { return 0 }
        
        let deviations = sources.map { abs($0.value - finalPM25) }
        let avgDeviation = deviations.reduce(0, +) / Double(deviations.count)
        let coefficientOfVariation = avgDeviation / finalPM25
        
        let agreementBonus = max(0, 0.15 - coefficientOfVariation)
        
        return agreementBonus
    }
}

struct PM25Source: Identifiable {
    let id = UUID()
    let value: Double
    let confidence: Double
    let type: SourceType
    
    enum SourceType: String {
        case station = "Station"
        case camera = "Camera"
        case satellite = "Satellite"
    }
}

struct FusionResult {
    let finalPM25: Double
    let confidence: Double
    let uncertainty: Double
    let sources: [PM25Source]
    
    var confidencePercentage: Int {
        Int(confidence * 100)
    }
}
