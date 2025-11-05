//
//  StationViewModel.swift
//  Globe_fd
//
//  Created by JOYMIN on 11/5/25.
//
import Foundation
import Combine

class StationViewModel: ObservableObject {
    @Published var stations: [Station] = []
    @Published var isLoading = false
    @Published var error: String?
    
    private let apiClient = APIClient.shared
    
    @MainActor
    func fetchStations() async {
        isLoading = true
        do {
            self.stations = try await apiClient.fetchStations()
            print("✅ Loaded \(self.stations.count) stations")
        } catch {
            self.error = error.localizedDescription
            print("❌ Error: \(error)")
        }
        isLoading = false
    }
    
    func getHighestPM25(limit: Int = 5) -> [Station] {
        stations.sorted { $0.pm25 > $1.pm25 }.prefix(limit).map { $0 }
    }
    
    func getLowestPM25(limit: Int = 5) -> [Station] {
        stations.sorted { $0.pm25 < $1.pm25 }.prefix(limit).map { $0 }
    }
}
