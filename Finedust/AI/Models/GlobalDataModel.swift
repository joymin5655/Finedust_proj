//
//  GlobalDataModel.swift
//  Finedust
//
//  전 세계 측정소 데이터 수집 및 시각화 모델
//

import Foundation
import MapKit
import Combine

// MARK: - Global Data Collection Model
class GlobalDataModel: ObservableObject {
    static let shared = GlobalDataModel()
    
    @Published var stations: [GlobalStation] = []
    @Published var pm25HeatmapData: [[Double]] = []
    @Published var isLoading = false
    @Published var lastUpdateTime: Date?
    
    private var cancellables = Set<AnyCancellable>()
    private let updateInterval: TimeInterval = 600 // 10 minutes
    
    init() {
        startAutoUpdate()
    }
    
    // MARK: - Data Collection
    func collectGlobalData() async {
        isLoading = true
        
        async let waqiData = fetchWAQIData()
        async let iqairData = fetchIQAirData()
        async let openAQData = fetchOpenAQData()
        
        let (waqi, iqair, openaq) = await (waqiData, iqairData, openAQData)
        
        // 데이터 통합 및 중복 제거
        stations = mergeAndDeduplicate(waqi, iqair, openaq)
        
        // 히트맵 데이터 생성
        pm25HeatmapData = generateHeatmapData(from: stations)
        
        lastUpdateTime = Date()
        isLoading = false
    }
    
    // MARK: - WAQI API
    private func fetchWAQIData() async -> [GlobalStation] {
        // World Air Quality Index API
        let url = "https://api.waqi.info/map/bounds/?latlng=-90,-180,90,180&token=YOUR_TOKEN"
        
        // Mock data for demonstration
        return (0..<100000).map { _ in
            GlobalStation(
                id: UUID().uuidString,
                name: "WAQI Station",
                latitude: Double.random(in: -90...90),
                longitude: Double.random(in: -180...180),
                pm25: Double.random(in: 5...150),
                source: .waqi,
                lastUpdate: Date()
            )
        }
    }
    
    // MARK: - IQAir API
    private func fetchIQAirData() async -> [GlobalStation] {
        // IQAir API
        let url = "https://api.airvisual.com/v2/stations?key=YOUR_KEY"
        
        // Mock data
        return (0..<8000).map { _ in
            GlobalStation(
                id: UUID().uuidString,
                name: "IQAir Station",
                latitude: Double.random(in: -90...90),
                longitude: Double.random(in: -180...180),
                pm25: Double.random(in: 10...200),
                source: .iqair,
                lastUpdate: Date()
            )
        }
    }
    
    // MARK: - OpenAQ API  
    private func fetchOpenAQData() async -> [GlobalStation] {
        // OpenAQ API
        let url = "https://api.openaq.org/v2/measurements?parameter=pm25"
        
        // Mock data
        return (0..<50000).map { _ in
            GlobalStation(
                id: UUID().uuidString,
                name: "OpenAQ Station",
                latitude: Double.random(in: -90...90),
                longitude: Double.random(in: -180...180),
                pm25: Double.random(in: 5...100),
                source: .openaq,
                lastUpdate: Date()
            )
        }
    }
    
    // MARK: - Data Processing
    private func mergeAndDeduplicate(
        _ waqi: [GlobalStation],
        _ iqair: [GlobalStation],
        _ openaq: [GlobalStation]
    ) -> [GlobalStation] {
        var allStations = waqi + iqair + openaq
        var uniqueStations: [String: GlobalStation] = [:]
        
        // 위치 기반 중복 제거 (2km 반경)
        for station in allStations {
            let key = "\(Int(station.latitude * 100))-\(Int(station.longitude * 100))"
            
            if let existing = uniqueStations[key] {
                // 더 신뢰도 높은 소스 우선
                if station.source.priority > existing.source.priority {
                    uniqueStations[key] = station
                }
            } else {
                uniqueStations[key] = station
            }
        }
        
        return Array(uniqueStations.values)
    }
    
    // MARK: - Heatmap Generation
    private func generateHeatmapData(from stations: [GlobalStation]) -> [[Double]] {
        let gridSize = 180 // 1도 간격
        var heatmap = Array(repeating: Array(repeating: 0.0, count: gridSize * 2), count: gridSize)
        
        for station in stations {
            let latIndex = Int((station.latitude + 90) * Double(gridSize) / 180)
            let lonIndex = Int((station.longitude + 180) * Double(gridSize) / 360)
            
            if latIndex >= 0 && latIndex < gridSize && lonIndex >= 0 && lonIndex < gridSize * 2 {
                heatmap[latIndex][lonIndex] = station.pm25
            }
        }
        
        // 보간 적용 (빈 셀 채우기)
        heatmap = interpolateHeatmap(heatmap)
        
        return heatmap
    }
    
