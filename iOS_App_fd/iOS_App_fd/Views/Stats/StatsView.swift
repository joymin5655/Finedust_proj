//
//  StatsView.swift
//  AirLens
//
//  Created on 2025-11-06
//

import SwiftUI
import Charts

struct StatsView: View {
    @EnvironmentObject var stationViewModel: StationViewModel
    @EnvironmentObject var policyViewModel: PolicyViewModel
    @EnvironmentObject var cameraViewModel: CameraViewModel
    
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Overview Cards
                    OverviewCards()
                    
                    // Tab Selector
                    Picker("Stats", selection: $selectedTab) {
                        Text("Air Quality").tag(0)
                        Text("Policies").tag(1)
                        Text("Predictions").tag(2)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .padding(.horizontal)
                    
                    // Tab Content
                    switch selectedTab {
                    case 0:
                        AirQualityStats()
                    case 1:
                        PolicyStats()
                    case 2:
                        PredictionStats()
                    default:
                        EmptyView()
                    }
                }
                .padding()
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationTitle("Statistics")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: refreshData) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
        }
    }
    
    private func refreshData() {
        Task {
            await stationViewModel.fetchStations()
            await policyViewModel.fetchPolicies()
        }
    }
}

// MARK: - Overview Cards
struct OverviewCards: View {
    @EnvironmentObject var stationViewModel: StationViewModel
    @EnvironmentObject var policyViewModel: PolicyViewModel
    @EnvironmentObject var cameraViewModel: CameraViewModel
    
    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            StatCard(
                title: "Stations",
                value: "\(stationViewModel.stations.count)",
                icon: "antenna.radiowaves.left.and.right",
                color: .blue,
                trend: .stable
            )
            
            StatCard(
                title: "Policies",
                value: "\(policyViewModel.policies.count)",
                icon: "doc.text.fill",
                color: .green,
                trend: .increasing
            )
            
            StatCard(
                title: "Avg PM2.5",
                value: String(format: "%.1f", stationViewModel.statistics.averagePM25),
                icon: "smoke.fill",
                color: .orange,
                trend: .decreasing
            )
            
            StatCard(
                title: "Predictions",
                value: "\(cameraViewModel.predictionHistory.count)",
                icon: "camera.fill",
                color: .purple,
                trend: .stable
            )
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    let trend: Trend
    
    enum Trend {
        case increasing, decreasing, stable
        
        var icon: String {
            switch self {
            case .increasing: return "arrow.up.circle.fill"
            case .decreasing: return "arrow.down.circle.fill"
            case .stable: return "equal.circle.fill"
            }
        }
        
        var color: Color {
            switch self {
            case .increasing: return .green
            case .decreasing: return .red
            case .stable: return .gray
            }
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                
                Spacer()
                
                Image(systemName: trend.icon)
                    .font(.caption)
                    .foregroundColor(trend.color)
            }
            
            Text(value)
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

// MARK: - Air Quality Stats
struct AirQualityStats: View {
    @EnvironmentObject var stationViewModel: StationViewModel
    
