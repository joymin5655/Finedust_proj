//
//  PolicyViewModel.swift
//  AirLens
//
//  Created on 2025-11-06
//

import Foundation
import Combine

@MainActor
class PolicyViewModel: ObservableObject {
    @Published var policies: [AirPolicy] = []
    @Published var selectedPolicy: AirPolicy?
    @Published var isLoading = false
    @Published var error: String?
    @Published var searchText = ""
    @Published var selectedCategory: PolicyCategory?
    @Published var selectedCountry: String?
    
    private let apiClient = APIClient.shared
    private let storageService = StorageService.shared
    
    // 필터링된 정책
    var filteredPolicies: [AirPolicy] {
        var result = policies
        
        // 검색어 필터
        if !searchText.isEmpty {
            result = result.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                $0.country.localizedCaseInsensitiveContains(searchText) ||
                ($0.description?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }
        
        // 카테고리 필터
        if let category = selectedCategory {
            result = result.filter { $0.category == category }
        }
        
        // 국가 필터
        if let country = selectedCountry {
            result = result.filter { $0.country == country }
        }
        
        return result
    }
    
    // 통계
    var statistics: PolicyStatistics {
        PolicyStatistics(from: policies)
    }
    
    // 국가 목록
    var availableCountries: [String] {
        Array(Set(policies.map { $0.country })).sorted()
    }
    
    // 신뢰도 높은 정책
    func getTopCrediblePolicies(limit: Int = 10) -> [AirPolicy] {
        policies.sorted { $0.credibilityScore > $1.credibilityScore }
            .prefix(limit)
            .map { $0 }
    }
    
    // MARK: - Data Loading
    
    // 정책 데이터 가져오기
    func fetchPolicies(country: String? = nil) async {
        isLoading = true
        error = nil
        
        do {
            // 캐시된 데이터 먼저 로드
            if let cachedPolicies = storageService.loadPolicies() {
                self.policies = cachedPolicies
                print("✅ Loaded \(cachedPolicies.count) policies from cache")
            }
            
            // API에서 최신 데이터 가져오기
            let fetchedPolicies = try await apiClient.fetchPolicies(country: country)
            self.policies = fetchedPolicies
            
            // 캐시에 저장
            storageService.savePolicies(fetchedPolicies)
            
            print("✅ Loaded \(fetchedPolicies.count) policies from API")
        } catch {
            self.error = error.localizedDescription
            print("❌ Error loading policies: \(error)")
        }
        
        isLoading = false
    }
    
    // 정책 선택
    func selectPolicy(_ policy: AirPolicy) {
        selectedPolicy = policy
    }
    
    // 데이터 새로고침
    func refresh() async {
        await fetchPolicies()
    }
}