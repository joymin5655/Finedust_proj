//
//  StationViewModel.swift
//  AirLens
//
//  Created on 2025-11-06
//

import Foundation
import Combine
import CoreLocation

@MainActor
class StationViewModel: ObservableObject {
    @Published var stations: [Station] = []
    @Published var nearbyStations: [Station] = []
    @Published var selectedStation: Station?
    @Published var isLoading = false
    @Published var error: String?
    @Published var searchText = ""
    @Published var selectedCountry: String?
    
    private let apiClient = APIClient.shared
    private let storageService = StorageService.shared
    private var cancellables = Set<AnyCancellable>()
    
    // 필터링된 측정소
    var filteredStations: [Station] {
        var result = stations
        
        // 검색어 필터
        if !searchText.isEmpty {
            result = result.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                $0.country.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // 국가 필터
        if let country = selectedCountry {
            result = result.filter { $0.country == country }
        }
        
        return result
    }
    
    // 통계
    var statistics: StationStatistics {
        StationStatistics(from: stations)
    }
    
    // 최고 PM2.5 측정소
    func getHighestPM25(limit: Int = 5) -> [Station] {
        stations.sorted { $0.pm25 > $1.pm25 }.prefix(limit).map { $0 }
    }
    
    // 최저 PM2.5 측정소
    func getLowestPM25(limit: Int = 5) -> [Station] {
        stations.sorted { $0.pm25 < $1.pm25 }.prefix(limit).map { $0 }
    }
    
    // 국가 목록
    var availableCountries: [String] {
        Array(Set(stations.map { $0.country })).sorted()
    }    
    // MARK: - Data Loading
    
    // 측정소 데이터 가져오기
    func fetchStations(country: String? = nil) async {
        isLoading = true
        error = nil
        
        do {
            // 캐시된 데이터 먼저 로드
            if let cachedStations = storageService.loadStations() {
                self.stations = cachedStations
                print("✅ Loaded \(cachedStations.count) stations from cache")
            }
            
            // API에서 최신 데이터 가져오기
            let fetchedStations = try await apiClient.fetchStations(country: country)
            self.stations = fetchedStations
            
            // 캐시에 저장
            storageService.saveStations(fetchedStations)
            
            print("✅ Loaded \(fetchedStations.count) stations from API")
        } catch {
            self.error = error.localizedDescription
            print("❌ Error loading stations: \(error)")
        }
        
        isLoading = false
    }
    
    // 가까운 측정소 찾기
    func findNearbyStations(latitude: Double, longitude: Double, radius: Double = 50) async {
        let userLocation = CLLocation(latitude: latitude, longitude: longitude)
        
        nearbyStations = stations.filter { station in
            let distance = station.distance(from: userLocation)
            return distance <= radius // radius in km
        }.sorted { station1, station2 in
            station1.distance(from: userLocation) < station2.distance(from: userLocation)
        }
        
        print("✅ Found \(nearbyStations.count) stations within \(radius)km")
    }
    
    // 측정소 선택
    func selectStation(_ station: Station) {
        selectedStation = station
    }
    
    // 데이터 새로고침
    func refresh() async {
        await fetchStations()
    }
    
    // MARK: - Export Functions
    
    // CSV로 내보내기
    func exportToCSV() -> String {
        var csv = "ID,Name,Country,Latitude,Longitude,PM2.5,PM10,Category\n"
        
        for station in stations {
            csv += "\(station.id),"
            csv += "\(station.name.replacingOccurrences(of: ",", with: ";")),"
            csv += "\(station.country),"
            csv += "\(station.latitude),"
            csv += "\(station.longitude),"
            csv += "\(station.pm25),"
            csv += "\(station.pm10 ?? 0),"
            csv += "\(station.pm25Category.label)\n"
        }
        
        return csv
    }
    
    // JSON으로 내보내기
    func exportToJSON() -> Data? {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        encoder.dateEncodingStrategy = .iso8601
        
        do {
            return try encoder.encode(stations)
        } catch {
            print("❌ Failed to encode stations to JSON: \(error)")
            return nil
        }
    }
}