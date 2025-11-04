//
//  PolicyAnalysisModel.swift
//  Finedust
//
//  정책 시행 전후 미세먼지 변화 분석 모델
//

import Foundation
import SwiftUI

// MARK: - Policy Analysis Model
class PolicyAnalysisModel: ObservableObject {
    static let shared = PolicyAnalysisModel()
    
    @Published var countryPolicies: [CountryPolicy] = []
    @Published var analysisResults: [PolicyAnalysisResult] = []
    @Published var isAnalyzing = false
    
    // MARK: - Analyze Policy Impact
    func analyzePolicyImpact(for country: String) async -> PolicyAnalysisResult {
        isAnalyzing = true
        
        // 정책 정보 가져오기
        let policies = await fetchCountryPolicies(country: country)
        
        // 정책 시행 전후 데이터 수집
        let historicalData = await fetchHistoricalData(country: country)
        
        // 변화 추세 분석
        let trendAnalysis = analyzeTrend(data: historicalData, policies: policies)
        
        // 효과성 평가
        let effectiveness = evaluateEffectiveness(trendAnalysis)
        
        let result = PolicyAnalysisResult(
            country: country,
            policies: policies,
            beforeAverage: trendAnalysis.beforeAverage,
            afterAverage: trendAnalysis.afterAverage,
            percentageChange: trendAnalysis.percentageChange,
            trendDirection: trendAnalysis.direction,
            effectiveness: effectiveness,
            timeSeriesData: historicalData
        )
        
        analysisResults.append(result)
        isAnalyzing = false
        
        return result
    }
    
    // MARK: - Fetch Country Policies
    private func fetchCountryPolicies(country: String) async -> [EnvironmentPolicy] {
        // API 호출 또는 데이터베이스 조회
        // Mock data for demonstration
        switch country.lowercased() {
        case "korea", "south korea":
            return [
                EnvironmentPolicy(
                    id: UUID(),
                    title: "미세먼지 계절관리제",
                    description: "겨울철 고농도 미세먼지 저감 대책",
                    implementationDate: Date(timeIntervalSince1970: 1575158400), // 2019-12-01
                    category: .emission,
                    expectedReduction: 20
                ),
                EnvironmentPolicy(
                    id: UUID(),
                    title: "노후 경유차 운행제한",
                    description: "5등급 경유차 도심 진입 제한",
                    implementationDate: Date(timeIntervalSince1970: 1577836800), // 2020-01-01
                    category: .transport,
                    expectedReduction: 15
                )
            ]
        case "china":
            return [
                EnvironmentPolicy(
                    id: UUID(),
                    title: "Blue Sky Protection Campaign",
                    description: "대기질 개선 종합 대책",
                    implementationDate: Date(timeIntervalSince1970: 1514764800), // 2018-01-01
                    category: .comprehensive,
                    expectedReduction: 30
                )
            ]
        default:
            return []
        }
    }
    
    // MARK: - Fetch Historical Data
    private func fetchHistoricalData(country: String) async -> [TimeSeriesData] {
        // Historical PM2.5 data
        // Mock data generation
        var data: [TimeSeriesData] = []
        let startDate = Date(timeIntervalSince1970: 1483228800) // 2017-01-01
        
        for i in 0..<365*5 { // 5 years of daily data
            let date = startDate.addingTimeInterval(TimeInterval(i * 86400))
            
            // Simulate seasonal variation and policy impact
            let baseValue = 40.0
            let seasonalEffect = 10 * sin(Double(i) * 2 * .pi / 365)
            let policyEffect = i > 730 ? -10.0 : 0.0 // Policy effect after 2 years
            let randomNoise = Double.random(in: -5...5)
            
            let pm25 = max(5, baseValue + seasonalEffect + policyEffect + randomNoise)
            
            data.append(TimeSeriesData(date: date, pm25: pm25))
        }
        
        return data
    }
    
    // MARK: - Trend Analysis
    private func analyzeTrend(
        data: [TimeSeriesData],
        policies: [EnvironmentPolicy]
    ) -> TrendAnalysis {
        guard let firstPolicy = policies.first else {
            return TrendAnalysis(
                beforeAverage: 0,
                afterAverage: 0,
                percentageChange: 0,
                direction: .stable
            )
        }
        
        let policyDate = firstPolicy.implementationDate
        
        // 정책 시행 전 데이터
        let beforeData = data.filter { $0.date < policyDate }
        let afterData = data.filter { $0.date >= policyDate }
        
        let beforeAverage = beforeData.isEmpty ? 0 : 
            beforeData.map { $0.pm25 }.reduce(0, +) / Double(beforeData.count)
        let afterAverage = afterData.isEmpty ? 0 :
            afterData.map { $0.pm25 }.reduce(0, +) / Double(afterData.count)
        
        let percentageChange = beforeAverage == 0 ? 0 :
            ((afterAverage - beforeAverage) / beforeAverage) * 100
        
        let direction: TrendDirection
        if percentageChange < -5 {
            direction = .decreasing
        } else if percentageChange > 5 {
            direction = .increasing
        } else {
            direction = .stable
        }
        
        return TrendAnalysis(
            beforeAverage: beforeAverage,
            afterAverage: afterAverage,
            percentageChange: percentageChange,
            direction: direction
        )
    }
    
