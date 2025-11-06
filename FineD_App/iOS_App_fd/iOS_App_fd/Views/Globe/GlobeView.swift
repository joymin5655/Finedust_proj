//
//  GlobeView.swift
//  AirLens
//
//  Created on 2025-11-06
//

import SwiftUI
import SceneKit
import CoreLocation

struct GlobeView: View {
    @EnvironmentObject var stationViewModel: StationViewModel
    @EnvironmentObject var globeViewModel: GlobeViewModel
    @EnvironmentObject var locationService: LocationService
    
    @State private var showControls = true
    @State private var selectedFilter: FilterType = .all
    @State private var showStationSheet = false
    
    enum FilterType: String, CaseIterable {
        case all = "All"
        case good = "Good"
        case moderate = "Moderate"
        case unhealthy = "Unhealthy"
        case hazardous = "Hazardous"
        
        var icon: String {
            switch self {
            case .all: return "globe"
            case .good: return "leaf.fill"
            case .moderate: return "sun.haze.fill"
            case .unhealthy: return "exclamationmark.triangle.fill"
            case .hazardous: return "exclamationmark.octagon.fill"
            }
        }
    }
    
    var body: some View {
        ZStack {
            // 3D Globe Scene
            SceneView(
                scene: globeViewModel.scene,
                pointOfView: nil,
                options: [.autoenablesDefaultLighting, .allowsCameraControl],
                preferredFramesPerSecond: 60,
                antialiasingMode: .multisampling4X,
                delegate: nil,
                technique: nil
            )
            .ignoresSafeArea()
            .onAppear {
                // 측정소 데이터를 지구본에 추가
                globeViewModel.addStations(stationViewModel.stations)
            }
            
            // 컨트롤 오버레이
            if showControls {
                VStack {
                    // 상단 필터
                    HStack {
                        FilterPicker(selectedFilter: $selectedFilter)
                        Spacer()
                        ControlButtons()
                    }
                    .padding()
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color.black.opacity(0.7),
                                Color.clear
                            ]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    
                    Spacer()
                    
                    // 하단 정보 패널
                    BottomInfoPanel()
                        .padding()
                }
            }            
            // 측정소 상세 정보 시트
            if let selectedStation = globeViewModel.selectedStation {
                StationDetailSheet(station: selectedStation)
            }
        }
        .sheet(isPresented: $showStationSheet) {
            if let station = globeViewModel.selectedStation {
                StationDetailView(station: station)
            }
        }
        .onReceive(globeViewModel.$showStationDetails) { show in
            showStationSheet = show
        }
    }
}

// MARK: - Filter Picker
struct FilterPicker: View {
    @Binding var selectedFilter: GlobeView.FilterType
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(GlobeView.FilterType.allCases, id: \.self) { filter in
                    GlobeFilterChip(
                        filter: filter,
                        isSelected: selectedFilter == filter,
                        action: { selectedFilter = filter }
                    )
                }
            }
        }
    }
}

struct GlobeFilterChip: View {
    let filter: GlobeView.FilterType
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: filter.icon)
                    .font(.caption)
                Text(filter.rawValue)
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                isSelected ? Color.blue : Color.white.opacity(0.2)
            )
            .foregroundColor(.white)
            .cornerRadius(15)
        }
    }
}

// MARK: - Control Buttons
struct ControlButtons: View {
    @EnvironmentObject var globeViewModel: GlobeViewModel
    @EnvironmentObject var locationService: LocationService
    
    var body: some View {
        HStack(spacing: 16) {
            // 회전 토글
            Button(action: { globeViewModel.toggleRotation() }) {
                Image(systemName: globeViewModel.isRotating ? "pause.fill" : "play.fill")
                    .font(.title2)
                    .foregroundColor(.white)
            }
            
            // 내 위치로 포커스
            Button(action: focusOnMyLocation) {
                Image(systemName: "location.fill")
                    .font(.title2)
                    .foregroundColor(.white)
            }
            
            // 줌 컨트롤
            HStack(spacing: 8) {
                Button(action: { globeViewModel.zoom(delta: -0.5) }) {
                    Image(systemName: "minus.circle.fill")
                        .font(.title2)
                        .foregroundColor(.white)
                }
                
                Button(action: { globeViewModel.zoom(delta: 0.5) }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundColor(.white)
                }
            }
        }
    }
    
    private func focusOnMyLocation() {
        if let location = locationService.currentLocation {
            globeViewModel.focusOn(
                latitude: location.latitude,
                longitude: location.longitude
            )
        }
    }
}

// MARK: - Bottom Info Panel
struct BottomInfoPanel: View {
    @EnvironmentObject var stationViewModel: StationViewModel
    
    var body: some View {
        VStack(spacing: 12) {
            // 범례
            HStack(spacing: 20) {
                LegendItem(color: .green, label: "Good")
                LegendItem(color: .yellow, label: "Moderate")
                LegendItem(color: .orange, label: "Unhealthy")
                LegendItem(color: .red, label: "Very Unhealthy")
                LegendItem(color: .purple, label: "Hazardous")
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            .background(Color.black.opacity(0.7))
            .cornerRadius(20)
            
            // 통계 정보
            HStack(spacing: 30) {
                StatItem(
                    value: "\(stationViewModel.stations.count)",
                    label: "Stations"
                )
                
                StatItem(
                    value: String(format: "%.1f", stationViewModel.statistics.averagePM25),
                    label: "Avg PM2.5"
                )
                
                StatItem(
                    value: "\(stationViewModel.statistics.countriesCount)",
                    label: "Countries"
                )
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            .background(Color.black.opacity(0.7))
            .cornerRadius(15)
        }
    }
}

struct LegendItem: View {
    let color: Color
    let label: String
    
    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)
            Text(label)
                .font(.caption2)
                .foregroundColor(.white)
        }
    }
}