    var body: some View {
        VStack(spacing: 20) {
            // Distribution Chart
            AirQualityDistributionChart()
            
            // Top 5 Highest PM2.5
            VStack(alignment: .leading, spacing: 12) {
                Text("Highest PM2.5 Levels")
                    .font(.headline)
                
                ForEach(stationViewModel.getHighestPM25(limit: 5)) { station in
                    StationRankRow(station: station, rank: getRank(for: station, in: stationViewModel.getHighestPM25()))
                }
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            .cornerRadius(12)
            
            // Top 5 Lowest PM2.5
            VStack(alignment: .leading, spacing: 12) {
                Text("Lowest PM2.5 Levels")
                    .font(.headline)
                
                ForEach(stationViewModel.getLowestPM25(limit: 5)) { station in
                    StationRankRow(station: station, rank: getRank(for: station, in: stationViewModel.getLowestPM25()))
                }
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            .cornerRadius(12)
            
            // Country Breakdown
            CountryBreakdownChart()
        }
    }
    
    private func getRank(for station: Station, in list: [Station]) -> Int {
        (list.firstIndex(where: { $0.id == station.id }) ?? 0) + 1
    }
}

struct StationRankRow: View {
    let station: Station
    let rank: Int
    
    var body: some View {
        HStack {
            Text("#\(rank)")
                .font(.headline)
                .foregroundColor(.secondary)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(station.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(station.country)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 2) {
                Text(String(format: "%.1f", station.pm25))
                    .font(.headline)
                    .foregroundColor(Color(hex: station.pm25Category.color))
                Text("μg/m³")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Distribution Chart
struct AirQualityDistributionChart: View {
    @EnvironmentObject var stationViewModel: StationViewModel
    
    var distribution: [(category: PM25Category, count: Int)] {
        let categories: [PM25Category] = [.good, .moderate, .unhealthy, .veryUnhealthy, .hazardous]
        
        return categories.map { category in
            let count = stationViewModel.stations.filter { $0.pm25Category == category }.count
            return (category, count)
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("PM2.5 Distribution")
                .font(.headline)
            
            // Bar Chart
            HStack(alignment: .bottom, spacing: 8) {
                ForEach(distribution, id: \.category) { item in
                    VStack {
                        Text("\(item.count)")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        
                        Rectangle()
                            .fill(Color(hex: item.category.color))
                            .frame(width: 50, height: CGFloat(item.count) * 2)
                            .cornerRadius(4)
                        
                        Text(item.category.label)
                            .font(.caption2)
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                            .frame(width: 50)
                    }
                }
            }
            .frame(height: 200)
            .frame(maxWidth: .infinity)
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

// MARK: - Country Breakdown Chart
struct CountryBreakdownChart: View {
    @EnvironmentObject var stationViewModel: StationViewModel
    
    var topCountries: [(country: String, avgPM25: Double, count: Int)] {
        let countries = Dictionary(grouping: stationViewModel.stations, by: { $0.country })
        
        return countries.map { country, stations in
            let avgPM25 = stations.map { $0.pm25 }.reduce(0, +) / Double(stations.count)
            return (country, avgPM25, stations.count)
        }
        .sorted { $0.count > $1.count }
        .prefix(10)
        .map { $0 }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Top Countries by Station Count")
                .font(.headline)
            
            ForEach(topCountries, id: \.country) { item in
                HStack {
                    Text(item.country)
                        .font(.subheadline)
                    
                    Spacer()
                    
                    Text("\(item.count) stations")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("Avg: \(String(format: "%.1f", item.avgPM25))")
                        .font(.caption)
                        .foregroundColor(Color(hex: PM25Category(pm25: item.avgPM25).color))
                }
                .padding(.vertical, 2)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

// MARK: - Policy Stats
struct PolicyStats: View {
    @EnvironmentObject var policyViewModel: PolicyViewModel
    
    var body: some View {
        VStack(spacing: 20) {
            // Category Distribution
            CategoryDistributionChart()
            
            // Top Credible Policies
            VStack(alignment: .leading, spacing: 12) {
                Text("Most Credible Policies")
                    .font(.headline)
                
                ForEach(policyViewModel.getTopCrediblePolicies(limit: 5)) { policy in
                    PolicyRankRow(policy: policy)
                }
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            .cornerRadius(12)
            
            // Country Coverage
            CountryCoverageChart()
        }
    }
}

struct PolicyRankRow: View {
    let policy: AirPolicy
    
    var body: some View {
        HStack {
            Image(systemName: policy.category.icon)
                .foregroundColor(Color(hex: policy.category.color))
            
            VStack(alignment: .leading, spacing: 2) {
                Text(policy.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(1)
                Text(policy.country)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text("\(Int(policy.credibility * 100))%")
                .font(.headline)
                .foregroundColor(.green)
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Category Distribution Chart
struct CategoryDistributionChart: View {
    @EnvironmentObject var policyViewModel: PolicyViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Policy Categories")
                .font(.headline)
            
            ForEach(PolicyCategory.allCases, id: \.self) { category in
                let count = policyViewModel.policies.filter { $0.category == category }.count
                let percentage = Double(count) / Double(policyViewModel.policies.count) * 100
                
                HStack {
                    Image(systemName: category.icon)
                        .foregroundColor(Color(hex: category.color))
                        .frame(width: 20)
                    
                    Text(category.rawValue)
                        .font(.caption)
                        .frame(width: 120, alignment: .leading)
                    
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            Rectangle()
                                .fill(Color.gray.opacity(0.2))
                                .frame(height: 20)
                                .cornerRadius(4)
                            
                            Rectangle()
                                .fill(Color(hex: category.color))
                                .frame(width: geometry.size.width * CGFloat(percentage / 100), height: 20)
                                .cornerRadius(4)
                        }
                    }
                    .frame(height: 20)
                    
                    Text("\(count)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(width: 30, alignment: .trailing)
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

// MARK: - Country Coverage Chart
struct CountryCoverageChart: View {
    @EnvironmentObject var policyViewModel: PolicyViewModel
    
    var topCountries: [(country: String, count: Int)] {
        let countries = Dictionary(grouping: policyViewModel.policies, by: { $0.country })
        return countries.map { ($0.key, $0.value.count) }
            .sorted { $0.1 > $1.1 }
            .prefix(10)
            .map { $0 }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Policy Coverage by Country")
                .font(.headline)
            
            ForEach(topCountries, id: \.country) { item in
                HStack {
                    Text(item.country)
                        .font(.subheadline)
                    
                    Spacer()
                    
                    Text("\(item.count) policies")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 2)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

// MARK: - Prediction Stats
struct PredictionStats: View {
    @EnvironmentObject var cameraViewModel: CameraViewModel
    
    var predictionTrend: PredictionTrend {
        PredictionHistory(predictions: cameraViewModel.predictionHistory).trend
    }
    
    var averagePM25: Double {
        guard !cameraViewModel.predictionHistory.isEmpty else { return 0 }
        return cameraViewModel.predictionHistory.map { $0.pm25 }.reduce(0, +) / Double(cameraViewModel.predictionHistory.count)
    }
    
    var averageConfidence: Double {
        guard !cameraViewModel.predictionHistory.isEmpty else { return 0 }
        return cameraViewModel.predictionHistory.map { $0.confidence }.reduce(0, +) / Double(cameraViewModel.predictionHistory.count)
    }
    
    var body: some View {
        VStack(spacing: 20) {
            // Prediction Summary
            VStack(alignment: .leading, spacing: 12) {
                Text("Prediction Summary")
                    .font(.headline)
                
                HStack {
                    VStack(alignment: .leading) {
                        Text("Total Predictions")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(cameraViewModel.predictionHistory.count)")
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .leading) {
                        Text("Avg PM2.5")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(String(format: "%.1f", averagePM25))
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .leading) {
                        Text("Avg Confidence")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(String(format: "%.0f%%", averageConfidence * 100))
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                }
                
                // Trend
                HStack {
                    Image(systemName: predictionTrend.icon)
                        .foregroundColor(Color(hex: predictionTrend.color))
                    Text(predictionTrend.rawValue)
                        .font(.subheadline)
                }
                .padding(.top, 8)
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            .cornerRadius(12)
            
            // Recent Predictions
            if !cameraViewModel.predictionHistory.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Recent Predictions")
                        .font(.headline)
                    
                    ForEach(cameraViewModel.predictionHistory.prefix(5)) { prediction in
                        HStack {
                            Text(prediction.timestamp, style: .date)
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Spacer()
                            
                            Text("\(prediction.formattedPM25) μg/m³")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(Color(hex: prediction.pm25Category.color))
                            
                            Text(prediction.pm25Category.emoji)
                        }
                        .padding(.vertical, 4)
                    }
                }
                .padding()
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(12)
            }
        }
    }
}

#Preview {
    StatsView()
        .environmentObject(StationViewModel())
        .environmentObject(PolicyViewModel())
        .environmentObject(CameraViewModel())
}