    // MARK: - Effectiveness Evaluation
    private func evaluateEffectiveness(_ analysis: TrendAnalysis) -> PolicyEffectiveness {
        let reduction = -analysis.percentageChange
        
        switch reduction {
        case 20...:
            return .veryEffective
        case 10..<20:
            return .effective
        case 5..<10:
            return .moderate
        case 0..<5:
            return .minimal
        default:
            return .ineffective
        }
    }
    
    // MARK: - Comparative Analysis
    func compareCountries(_ countries: [String]) async -> [PolicyAnalysisResult] {
        await withTaskGroup(of: PolicyAnalysisResult.self) { group in
            for country in countries {
                group.addTask {
                    await self.analyzePolicyImpact(for: country)
                }
            }
            
            var results: [PolicyAnalysisResult] = []
            for await result in group {
                results.append(result)
            }
            return results
        }
    }
}

// MARK: - Data Models
struct CountryPolicy: Identifiable {
    let id = UUID()
    let countryCode: String
    let countryName: String
    let policies: [EnvironmentPolicy]
    let overallEffectiveness: PolicyEffectiveness
}

struct EnvironmentPolicy: Identifiable {
    let id: UUID
    let title: String
    let description: String
    let implementationDate: Date
    let category: PolicyCategory
    let expectedReduction: Double // percentage
}

enum PolicyCategory {
    case emission
    case transport
    case industrial
    case energy
    case comprehensive
    
    var icon: String {
        switch self {
        case .emission: return "smoke"
        case .transport: return "car"
        case .industrial: return "building.2"
        case .energy: return "bolt"
        case .comprehensive: return "globe.americas"
        }
    }
}

struct PolicyAnalysisResult {
    let country: String
    let policies: [EnvironmentPolicy]
    let beforeAverage: Double
    let afterAverage: Double
    let percentageChange: Double
    let trendDirection: TrendDirection
    let effectiveness: PolicyEffectiveness
    let timeSeriesData: [TimeSeriesData]
}

struct TrendAnalysis {
    let beforeAverage: Double
    let afterAverage: Double
    let percentageChange: Double
    let direction: TrendDirection
}

enum TrendDirection {
    case increasing
    case decreasing
    case stable
    
    var icon: String {
        switch self {
        case .increasing: return "arrow.up.right"
        case .decreasing: return "arrow.down.right"
        case .stable: return "arrow.right"
        }
    }
    
    var color: Color {
        switch self {
        case .increasing: return .red
        case .decreasing: return .green
        case .stable: return .yellow
        }
    }
}

enum PolicyEffectiveness {
    case veryEffective
    case effective
    case moderate
    case minimal
    case ineffective
    
    var description: String {
        switch self {
        case .veryEffective: return "매우 효과적"
        case .effective: return "효과적"
        case .moderate: return "보통"
        case .minimal: return "미미함"
        case .ineffective: return "효과 없음"
        }
    }
    
    var color: Color {
        switch self {
        case .veryEffective: return .green
        case .effective: return .mint
        case .moderate: return .yellow
        case .minimal: return .orange
        case .ineffective: return .red
        }
    }
}

struct TimeSeriesData {
    let date: Date
    let pm25: Double
}

// MARK: - Visualization Components
struct PolicyImpactChart: View {
    let result: PolicyAnalysisResult
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 제목
            Text("\(result.country) 정책 영향 분석")
                .font(.headline)
            
            // 전후 비교 막대
            HStack(spacing: 20) {
                VStack {
                    Text("시행 전")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text(String(format: "%.1f", result.beforeAverage))
                        .font(.title2)
                        .fontWeight(.bold)
                    Text("μg/m³")
                        .font(.caption2)
                }
                
                Image(systemName: "arrow.right")
                    .foregroundColor(.blue)
                
                VStack {
                    Text("시행 후")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text(String(format: "%.1f", result.afterAverage))
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(result.trendDirection.color)
                    Text("μg/m³")
                        .font(.caption2)
                }
            }
            
            // 변화율
            HStack {
                Image(systemName: result.trendDirection.icon)
                    .foregroundColor(result.trendDirection.color)
                Text(String(format: "%.1f%%", abs(result.percentageChange)))
                    .fontWeight(.semibold)
                Text(result.percentageChange < 0 ? "감소" : "증가")
                    .foregroundColor(result.trendDirection.color)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(result.trendDirection.color.opacity(0.1))
            .cornerRadius(8)
            
            // 효과성 평가
            HStack {
                Text("정책 효과성:")
                    .font(.subheadline)
                Text(result.effectiveness.description)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(result.effectiveness.color)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(12)
    }
}
