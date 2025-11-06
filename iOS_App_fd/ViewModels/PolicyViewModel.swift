//
//  PolicyViewModel.swift
//  AirLens
//
//  Environmental policy management
//

import Foundation
import Combine

@MainActor
class PolicyViewModel: ObservableObject {
    @Published var policies: [AirPolicy] = []
    @Published var filteredPolicies: [AirPolicy] = []
    @Published var isLoading = false
    @Published var error: Error?
    @Published var selectedCategory: PolicyCategory?
    @Published var searchText = ""

    init() {
        loadCachedPolicies()
    }

    func fetchPolicies() async {
        isLoading = true
        error = nil

        do {
            try await Task.sleep(nanoseconds: 1_000_000_000)

            let mockPolicies = generateMockPolicies()
            self.policies = mockPolicies
            self.filteredPolicies = mockPolicies
            cachePolicies(mockPolicies)

            isLoading = false
        } catch {
            self.error = error
            isLoading = false
        }
    }

    func filterPolicies(category: PolicyCategory?) {
        selectedCategory = category

        if let category = category {
            filteredPolicies = policies.filter { $0.category == category }
        } else {
            filteredPolicies = policies
        }
    }

    private func loadCachedPolicies() {
        if let data = UserDefaults.standard.data(forKey: "cached_policies"),
           let cached = try? JSONDecoder().decode([AirPolicy].self, from: data) {
            self.policies = cached
            self.filteredPolicies = cached
        }
    }

    private func cachePolicies(_ policies: [AirPolicy]) {
        if let data = try? JSONEncoder().encode(policies) {
            UserDefaults.standard.set(data, forKey: "cached_policies")
        }
    }

    private func generateMockPolicies() -> [AirPolicy] {
        return [
            AirPolicy(
                id: "policy_1",
                country: "USA",
                countryCode: "US",
                authority: "EPA",
                category: .emissions,
                title: "Clean Air Act",
                description: "Federal law to control air pollution",
                url: URL(string: "https://www.epa.gov/clean-air-act-overview"),
                effectiveDate: Date(),
                lastUpdated: Date(),
                credibility: 0.95,
                targets: nil,
                status: .active,
                region: nil
            ),
            AirPolicy(
                id: "policy_2",
                country: "South Korea",
                countryCode: "KR",
                authority: "Ministry of Environment",
                category: .monitoring,
                title: "Air Quality Monitoring Network",
                description: "National air quality monitoring system",
                url: nil,
                effectiveDate: Date(),
                lastUpdated: Date(),
                credibility: 0.9,
                targets: nil,
                status: .active,
                region: nil
            )
        ]
    }
}
