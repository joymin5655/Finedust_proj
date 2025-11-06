//
//  Policy.swift
//  AirLens
//
//  Environmental policy model
//

import Foundation

struct Policy: Codable, Identifiable {
    let id: String
    let country: String
    let title: String
    let description: String
    let category: PolicyCategory
    let effectiveDate: String
    let authority: String
    let link: String?
    let credibilityScore: Double

    enum CodingKeys: String, CodingKey {
        case id
        case country
        case title
        case description
        case category
        case effectiveDate = "effective_date"
        case authority
        case link
        case credibilityScore = "credibility_score"
    }

    var credibilityColor: String {
        if credibilityScore >= 0.95 {
            return "green"
        } else if credibilityScore >= 0.90 {
            return "yellow"
        } else {
            return "orange"
        }
    }

    var credibilityPercentage: Int {
        Int(credibilityScore * 100)
    }
}

enum PolicyCategory: String, Codable, CaseIterable {
    case emissions = "emissions"
    case monitoring = "monitoring"
    case health = "health"
    case transportation = "transportation"
    case industry = "industry"
    case research = "research"
    case international = "international"

    var displayName: String {
        switch self {
        case .emissions:
            return "Emissions Control"
        case .monitoring:
            return "Air Quality Monitoring"
        case .health:
            return "Public Health"
        case .transportation:
            return "Transportation"
        case .industry:
            return "Industrial Regulation"
        case .research:
            return "Research & Development"
        case .international:
            return "International Cooperation"
        }
    }

    var icon: String {
        switch self {
        case .emissions:
            return "smoke.fill"
        case .monitoring:
            return "chart.line.uptrend.xyaxis"
        case .health:
            return "heart.text.square.fill"
        case .transportation:
            return "car.fill"
        case .industry:
            return "building.2.fill"
        case .research:
            return "flask.fill"
        case .international:
            return "globe.americas.fill"
        }
    }

    var color: String {
        switch self {
        case .emissions:
            return "red"
        case .monitoring:
            return "blue"
        case .health:
            return "green"
        case .transportation:
            return "orange"
        case .industry:
            return "purple"
        case .research:
            return "cyan"
        case .international:
            return "indigo"
        }
    }
}

struct PolicyListResponse: Codable {
    let policies: [Policy]
    let total: Int
}
