//
//  AirPolicy.swift
//  AirLens
//
//  Environmental policy tracking model
//

import Foundation

// MARK: - Air Policy
struct AirPolicy: Identifiable, Codable, Hashable {
    let id: String
    let country: String
    let countryCode: String // ISO 3166-1 alpha-2
    let authority: String // e.g., "EPA", "EEA", "AirKorea"
    let category: PolicyCategory
    let title: String
    let description: String?
    let url: URL?
    let effectiveDate: Date
    let lastUpdated: Date
    let credibility: Double // 0.0 to 1.0

    // Additional metadata
    let targets: [PolicyTarget]?
    let status: PolicyStatus
    let region: String? // Specific region if applicable

    var credibilityBadge: String {
        if credibility >= 0.9 { return "🥇" }
        if credibility >= 0.7 { return "🥈" }
        if credibility >= 0.5 { return "🥉" }
        return "⚠️"
    }

    var isCurrent: Bool {
        effectiveDate <= Date()
    }

    var daysSinceUpdate: Int {
        Calendar.current.dateComponents([.day], from: lastUpdated, to: Date()).day ?? 0
    }
}

// MARK: - Policy Category
enum PolicyCategory: String, Codable, CaseIterable {
    case emissions = "Emissions Control"
    case monitoring = "Air Quality Monitoring"
    case transportation = "Transportation"
    case industrial = "Industrial Regulation"
    case residential = "Residential"
    case research = "Research & Development"
    case publicHealth = "Public Health"
    case international = "International Agreement"

    var icon: String {
        switch self {
        case .emissions: return "smoke.fill"
        case .monitoring: return "sensor.fill"
        case .transportation: return "car.fill"
        case .industrial: return "building.2.fill"
        case .residential: return "house.fill"
        case .research: return "flask.fill"
        case .publicHealth: return "heart.fill"
        case .international: return "globe"
        }
    }

    var color: String {
        switch self {
        case .emissions: return "FF6B6B"
        case .monitoring: return "4ECDC4"
        case .transportation: return "45B7D1"
        case .industrial: return "FFA07A"
        case .residential: return "98D8C8"
        case .research: return "6C5CE7"
        case .publicHealth: return "FF7675"
        case .international: return "74B9FF"
        }
    }
}

// MARK: - Policy Status
enum PolicyStatus: String, Codable {
    case proposed = "Proposed"
    case active = "Active"
    case expired = "Expired"
    case underReview = "Under Review"
    case suspended = "Suspended"

    var color: String {
        switch self {
        case .proposed: return "FFC107"
        case .active: return "4CAF50"
        case .expired: return "9E9E9E"
        case .underReview: return "2196F3"
        case .suspended: return "FF5722"
        }
    }
}

// MARK: - Policy Target
struct PolicyTarget: Codable, Hashable {
    let pollutant: String // e.g., "PM2.5", "NO2", "O3"
    let targetValue: Double
    let unit: String // e.g., "μg/m³", "ppb"
    let deadline: Date?
    let currentValue: Double?

    var progress: Double? {
        guard let current = currentValue, targetValue > 0 else { return nil }
        return min(1.0, max(0.0, 1.0 - (current / targetValue)))
    }

    var formattedTarget: String {
        "\(targetValue) \(unit)"
    }
}

// MARK: - Policy Statistics
struct PolicyStatistics {
    let totalPolicies: Int
    let countriesCount: Int
    let categoriesDistribution: [PolicyCategory: Int]
    let averageCredibility: Double
    let mostRecentUpdate: Date?

    init(policies: [AirPolicy]) {
        self.totalPolicies = policies.count
        self.countriesCount = Set(policies.map { $0.countryCode }).count

        var distribution: [PolicyCategory: Int] = [:]
        for category in PolicyCategory.allCases {
            distribution[category] = policies.filter { $0.category == category }.count
        }
        self.categoriesDistribution = distribution

        if !policies.isEmpty {
            self.averageCredibility = policies.map { $0.credibility }.reduce(0, +) / Double(policies.count)
            self.mostRecentUpdate = policies.map { $0.lastUpdated }.max()
        } else {
            self.averageCredibility = 0
            self.mostRecentUpdate = nil
        }
    }
}

// MARK: - Country Policy Summary
struct CountryPolicySummary: Identifiable {
    let id: String // country code
    let country: String
    let countryCode: String
    let policiesCount: Int
    let averageCredibility: Double
    let categories: Set<PolicyCategory>
    let lastUpdated: Date?
}
