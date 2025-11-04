//
//  PolicyView.swift
//  Finedust
//
//  정책 페이지 - 전 세계 관측소 및 정책 확인
//

import SwiftUI
import MapKit

struct PolicyView: View {
    @State private var selectedTab = 0
    @State private var selectedCountry: Country?
    @State private var showCountryDetail = false
    @State private var globeRotation: Double = 0
    @State private var stationData: [Station] = []
    @State private var pm25Distribution: [PM25Data] = []
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 헤더
                headerView
                
                // 탭 선택
                Picker("View Mode", selection: $selectedTab) {
                    Text("관측소").tag(0)
                    Text("미세먼지 분포").tag(1)
                    Text("국가별 정책").tag(2)
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                // 컨텐츠
                ZStack {
                    switch selectedTab {
                    case 0:
                        stationMapView
                    case 1:
                        pm25DistributionView
                    case 2:
                        countryPolicyView
                    default:
                        EmptyView()
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .onAppear {
                loadData()
                startGlobeRotation()
            }
        }
    }
    
    // MARK: - Header
    private var headerView: some View {
        HStack {
            Text("환경 정책 & 관측소")
                .font(.title2)
                .fontWeight(.bold)
            
            Spacer()
            
            Button(action: { /* 닫기 */ }) {
                Image(systemName: "xmark.circle")
                    .font(.title2)
                    .foregroundColor(.gray)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
    }
    
    // MARK: - Station Map View (관측소 지도)
    private var stationMapView: some View {
        VStack {
            // 지구본 뷰
            ZStack {
                PolicyGlobe3DView(
                    rotation: $globeRotation,
                    stations: stationData,
                    onCountryTap: { country in
                        selectedCountry = country
                        showCountryDetail = true
                    }
                )
                .frame(height: 400)
                
                // 관측소 정보 오버레이
                VStack {
                    HStack {
                        Label("\(stationData.count) 관측소", systemImage: "location.circle")
                            .font(.caption)
                            .padding(8)
                            .background(Color.white.opacity(0.9))
                            .cornerRadius(8)
                        
                        Spacer()
                    }
                    .padding()
                    
                    Spacer()
                }
            }
            
            // 관측소 리스트
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(stationData.prefix(20)) { station in
                        StationRowView(station: station)
                    }
                }
                .padding()
            }
        }
    }
    
    // MARK: - PM2.5 Distribution View (미세먼지 분포도)
    private var pm25DistributionView: some View {
        VStack {
            // 히트맵 지구본
            HeatmapGlobeView(
                rotation: $globeRotation,
                pm25Data: pm25Distribution
            )
            .frame(height: 400)
            
            // 범례
            HStack(spacing: 20) {
                ForEach(AQILevel.allCases) { level in
                    HStack(spacing: 4) {
                        Circle()
                            .fill(level.color)
                            .frame(width: 12, height: 12)
                        Text(level.label)
                            .font(.caption)
                    }
                }
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(10)
            .padding()
            
            // 통계 정보
            VStack(alignment: .leading, spacing: 12) {
                Text("전 세계 PM2.5 현황")
                    .font(.headline)
                
                HStack {
                    StatCard(title: "평균", value: "\(averagePM25) μg/m³", color: .blue)
                    StatCard(title: "최고", value: "\(maxPM25) μg/m³", color: .red)
                    StatCard(title: "최저", value: "\(minPM25) μg/m³", color: .green)
                }
            }
            .padding()
            
            Spacer()
        }
    }
    
    // MARK: - Country Policy View (국가별 정책)
    private var countryPolicyView: some View {
        VStack {
            // 국가 선택 지구본
            InteractiveGlobeView(
                rotation: $globeRotation,
                selectedCountry: $selectedCountry,
                onCountrySelect: { country in
                    selectedCountry = country
                    showCountryDetail = true
                }
            )
            .frame(height: 300)
            
            // 선택된 국가 정보
            if let country = selectedCountry {
                CountryPolicyDetailView(country: country)
                    .transition(.move(edge: .bottom))
            } else {
                Text("국가를 선택하세요")
                    .foregroundColor(.gray)
                    .padding()
            }
            
            Spacer()
        }
        .sheet(isPresented: $showCountryDetail) {
            if let country = selectedCountry {
                CountryDetailSheet(country: country)
            }
        }
    }
    
    // MARK: - Helper Functions
    private func loadData() {
        Task {
            // 관측소 데이터 로드
            stationData = await StationAPI.shared.fetchAllStations()
            
            // PM2.5 분포 데이터 로드
            pm25Distribution = await PM25API.shared.fetchGlobalDistribution()
        }
    }
    
    private func startGlobeRotation() {
        withAnimation(.linear(duration: 60).repeatForever(autoreverses: false)) {
            globeRotation = 360
        }
    }
    
    private var averagePM25: Int {
        guard !pm25Distribution.isEmpty else { return 0 }
        let sum = pm25Distribution.reduce(0) { $0 + $1.value }
        return Int(sum / Double(pm25Distribution.count))
    }
    
    private var maxPM25: Int {
        pm25Distribution.map { $0.value }.max() ?? 0
    }
    
    private var minPM25: Int {
        pm25Distribution.map { $0.value }.min() ?? 0
    }
}

// MARK: - Supporting Views

struct PolicyGlobe3DView: View {
    @Binding var rotation: Double
    let stations: [Station]
    let onCountryTap: (Country) -> Void
    
    var body: some View {
        // 3D 지구본 with 관측소 마커
        ZStack {
            // 기본 지구본
            Sphere()
                .fill(Color.blue.opacity(0.3))
                .rotation3DEffect(.degrees(rotation), axis: (x: 0, y: 1, z: 0))
            
            // 관측소 마커들
            ForEach(stations.prefix(100)) { station in
                Circle()
                    .fill(Color.red)
                    .frame(width: 4, height: 4)
                    .position(
                        x: longitudeToX(station.longitude),
                        y: latitudeToY(station.latitude)
                    )
            }
        }
    }
    
    func longitudeToX(_ lng: Double) -> CGFloat {
        // 경도를 X 좌표로 변환
        return CGFloat((lng + 180) / 360 * 300)
    }
    
    func latitudeToY(_ lat: Double) -> CGFloat {
        // 위도를 Y 좌표로 변환
        return CGFloat((90 - lat) / 180 * 300)
    }
}

struct HeatmapGlobeView: View {
    @Binding var rotation: Double
    let pm25Data: [PM25Data]
    
    var body: some View {
        // PM2.5 히트맵 지구본
        ZStack {
            ForEach(pm25Data) { data in
                Circle()
                    .fill(getColorForPM25(data.value))
                    .frame(width: 10, height: 10)
                    .blur(radius: 5)
                    .position(
                        x: longitudeToX(data.longitude),
                        y: latitudeToY(data.latitude)
                    )
                    .opacity(0.7)
            }
        }
        .rotation3DEffect(.degrees(rotation), axis: (x: 0, y: 1, z: 0))
    }
    
    func longitudeToX(_ lng: Double) -> CGFloat {
        return CGFloat((lng + 180) / 360 * 300)
    }
    
    func latitudeToY(_ lat: Double) -> CGFloat {
        return CGFloat((90 - lat) / 180 * 300)
    }
    
    func getColorForPM25(_ value: Double) -> Color {
        switch value {
        case 0...30: return .green
        case 31...80: return .yellow
        case 81...150: return .orange
        default: return .red
        }
    }
}

struct CountryPolicyDetailView: View {
    let country: Country
    @State private var beforeData: [Double] = []
    @State private var afterData: [Double] = []
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 국가 정보
            HStack {
                Image(systemName: "flag.fill")
                    .foregroundColor(.blue)
                Text(country.name)
                    .font(.title2)
                    .fontWeight(.bold)
            }
            
            // 정책 정보
            VStack(alignment: .leading, spacing: 8) {
                Text("주요 정책")
                    .font(.headline)
                
                ForEach(country.policies) { policy in
                    PolicyRowView(policy: policy)
                }
            }
            
            // 전후 비교
            VStack(alignment: .leading, spacing: 8) {
                Text("정책 시행 전후 비교")
                    .font(.headline)
                
                ComparisonChartView(
                    beforeData: beforeData,
                    afterData: afterData
                )
                .frame(height: 200)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(15)
        .padding()
    }
}

// MARK: - Data Models

struct Station: Identifiable {
    let id = UUID()
    let name: String
    let latitude: Double
    let longitude: Double
    let pm25: Double
}

struct PM25Data: Identifiable {
    let id = UUID()
    let latitude: Double
    let longitude: Double
    let value: Double
}

struct Country: Identifiable {
    let id = UUID()
    let name: String
    let code: String
    let policies: [Policy]
}

struct Policy: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let implementationDate: Date
    let effectiveness: Double
}

enum AQILevel: String, CaseIterable, Identifiable {
    case good = "좋음"
    case moderate = "보통"
    case unhealthy = "나쁨"
    case veryUnhealthy = "매우나쁨"
    
    var id: String { rawValue }
    
    var label: String { rawValue }
    
    var color: Color {
        switch self {
        case .good: return .green
        case .moderate: return .yellow
        case .unhealthy: return .orange
        case .veryUnhealthy: return .red
        }
    }
}

// MARK: - Additional Helper Views

struct StationRowView: View {
    let station: Station
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(station.name)
                    .font(.headline)
                Text("위치: \(station.latitude), \(station.longitude)")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            
            Spacer()
            
            Text("\(Int(station.pm25)) μg/m³")
                .fontWeight(.bold)
                .foregroundColor(getColorForPM25(station.pm25))
        }
        .padding()
        .background(Color.white)
        .cornerRadius(10)
        .shadow(radius: 2)
    }
    
    func getColorForPM25(_ value: Double) -> Color {
        switch value {
        case 0...30: return .green
        case 31...80: return .yellow
        case 81...150: return .orange
        default: return .red
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
            Text(value)
                .font(.headline)
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white)
        .cornerRadius(10)
        .shadow(radius: 2)
    }
}

#Preview {
    PolicyView()
}
