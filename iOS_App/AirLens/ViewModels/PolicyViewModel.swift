//
//  PolicyViewModel.swift
//  AirLens
//
//  ViewModel for managing environmental policy data
//

import Foundation
import Combine

@MainActor
class PolicyViewModel: ObservableObject {
    @Published var policies: [Policy] = []
    @Published var isLoading = false
    @Published var error: Error?
    @Published var selectedCountry: String?
    @Published var selectedCategory: PolicyCategory?

    private let apiService: APIService
    private var cancellables = Set<AnyCancellable>()

    init(apiService: APIService = .shared) {
        self.apiService = apiService
    }

    func fetchPolicies(country: String? = nil, category: PolicyCategory? = nil) async {
        isLoading = true
        error = nil

        do {
            let response = try await apiService.fetchPolicies(
                country: country,
                category: category,
                limit: 100
            )
            policies = response.policies
        } catch {
            self.error = error
            print("Error fetching policies: \(error.localizedDescription)")
        }

        isLoading = false
    }

    func policiesByCountry() -> [String: [Policy]] {
        Dictionary(grouping: policies, by: { $0.country })
    }

    func policiesByCategory() -> [PolicyCategory: [Policy]] {
        Dictionary(grouping: policies, by: { $0.category })
    }

    func filterPolicies(by searchText: String) -> [Policy] {
        guard !searchText.isEmpty else { return policies }

        return policies.filter {
            $0.title.localizedCaseInsensitiveContains(searchText) ||
            $0.description.localizedCaseInsensitiveContains(searchText) ||
            $0.country.localizedCaseInsensitiveContains(searchText) ||
            $0.authority.localizedCaseInsensitiveContains(searchText)
        }
    }

    func highCredibilityPolicies() -> [Policy] {
        policies.filter { $0.credibilityScore >= 0.95 }
    }

    func policiesFor(country: String) -> [Policy] {
        policies.filter { $0.country.lowercased() == country.lowercased() }
    }

    func policiesFor(category: PolicyCategory) -> [Policy] {
        policies.filter { $0.category == category }
    }

    func countriesCount() -> Int {
        Set(policies.map { $0.country }).count
    }

    func refresh() async {
        await fetchPolicies(country: selectedCountry, category: selectedCategory)
    }

    // Load mock policies for offline/demo mode
    func loadMockPolicies() {
        policies = AppConstants.mockPolicies
    }
}
