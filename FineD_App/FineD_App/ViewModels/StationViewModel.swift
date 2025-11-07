//
//  StationViewModel.swift
//  FineD_App
//
//  Created on 2025-11-06.
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