struct StatItem: View {
    let value: String
    let label: String
    
    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(.white)
            Text(label)
                .font(.caption2)
                .foregroundColor(.gray)
        }
    }
}

// MARK: - Station Detail Sheet
struct StationDetailSheet: View {
    let station: Station
    @State private var opacity: Double = 0
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Handle bar
            RoundedRectangle(cornerRadius: 2.5)
                .fill(Color.gray)
                .frame(width: 40, height: 5)
                .frame(maxWidth: .infinity)
                .padding(.top, 8)
            
            // Station info
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text(station.name)
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    HStack {
                        Image(systemName: "mappin.circle.fill")
                            .font(.caption)
                        Text(station.country)
                            .font(.subheadline)
                    }
                    .foregroundColor(.gray)
                }
                
                Spacer()
                
                // PM2.5 badge
                VStack {
                    Text(String(format: "%.1f", station.pm25))
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(Color(hex: station.pm25Category.color))
                    
                    Text("μg/m³")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            // Category indicator
            HStack(spacing: 8) {
                Image(systemName: "circle.fill")
                    .foregroundColor(Color(hex: station.pm25Category.color))
                Text(station.pm25Category.label)
                    .fontWeight(.medium)
                Text(station.pm25Category.emoji)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color(hex: station.pm25Category.color).opacity(0.2))
            .cornerRadius(20)
            
            Text(station.pm25Category.description)
                .font(.subheadline)
                .foregroundColor(.gray)
            
            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color.black.opacity(0.9))
        .cornerRadius(20)
        .opacity(opacity)
        .onAppear {
            withAnimation(.easeIn(duration: 0.3)) {
                opacity = 1
            }
        }
    }
}

// MARK: - Station Detail View (Full)
struct StationDetailView: View {
    let station: Station
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    StationHeaderView(station: station)
                    
                    // PM Values
                    PMValuesCard(station: station)
                    
                    // Location Map
                    LocationMapCard(station: station)
                    
                    // Historical Chart
                    HistoricalChartCard(station: station)
                    
                    // Recommendations
                    RecommendationsCard(category: station.pm25Category)
                }
                .padding()
            }
            .background(Color(UIColor.systemBackground))
            .navigationTitle(station.name)
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}
// MARK: - Sub Components for Station Detail

struct StationHeaderView: View {
    let station: Station
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                Text(station.name)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                HStack {
                    Image(systemName: "mappin.circle.fill")
                    Text(station.country)
                }
                .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack {
                Text(station.pm25Category.emoji)
                    .font(.system(size: 50))
                Text(station.pm25Category.label)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

struct PMValuesCard: View {
    let station: Station
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Air Quality Measurements")
                .font(.headline)
            
            HStack(spacing: 20) {
                // PM2.5
                VStack {
                    Text("PM2.5")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(String(format: "%.1f", station.pm25))
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(Color(hex: station.pm25Category.color))
                    Text("μg/m³")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(UIColor.tertiarySystemBackground))
                .cornerRadius(8)
                
                // PM10
                if let pm10 = station.pm10 {
                    VStack {
                        Text("PM10")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(String(format: "%.1f", pm10))
                            .font(.title)
                            .fontWeight(.bold)
                        Text("μg/m³")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(UIColor.tertiarySystemBackground))
                    .cornerRadius(8)
                }
                
                // AQI
                if let aqi = station.aqi {
                    VStack {
                        Text("AQI")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(aqi)")
                            .font(.title)
                            .fontWeight(.bold)
                        Text("Index")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(UIColor.tertiarySystemBackground))
                    .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

struct LocationMapCard: View {
    let station: Station
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Location")
                .font(.headline)
            
            // Placeholder for map
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.blue.opacity(0.2))
                .frame(height: 200)
                .overlay(
                    VStack {
                        Image(systemName: "map.fill")
                            .font(.largeTitle)
                            .foregroundColor(.blue)
                        Text("\(station.latitude)°, \(station.longitude)°")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                )
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

struct HistoricalChartCard: View {
    let station: Station
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("24-Hour History")
                .font(.headline)
            
            // Placeholder for chart
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.green.opacity(0.2))
                .frame(height: 150)
                .overlay(
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .font(.largeTitle)
                        .foregroundColor(.green)
                )
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

struct RecommendationsCard: View {
    let category: PM25Category
    
    var recommendations: [String] {
        switch category {
        case .good:
            return [
                "Enjoy outdoor activities",
                "Great day for exercise",
                "Open your windows for fresh air"
            ]
        case .moderate:
            return [
                "Generally safe for outdoor activities",
                "Sensitive individuals should limit prolonged exertion",
                "Consider indoor activities if sensitive"
            ]
        case .unhealthy:
            return [
                "Limit outdoor activities",
                "Wear a mask if going outside",
                "Keep windows closed"
            ]
        case .veryUnhealthy:
            return [
                "Avoid outdoor activities",
                "Use air purifiers indoors",
                "Wear N95 mask if you must go outside"
            ]
        case .hazardous:
            return [
                "Stay indoors",
                "Avoid all outdoor activities",
                "Seek medical attention if experiencing symptoms"
            ]
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Health Recommendations")
                .font(.headline)
            
            ForEach(recommendations, id: \.self) { recommendation in
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text(recommendation)
                        .font(.subheadline)
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

#Preview {
    GlobeView()
        .environmentObject(StationViewModel())
        .environmentObject(GlobeViewModel())
        .environmentObject(LocationService.shared)
}