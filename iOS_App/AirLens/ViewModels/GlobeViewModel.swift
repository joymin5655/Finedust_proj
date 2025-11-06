//
//  GlobeViewModel.swift
//  AirLens
//
//  ViewModel for managing globe view and station markers
//

import Foundation
import CoreLocation
import Combine

@MainActor
class GlobeViewModel: ObservableObject {
    @Published var stations: [Station] = []
    @Published var selectedStation: Station?
    @Published var showPolicyPanel = false
    @Published var policiesForSelectedCountry: [Policy] = []
    @Published var isLoading = false
    @Published var error: Error?

    private let stationViewModel: StationViewModel
    private let policyViewModel: PolicyViewModel
    private var cancellables = Set<AnyCancellable>()

    init(
        stationViewModel: StationViewModel = StationViewModel(),
        policyViewModel: PolicyViewModel = PolicyViewModel()
    ) {
        self.stationViewModel = stationViewModel
        self.policyViewModel = policyViewModel

        // Observe station changes
        stationViewModel.$stations
            .sink { [weak self] stations in
                self?.stations = stations
            }
            .store(in: &cancellables)
    }

    func loadGlobeStations() async {
        isLoading = true

        // Load stations
        await stationViewModel.fetchStations(limit: 100)

        // Load policies
        await policyViewModel.fetchPolicies()

        isLoading = false
    }

    func selectStation(_ station: Station) {
        selectedStation = station
        loadPoliciesForStation(station)
        showPolicyPanel = true
    }

    func deselectStation() {
        selectedStation = nil
        showPolicyPanel = false
        policiesForSelectedCountry = []
    }

    func loadPoliciesForStation(_ station: Station) {
        policiesForSelectedCountry = policyViewModel.policiesFor(country: station.country)
    }

    func majorCityStations() -> [Station] {
        // Filter stations that are in major cities
        let majorCities = AppConstants.globeStations.map { $0.city }
        return stations.filter { station in
            majorCities.contains(where: { $0.lowercased() == station.city.lowercased() })
        }
    }

    // Generate mock stations for demo/offline mode
    func loadMockStations() {
        stations = AppConstants.globeStations.enumerated().map { index, location in
            Station(
                id: "\(index)",
                name: location.name,
                country: location.country,
                city: location.city,
                latitude: location.lat,
                longitude: location.lon,
                pm25: Double.random(in: 5...85),
                pm10: Double.random(in: 10...120),
                aqi: Int.random(in: 20...150),
                lastUpdate: ISO8601DateFormatter().string(from: Date()),
                source: "Mock Data",
                dominantPollutant: "PM2.5"
            )
        }

        policyViewModel.loadMockPolicies()
    }

    func refresh() async {
        await loadGlobeStations()
    }

    // Arc data for connecting cities (for visualization)
    struct Arc: Identifiable {
        let id = UUID()
        let from: CLLocationCoordinate2D
        let to: CLLocationCoordinate2D
        let color: String

        static let mockArcs: [Arc] = [
            Arc(
                from: CLLocationCoordinate2D(latitude: 38.9072, longitude: -77.0369), // Washington
                to: CLLocationCoordinate2D(latitude: 50.8503, longitude: 4.3517), // Brussels
                color: "blue"
            ),
            Arc(
                from: CLLocationCoordinate2D(latitude: 37.5665, longitude: 126.9780), // Seoul
                to: CLLocationCoordinate2D(latitude: 35.6762, longitude: 139.6503), // Tokyo
                color: "green"
            ),
            Arc(
                from: CLLocationCoordinate2D(latitude: 51.5074, longitude: -0.1278), // London
                to: CLLocationCoordinate2D(latitude: 50.8503, longitude: 4.3517), // Brussels
                color: "purple"
            ),
            Arc(
                from: CLLocationCoordinate2D(latitude: 39.9042, longitude: 116.4074), // Beijing
                to: CLLocationCoordinate2D(latitude: 28.7041, longitude: 77.1025), // Delhi
                color: "orange"
            )
        ]
    }
}
