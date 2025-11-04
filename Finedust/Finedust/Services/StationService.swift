//
//  StationService.swift
//  Finedust
//
//  Service for fetching air quality station data
//

import Foundation
import CoreLocation

class StationService {
    
    private let networkService: NetworkService
    private let waqiAPIKey: String = "demo"
    
    init(networkService: NetworkService = .shared) {
        self.networkService = networkService
    }
    
    func fetchNearbyStations(latitude: Double, longitude: Double, radius: Double = 50) async throws -> [AirQualityStation] {
        
        let stations = try await fetchWAQIStations(latitude: latitude, longitude: longitude, radius: radius)
        
        print("✅ Fetched \(stations.count) nearby stations")
        
        return stations
    }
    
    func interpolatePM25(at location: CLLocationCoordinate2D, from stations: [AirQualityStation]) -> Double {
        
        guard !stations.isEmpty else {
            print("⚠️ No stations for interpolation")
            return 25.0
        }
        
        var weightedSum: Double = 0
        var totalWeight: Double = 0
        
        for station in stations.prefix(10) {
            let distance = calculateDistance(from: location, to: station.coordinate)
            let weight = 1.0 / pow(distance + 0.1, 2)
            
            weightedSum += station.pm25 * weight
            totalWeight += weight
        }
        
        let interpolatedPM25 = weightedSum / totalWeight
        
        print("🔮 IDW Interpolation: PM2.5 = \(String(format: "%.1f", interpolatedPM25)) μg/m³")
        
        return interpolatedPM25
    }
    
    private func fetchWAQIStations(latitude: Double, longitude: Double, radius: Double) async throws -> [AirQualityStation] {
        
        let latDelta = radius / 111.0
        let lonDelta = radius / (111.0 * cos(latitude * .pi / 180))
        
        let lat1 = latitude - latDelta
        let lon1 = longitude - lonDelta
        let lat2 = latitude + latDelta
        let lon2 = longitude + lonDelta
        
        let urlString = "https://api.waqi.info/map/bounds/?latlng=\(lat1),\(lon1),\(lat2),\(lon2)&token=\(waqiAPIKey)"
        
        guard let url = URL(string: urlString) else {
            return generateMockStations(around: CLLocationCoordinate2D(latitude: latitude, longitude: longitude), count: 5)
        }
        
        do {
            let response: WAQIResponse = try await networkService.get(url: url)
            
            guard response.status == "ok", let data = response.data else {
                return generateMockStations(around: CLLocationCoordinate2D(latitude: latitude, longitude: longitude), count: 5)
            }
            
            return data.map { waqiStation in
                AirQualityStation(
                    id: "\(waqiStation.uid)",
                    name: waqiStation.station?.name ?? "Unknown",
                    latitude: waqiStation.lat,
                    longitude: waqiStation.lon,
                    pm25: Double(waqiStation.aqi) ?? 0,
                    aqi: Int(waqiStation.aqi) ?? 0,
                    timestamp: Date()
                )
            }
        } catch {
            print("⚠️ WAQI API error, using mock data: \(error)")
            return generateMockStations(around: CLLocationCoordinate2D(latitude: latitude, longitude: longitude), count: 5)
        }
    }
    
    private func generateMockStations(around location: CLLocationCoordinate2D, count: Int) -> [AirQualityStation] {
        var stations: [AirQualityStation] = []
        
        for i in 0..<count {
            let latOffset = Double.random(in: -0.1...0.1)
            let lonOffset = Double.random(in: -0.1...0.1)
            let pm25 = Double.random(in: 10...60)
            
            let station = AirQualityStation(
                id: "mock_\(i)",
                name: "Station \(i+1)",
                latitude: location.latitude + latOffset,
                longitude: location.longitude + lonOffset,
                pm25: pm25,
                aqi: Int(pm25),
                timestamp: Date()
            )
            
            stations.append(station)
        }
        
        return stations
    }
    
    private func calculateDistance(from: CLLocationCoordinate2D, to: CLLocationCoordinate2D) -> Double {
        let location1 = CLLocation(latitude: from.latitude, longitude: from.longitude)
        let location2 = CLLocation(latitude: to.latitude, longitude: to.longitude)
        return location1.distance(from: location2) / 1000.0
    }
}

struct WAQIResponse: Codable {
    let status: String
    let data: [WAQIStation]?
}

struct WAQIStation: Codable {
    let lat: Double
    let lon: Double
    let uid: Int
    let aqi: String
    let station: WAQIStationInfo?
}

struct WAQIStationInfo: Codable {
    let name: String
    let time: String?
}
