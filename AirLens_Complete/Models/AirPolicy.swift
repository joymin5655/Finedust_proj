//
//  AirPolicy.swift
//  AirLens
//
//  Created on 2025-11-06
//

import Foundation

// MARK: - Air Policy Model
struct AirPolicy: Codable, Identifiable, Hashable {
    let id: String
    let source: String
    let country: String
    let title: String
    let description: String?
    let url: String
    let credibilityScore: Double
    let category: PolicyCategory
    let implementationDate: Date?
    let lastUpdated: Date
    
    enum CodingKeys: String, CodingKey {
        case id, source, country, title, description, url
        case credibilityScore = "credibility_score"
        case category
        case implementationDate = "implementation_date"
        case lastUpdated = "last_updated"
    }
}

// MARK: - Policy Category
enum PolicyCategory: String, Codable, CaseIterable {
    case emissions = "Emissions Reduction"
    case monitoring = "Air Quality Monitoring"
    case publicHealth = "Public Health"
    case transportation = "Clean Transportation"
    case industry = "Industrial Regulation"
    case research = "Research & Development"
    case international = "International Cooperation"
    
    var icon: String {
        switch self {
        case .emissions: return "smoke.fill"
        case .monitoring: return "chart.line.uptrend.xyaxis"
        case .publicHealth: return "heart.fill"
        case .transportation: return "car.fill"
        case .industry: return "building.2.fill"
        case .research: return "magnifyingglass"
        case .international: return "globe"
        }
    }
    
    var color: String {
        switch self {
        case .emissions: return "#FF6B6B"
        case .monitoring: return "#4ECDC4"
        case .publicHealth: return "#45B7D1"
        case .transportation: return "#96CEB4"
        case .industry: return "#FFEAA7"
        case .research: return "#DDA0DD"
        case .international: return "#98D8C8"
        }
    }
}

// MARK: - Policies Response
struct PoliciesResponse: Codable {
    let status: String
    let count: Int
    let data: [AirPolicy]
}

// MARK: - Policy Statistics
struct PolicyStatistics {
    let totalPolicies: Int
    let countriesWithPolicies: Int
    let averageCredibility: Double
    let categoryDistribution: [PolicyCategory: Int]
    
    init(from policies: [AirPolicy]) {
        self.totalPolicies = policies.count
        self.countriesWithPolicies = Set(policies.map { $0.country }).count
        self.averageCredibility = policies.isEmpty ? 0 :
            policies.map { $0.credibilityScore }.reduce(0, +) / Double(policies.count)
        
        var distribution: [PolicyCategory: Int] = [:]
        for category in PolicyCategory.allCases {
            distribution[category] = policies.filter { $0.category == category }.count
        }
        self.categoryDistribution = distribution
    }
}