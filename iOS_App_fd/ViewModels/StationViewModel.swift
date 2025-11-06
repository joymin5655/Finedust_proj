//
//  StationViewModel.swift
//  AirLens
//
//  Station data management with caching (PRD)
//

import Foundation
import Combine
import CoreLocation

@MainActor
class StationViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var stations: [Station] = []
    @Published var nearbyStations: [Station] = []
    @Published var isLoading = false
    @Published var error: Error?
    @Published var statistics = StationStatistics(stations: [])
    @Published var lastUpdated: Date?

    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let cacheKey = "cached_stations"
    private let cacheTTL: TimeInterval = 600 // 10 minutes (PRD)

    // MARK: - Initialization
    init() {
        loadCachedStations()
    }

    // MARK: - Public Methods

    /// Fetch stations from API with caching (PRD: 10-min TTL)
    func fetchStations() async {
        // Check cache first
        if let cached = loadCachedStations(), isCacheValid() {
            print("✅ Using cached stations")
            return
        }

        isLoading = true
        error = nil

        do {
            // Simulate API call
            try await Task.sleep(nanoseconds: 1_000_000_000)

            // Mock data - in production, call actual API
            let mockStations = generateMockStations()

            self.stations = mockStations
            self.statistics = StationStatistics(stations: mockStations)
            self.lastUpdated = Date()

            // Cache the data
            cacheStations(mockStations)

            isLoading = false
        } catch {
            self.error = error
            isLoading = false
        }
    }

    /// Find nearby stations using current location
    func findNearbyStations(latitude: Double, longitude: Double, radius: Double = 50) async {
        let location = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)

        // Calculate distances and sort
        let stationsWithDistance = stations.map { station -> (station: Station, distance: Double) in
            let distance = LocationService.shared.distance(
                from: location,
                to: station.coordinate
            )
            return (station, distance)
        }

        // Filter by radius and sort by distance
        nearbyStations = stationsWithDistance
            .filter { $0.distance <= radius }
            .sorted { $0.distance < $1.distance }
            .map { $0.station }

        print("📍 Found \(nearbyStations.count) stations within \(radius)km")
    }

    /// Load satellite data (PRD: 3-hour cadence)
    func loadSatelliteData() async {
        // Placeholder for satellite data loading
        print("🛰️ Loading satellite data...")
    }

    // MARK: - Caching

    private func loadCachedStations() -> [Station]? {
        guard let data = UserDefaults.standard.data(forKey: cacheKey) else {
            return nil
        }

        do {
            let cached = try JSONDecoder().decode([Station].self, from: data)
            self.stations = cached
            self.statistics = StationStatistics(stations: cached)
            return cached
        } catch {
            print("❌ Failed to load cached stations: \(error)")
            return nil
        }
    }

    private func cacheStations(_ stations: [Station]) {
        do {
            let data = try JSONEncoder().encode(stations)
            UserDefaults.standard.set(data, forKey: cacheKey)
            UserDefaults.standard.set(Date(), forKey: "\(cacheKey)_timestamp")
        } catch {
            print("❌ Failed to cache stations: \(error)")
        }
    }

    private func isCacheValid() -> Bool {
        guard let timestamp = UserDefaults.standard.object(forKey: "\(cacheKey)_timestamp") as? Date else {
            return false
        }

        let age = Date().timeIntervalSince(timestamp)
        return age < cacheTTL
    }

    // MARK: - Mock Data Generation

    private func generateMockStations() -> [Station] {
        let cities: [(name: String, lat: Double, lon: Double, country: String)] = [
            ("Seoul", 37.5665, 126.9780, "South Korea"),
            ("Tokyo", 35.6762, 139.6503, "Japan"),
            ("Beijing", 39.9042, 116.4074, "China"),
            ("New York", 40.7128, -74.0060, "USA"),
            ("London", 51.5074, -0.1278, "UK"),
            ("Paris", 48.8566, 2.3522, "France"),
            ("Los Angeles", 34.0522, -118.2437, "USA"),
            ("Delhi", 28.7041, 77.1025, "India"),
            ("Singapore", 1.3521, 103.8198, "Singapore"),
            ("Sydney", -33.8688, 151.2093, "Australia")
        ]

        return cities.enumerated().map { index, city in
            Station(
                id: "station_\(index)",
                name: "\(city.name) Central",
                latitude: city.lat,
                longitude: city.lon,
                country: city.country,
                pm25: Double.random(in: 5...80),
                pm10: Double.random(in: 10...120),
                aqi: Int.random(in: 20...150),
                updatedAt: Date().addingTimeInterval(-Double.random(in: 0...600)),
                no2: Double.random(in: 10...60),
                o3: Double.random(in: 20...100),
                so2: Double.random(in: 5...30),
                co: Double.random(in: 0.1...2.0),
                source: "WAQI",
                credibility: Double.random(in: 0.7...1.0)
            )
        }
    }
}
