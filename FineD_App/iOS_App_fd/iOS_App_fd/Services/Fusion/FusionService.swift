//
//  FusionService.swift
//  AirLens
//
//  Triple-source verification with Bayesian weighted fusion (PRD)
//

import Foundation
import CoreLocation

// MARK: - Fusion Service
class FusionService {
    static let shared = FusionService()

    private init() {}

    // MARK: - Triple Verification Fusion

    /// Fuse predictions from three sources with Bayesian weighting
    func fusePredictions(
        cameraPrediction: Double,
        cameraConfidence: Double,
        nearbyStations: [Station],
        satelliteAOD: Double?,
        location: CLLocationCoordinate2D
    ) async -> PredictionResult {

        // Tier 1: Station IDW interpolation
        let (stationPM25, stationConfidence) = calculateStationPrediction(
            nearbyStations: nearbyStations,
            location: location
        )

        // Tier 2: Camera prediction (already provided)
        let cameraPM25 = cameraPrediction
        let cameraConf = cameraConfidence

        // Tier 3: Satellite AOD conversion
        let (satellitePM25, satelliteConfidence) = convertSatelliteAOD(
            aod: satelliteAOD,
            location: location
        )

        // Bayesian weighted fusion
        let fusedResult = bayesianFusion(
            cameraValue: cameraPM25,
            cameraConfidence: cameraConf,
            stationValue: stationPM25,
            stationConfidence: stationConfidence,
            satelliteValue: satellitePM25,
            satelliteConfidence: satelliteConfidence,
            nearbyStations: nearbyStations
        )

        return fusedResult
    }

    // MARK: - Tier 1: Station IDW Interpolation

    private func calculateStationPrediction(
        nearbyStations: [Station],
        location: CLLocationCoordinate2D
    ) -> (pm25: Double?, confidence: Double?) {

        guard !nearbyStations.isEmpty else {
            return (nil, nil)
        }

        // Use K nearest stations (PRD: K=5)
        let k = min(5, nearbyStations.count)
        let nearest = Array(nearbyStations.prefix(k))

        // IDW (Inverse Distance Weighting)
        var weightedSum: Double = 0
        var weightSum: Double = 0

        for station in nearest {
            let distance = LocationService.shared.distance(
                from: location,
                to: station.coordinate
            )

            // Avoid division by zero
            let weight = 1.0 / max(distance, 0.1)
            weightedSum += station.pm25 * weight
            weightSum += weight
        }

        let interpolatedPM25 = weightedSum / weightSum

        // Calculate confidence based on:
        // 1. Number of stations
        // 2. Distance to nearest station
        // 3. Data freshness
        let confidence = calculateStationConfidence(
            stations: nearest,
            location: location
        )

        return (interpolatedPM25, confidence)
    }

    private func calculateStationConfidence(
        stations: [Station],
        location: CLLocationCoordinate2D
    ) -> Double {

        guard !stations.isEmpty else { return 0 }

        // Factor 1: Number of stations (more = higher confidence)
        let countFactor = min(Double(stations.count) / 5.0, 1.0)

        // Factor 2: Distance to nearest (closer = higher confidence)
        let nearestDistance = LocationService.shared.distance(
            from: location,
            to: stations[0].coordinate
        )
        let distanceFactor = max(0, 1.0 - (nearestDistance / 10.0)) // Decay over 10km

        // Factor 3: Data freshness
        let freshCount = stations.filter { $0.isDataFresh }.count
        let freshnessFactor = Double(freshCount) / Double(stations.count)

        // Weighted combination
        let confidence = (countFactor * 0.4) + (distanceFactor * 0.4) + (freshnessFactor * 0.2)

        return min(max(confidence, 0), 1.0)
    }

    // MARK: - Tier 3: Satellite AOD Conversion

    private func convertSatelliteAOD(
        aod: Double?,
        location: CLLocationCoordinate2D
    ) -> (pm25: Double?, confidence: Double?) {

        guard let aod = aod else {
            return (nil, nil)
        }

        // Regional calibration table (simplified)
        // In production, use comprehensive lookup table
        let conversionFactor = getRegionalConversionFactor(for: location)

        // AOD to PM2.5 conversion
        // PM2.5 ≈ AOD × conversion_factor
        let pm25 = aod * conversionFactor

        // Confidence based on AOD quality and age
        let confidence = 0.6 // Moderate confidence for satellite data

        return (pm25, confidence)
    }

