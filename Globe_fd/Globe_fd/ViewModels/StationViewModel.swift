//
//  StationViewModel.swift
//  Globe_fd
//
//  Created on 2025-11-05.
//

import Foundation
import Combine

@MainActor
class StationViewModel: ObservableObject {
    @Published var stations: [Station] = []
    @Published var isLoading = false
    @Published var error: String?
    
    private let apiClient = APIClient.shared
    
    func fetchStations(country: String? = nil) async {
        isLoading = true
        error = nil
        
        do {
            self.stations = try await apiClient.fetchStations(country: country)
            print("✅ Loaded \(self.stations.count) stations")
        } catch {
            self.error = error.localizedDescription
            print("❌ Error loading stations: \(error)")
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
