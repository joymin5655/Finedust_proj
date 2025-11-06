//
//  StationViewModel.swift
//  AirLens
//
//  ViewModel for managing air quality station data
//

import Foundation
import CoreLocation
import Combine

@MainActor
class StationViewModel: ObservableObject {
    @Published var stations: [Station] = []
    @Published var nearbyStations: [Station] = []
    @Published var isLoading = false
    @Published var error: Error?
    @Published var selectedCountry: String?
    @Published var statistics: Statistics?

    private let apiService: APIService
    private var cancellables = Set<AnyCancellable>()

    init(apiService: APIService = .shared) {
        self.apiService = apiService
    }

    func fetchStations(country: String? = nil, limit: Int = 100) async {
        isLoading = true
        error = nil

        do {
            let response = try await apiService.fetchStations(country: country, limit: limit)
            stations = response.stations
        } catch {
            self.error = error
            print("Error fetching stations: \(error.localizedDescription)")
        }

        isLoading = false
    }

    func fetchNearbyStations(latitude: Double, longitude: Double, radius: Double = 100) async {
        isLoading = true
        error = nil

        do {
            let response = try await apiService.fetchNearbyStations(
                latitude: latitude,
                longitude: longitude,
                radius: radius
            )
            nearbyStations = response.stations
        } catch {
            self.error = error
            print("Error fetching nearby stations: \(error.localizedDescription)")
        }

        isLoading = false
    }

    func fetchStatistics() async {
        do {
            statistics = try await apiService.fetchStatistics()
        } catch {
            self.error = error
            print("Error fetching statistics: \(error.localizedDescription)")
        }
    }

    func stationsByCountry() -> [String: [Station]] {
        Dictionary(grouping: stations, by: { $0.country })
    }

    func topPollutedStations(limit: Int = 10) -> [Station] {
        stations.sorted { $0.pm25 > $1.pm25 }.prefix(limit).map { $0 }
    }

    func cleanestStations(limit: Int = 10) -> [Station] {
        stations.sorted { $0.pm25 < $1.pm25 }.prefix(limit).map { $0 }
    }

    func averagePM25() -> Double {
        guard !stations.isEmpty else { return 0 }
        let total = stations.reduce(0.0) { $0 + $1.pm25 }
        return total / Double(stations.count)
    }

    func countriesCount() -> Int {
        Set(stations.map { $0.country }).count
    }

    func filterStations(by searchText: String) -> [Station] {
        guard !searchText.isEmpty else { return stations }

        return stations.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.city.localizedCaseInsensitiveContains(searchText) ||
            $0.country.localizedCaseInsensitiveContains(searchText)
        }
    }

    func refresh() async {
        await fetchStations(country: selectedCountry)
        await fetchStatistics()
    }
}
