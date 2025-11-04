//
//  GlobeViewModel.swift
//  Finedust
//
//  ViewModel for Globe visualization
//

import Foundation
import CoreLocation
import Combine

class GlobeViewModel: ObservableObject {
    
    @Published var stations: [AirQualityStation] = []
    @Published var isLoading: Bool = false
    @Published var error: String?
    @Published var selectedStation: AirQualityStation?
    @Published var filterLevel: AQIFilter = .all
    @Published var userLocation: CLLocationCoordinate2D?
    
    private var cancellables = Set<AnyCancellable>()
    private let stationService: StationService
    private var lastUpdateTime: Date?
    private let updateInterval: TimeInterval = 600
    
    init(stationService: StationService = StationService()) {
        self.stationService = stationService
    }
    
    func loadNearbyStations(around location: CLLocationCoordinate2D, radius: Double = 100) async {
        if let lastUpdate = lastUpdateTime,
           Date().timeIntervalSince(lastUpdate) < updateInterval {
            print("📍 Using cached station data")
            return
        }
        
        await MainActor.run {
            isLoading = true
            error = nil
        }
        
        do {
            let fetchedStations = try await stationService.fetchNearbyStations(
                latitude: location.latitude,
                longitude: location.longitude,
                radius: radius
            )
            
            await MainActor.run {
                self.stations = fetchedStations
                self.userLocation = location
                self.lastUpdateTime = Date()
                self.isLoading = false
                print("✅ Loaded \(fetchedStations.count) stations")
            }
        } catch {
            await MainActor.run {
                self.error = "Failed to load stations: \(error.localizedDescription)"
                self.isLoading = false
                print("❌ Failed to load stations: \(error)")
            }
        }
    }
    
    func refresh() async {
        lastUpdateTime = nil
        if let location = userLocation {
            await loadNearbyStations(around: location)
        }
    }
    
    func applyFilter(_ filter: AQIFilter) {
        self.filterLevel = filter
    }
    
    func filteredStations() -> [AirQualityStation] {
        switch filterLevel {
        case .all:
            return stations
        case .good:
            return stations.filter { $0.pm25 <= 12 }
        case .moderate:
            return stations.filter { $0.pm25 > 12 && $0.pm25 <= 35 }
        case .unhealthy:
            return stations.filter { $0.pm25 > 35 }
        }
    }
}

enum AQIFilter: String, CaseIterable {
    case all = "All"
    case good = "Good"
    case moderate = "Moderate"
    case unhealthy = "Unhealthy"
}

struct AirQualityStation: Identifiable, Codable {
    let id: String
    let name: String
    let latitude: Double
    let longitude: Double
    let pm25: Double
    let aqi: Int
    let timestamp: Date
    
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
}
