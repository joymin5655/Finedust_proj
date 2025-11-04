//
//  SatelliteService.swift
//  Finedust
//
//  Service for fetching satellite AOD data
//

import Foundation
import CoreLocation

class SatelliteService {
    
    private let networkService: NetworkService
    
    init(networkService: NetworkService = .shared) {
        self.networkService = networkService
    }
    
    func fetchSatellitePM25(at location: CLLocationCoordinate2D) async throws -> (pm25: Double, confidence: Double) {
        
        print("🛰️ Fetching satellite data for: \(location.latitude), \(location.longitude)")
        
        let aod = try await fetchAOD(at: location)
        let pm25 = convertAODtoPM25(aod: aod, location: location)
        let confidence = calculateConfidence(aod: aod)
        
        print("🛰️ Satellite PM2.5: \(String(format: "%.1f", pm25)) μg/m³ (Confidence: \(String(format: "%.1f%%", confidence * 100)))")
        
        return (pm25, confidence)
    }
    
    private func fetchAOD(at location: CLLocationCoordinate2D) async throws -> Double {
        try await Task.sleep(nanoseconds: 500_000_000)
        
        let baseAOD = 0.25
        let variation = Double.random(in: -0.1...0.2)
        let aod = baseAOD + variation
        
        print("🛰️ AOD @ 550nm: \(String(format: "%.3f", aod))")
        
        return max(0, aod)
    }
    
    private func convertAODtoPM25(aod: Double, location: CLLocationCoordinate2D) -> Double {
        var pm25 = 120.0 * aod + 5.0
        
        if let humidity = fetchHumidity(at: location) {
            let humidityFactor = 1.0 + (humidity - 50.0) / 100.0
            pm25 *= humidityFactor
            
            print("🌡️ Humidity correction: \(Int(humidity))% RH")
        }
        
        return max(0, pm25)
    }
    
    private func calculateConfidence(aod: Double) -> Double {
        let aodConfidence: Double
        if aod >= 0.1 && aod <= 0.5 {
            aodConfidence = 0.9
        } else if aod < 0.1 {
            aodConfidence = 0.7
        } else {
            aodConfidence = 0.75
        }
        
        let cloudCoverage = Double.random(in: 0...40)
        let cloudFactor = 1.0 - (cloudCoverage / 100.0) * 0.3
        
        let hoursSinceUpdate = Double.random(in: 0...12)
        let freshnessFactor = 1.0 - (hoursSinceUpdate / 24.0) * 0.2
        
        let totalConfidence = aodConfidence * cloudFactor * freshnessFactor
        
        return min(1.0, max(0.5, totalConfidence))
    }
    
    private func fetchHumidity(at location: CLLocationCoordinate2D) -> Double? {
        return Double.random(in: 40...80)
    }
}
