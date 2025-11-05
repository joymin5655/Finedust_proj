//
//  PolicyViewModel.swift
//  Globe_fd
//
//  Created by JOYMIN on 11/5/25.
//
import Foundation
import Combine

class PolicyViewModel: ObservableObject {
    @Published var policies: [AirPolicy] = []
    @Published var isLoading = false
    @Published var error: String?
    
    private let apiClient = APIClient.shared
    
    @MainActor
    func fetchPolicies() async {
        isLoading = true
        do {
            self.policies = try await apiClient.fetchPolicies()
            print("✅ Loaded \(self.policies.count) policies")
        } catch {
            self.error = error.localizedDescription
            print("❌ Error: \(error)")
        }
        isLoading = false
    }
    
    func getPoliciesByCountry(_ country: String) -> [AirPolicy] {
        policies.filter { $0.country == country }
    }
}
