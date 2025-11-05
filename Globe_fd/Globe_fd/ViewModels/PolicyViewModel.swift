//
//  PolicyViewModel.swift
//  Globe_fd
//
//  Created on 2025-11-05.
//

import Foundation
import Combine

@MainActor
class PolicyViewModel: ObservableObject {
    @Published var policies: [AirPolicy] = []
    @Published var isLoading = false
    @Published var error: String?
    
    private let apiClient = APIClient.shared
    
    func fetchPolicies(country: String? = nil) async {
        isLoading = true
        error = nil
        
        do {
            self.policies = try await apiClient.fetchPolicies(country: country)
            print("✅ Loaded \(self.policies.count) policies")
        } catch {
            self.error = error.localizedDescription
            print("❌ Error loading policies: \(error)")
        }
        
        isLoading = false
    }
}