    private func interpolateHeatmap(_ heatmap: [[Double]]) -> [[Double]] {
        var interpolated = heatmap
        
        for i in 0..<heatmap.count {
            for j in 0..<heatmap[i].count {
                if heatmap[i][j] == 0 {
                    // 주변 값들의 평균으로 보간
                    var sum = 0.0
                    var count = 0
                    
                    for di in -1...1 {
                        for dj in -1...1 {
                            let ni = i + di
                            let nj = j + dj
                            
                            if ni >= 0 && ni < heatmap.count && 
                               nj >= 0 && nj < heatmap[i].count && 
                               heatmap[ni][nj] > 0 {
                                sum += heatmap[ni][nj]
                                count += 1
                            }
                        }
                    }
                    
                    if count > 0 {
                        interpolated[i][j] = sum / Double(count)
                    }
                }
            }
        }
        
        return interpolated
    }
    
    // MARK: - Auto Update
    private func startAutoUpdate() {
        Timer.publish(every: updateInterval, on: .main, in: .common)
            .autoconnect()
            .sink { _ in
                Task {
                    await self.collectGlobalData()
                }
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Statistics
    func getGlobalStatistics() -> GlobalStatistics {
        guard !stations.isEmpty else {
            return GlobalStatistics(
                totalStations: 0,
                averagePM25: 0,
                maxPM25: 0,
                minPM25: 0,
                coveragePercentage: 0
            )
        }
        
        let pm25Values = stations.map { $0.pm25 }
        
        return GlobalStatistics(
            totalStations: stations.count,
            averagePM25: pm25Values.reduce(0, +) / Double(pm25Values.count),
            maxPM25: pm25Values.max() ?? 0,
            minPM25: pm25Values.min() ?? 0,
            coveragePercentage: calculateCoverage()
        )
    }
    
    private func calculateCoverage() -> Double {
        // 지구 표면적 대비 커버리지 계산
        let earthSurfaceArea = 510_072_000.0 // km²
        let stationCoverageRadius = 50.0 // km
        let stationArea = .pi * pow(stationCoverageRadius, 2)
        let totalCoverage = Double(stations.count) * stationArea
        
        return min(100, (totalCoverage / earthSurfaceArea) * 100)
    }
}

// MARK: - Data Models
struct GlobalStation: Identifiable {
    let id: String
    let name: String
    let latitude: Double
    let longitude: Double
    let pm25: Double
    let source: DataSourceType
    let lastUpdate: Date
    
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
}

enum DataSourceType {
    case waqi
    case iqair
    case openaq
    
    var priority: Int {
        switch self {
        case .iqair: return 3
        case .waqi: return 2
        case .openaq: return 1
        }
    }
}

struct GlobalStatistics {
    let totalStations: Int
    let averagePM25: Double
    let maxPM25: Double
    let minPM25: Double
    let coveragePercentage: Double
}

// MARK: - Visualization Helper
class HeatmapRenderer {
    static func renderHeatmap(_ data: [[Double]]) -> UIImage? {
        let width = data[0].count
        let height = data.count
        
        UIGraphicsBeginImageContext(CGSize(width: width, height: height))
        guard let context = UIGraphicsGetCurrentContext() else { return nil }
        
        for (i, row) in data.enumerated() {
            for (j, value) in row.enumerated() {
                let color = colorForPM25(value)
                context.setFillColor(color.cgColor)
                context.fill(CGRect(x: j, y: i, width: 1, height: 1))
            }
        }
        
        let image = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        return image
    }
    
    static func colorForPM25(_ value: Double) -> UIColor {
        switch value {
        case 0...12:
            return UIColor.green.withAlphaComponent(0.7)
        case 12.1...35.4:
            return UIColor.yellow.withAlphaComponent(0.7)
        case 35.5...55.4:
            return UIColor.orange.withAlphaComponent(0.7)
        case 55.5...150.4:
            return UIColor.red.withAlphaComponent(0.7)
        case 150.5...250.4:
            return UIColor.purple.withAlphaComponent(0.7)
        default:
            return UIColor(red: 0.5, green: 0, blue: 0, alpha: 0.7)
        }
    }
}