    private func getRegionalConversionFactor(for location: CLLocationCoordinate2D) -> Double {
        // Simplified regional factors
        // In production, use comprehensive regional calibration
        let latitude = location.latitude

        if latitude > 30 && latitude < 50 { // Mid-latitudes
            return 120.0
        } else if latitude >= -30 && latitude <= 30 { // Tropics
            return 150.0
        } else { // High latitudes
            return 100.0
        }
    }

    // MARK: - Bayesian Weighted Fusion

    private func bayesianFusion(
        cameraValue: Double,
        cameraConfidence: Double,
        stationValue: Double?,
        stationConfidence: Double?,
        satelliteValue: Double?,
        satelliteConfidence: Double?,
        nearbyStations: [Station]
    ) -> PredictionResult {

        var sources: [(value: Double, confidence: Double, weight: Double)] = []

        // Camera source (always present)
        sources.append((cameraValue, cameraConfidence, cameraConfidence))

        // Station source
        if let stationVal = stationValue, let stationConf = stationConfidence {
            sources.append((stationVal, stationConf, stationConf))
        }

        // Satellite source
        if let satVal = satelliteValue, let satConf = satelliteConfidence {
            sources.append((satVal, satConf, satConf))
        }

        // Normalize weights
        let totalWeight = sources.reduce(0.0) { $0 + $1.weight }
        let normalizedSources = sources.map { (
            value: $0.value,
            confidence: $0.confidence,
            weight: $0.weight / totalWeight
        )}

        // Weighted average
        let fusedPM25 = normalizedSources.reduce(0.0) {
            $0 + ($1.value * $1.weight)
        }

        // Weighted confidence
        let fusedConfidence = normalizedSources.reduce(0.0) {
            $0 + ($1.confidence * $1.weight)
        }

        // Consistency bonus: reduce uncertainty if sources agree
        let consistency = calculateConsistency(sources: sources.map { $0.value })
        let adjustedConfidence = min(fusedConfidence * (1 + consistency * 0.2), 1.0)

        // Calculate uncertainty
        let uncertainty = calculateUncertainty(
            sources: sources.map { $0.value },
            confidence: adjustedConfidence
        )

        // Create breakdown
        let breakdown = PredictionBreakdown(
            camera: normalizedSources[0].weight,
            station: normalizedSources.count > 1 ? normalizedSources[1].weight : nil,
            satellite: normalizedSources.count > 2 ? normalizedSources[2].weight : nil,
            cameraValue: cameraValue,
            stationValue: stationValue,
            satelliteValue: satelliteValue,
            cameraConfidence: cameraConfidence,
            stationConfidence: stationConfidence,
            satelliteConfidence: satelliteConfidence
        )

        return PredictionResult(
            pm25: fusedPM25,
            confidence: adjustedConfidence,
            uncertainty: uncertainty,
            breakdown: breakdown
        )
    }

    // MARK: - Helper Methods

    private func calculateConsistency(sources: [Double]) -> Double {
        guard sources.count > 1 else { return 0 }

        let mean = sources.reduce(0, +) / Double(sources.count)
        let variance = sources.reduce(0) { $0 + pow($1 - mean, 2) } / Double(sources.count)
        let stdDev = sqrt(variance)

        // Consistency: inversely proportional to standard deviation
        // Normalize to 0-1 range
        let consistency = max(0, 1.0 - (stdDev / mean))
        return consistency
    }

    private func calculateUncertainty(sources: [Double], confidence: Double) -> Double {
        guard sources.count > 1 else {
            // Single source: higher uncertainty
            return (1.0 - confidence) * 15.0
        }

        let mean = sources.reduce(0, +) / Double(sources.count)
        let variance = sources.reduce(0) { $0 + pow($1 - mean, 2) } / Double(sources.count)
        let stdDev = sqrt(variance)

        // Uncertainty combines standard deviation and confidence
        let baseUncertainty = stdDev * 1.5
        let confidenceFactor = (1.0 - confidence) * 10.0

        return min(baseUncertainty + confidenceFactor, 30.0) // Cap at ±30 μg/m³
    }
}
