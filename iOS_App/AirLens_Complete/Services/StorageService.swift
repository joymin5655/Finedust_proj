//
//  StorageService.swift
//  AirLens
//
//  Created on 2025-11-06
//

import Foundation
import UIKit

// MARK: - Storage Service
class StorageService: ObservableObject {
    static let shared = StorageService()
    
    private let documentsDirectory: URL
    private let cacheDirectory: URL
    private let userDefaults = UserDefaults.standard
    private let fileManager = FileManager.default
    
    // Storage Keys
    private enum StorageKey: String {
        case stations = "cached_stations"
        case policies = "cached_policies"
        case predictionHistory = "prediction_history"
        case lastLocation = "last_location"
        case settings = "app_settings"
        case lastSync = "last_sync_date"
    }
    
    // Storage Directories
    private enum Directory: String {
        case airQualityData = "AirQualityData"
        case predictions = "Predictions"
        case policies = "Policies"
        case cache = "Cache"
    }
    
    private init() {
        // Get documents directory
        documentsDirectory = fileManager.urls(for: .documentDirectory, 
                                             in: .userDomainMask).first!
        
        // Get cache directory
        cacheDirectory = fileManager.urls(for: .cachesDirectory, 
                                         in: .userDomainMask).first!
        
        // Create necessary directories
        createDirectories()
    }
    
    // MARK: - Directory Management
    
    private func createDirectories() {
        for directory in Directory.allCases {
            let path = documentsDirectory.appendingPathComponent(directory.rawValue)
            
            if !fileManager.fileExists(atPath: path.path) {
                do {
                    try fileManager.createDirectory(at: path, 
                                                   withIntermediateDirectories: true)
                    print("✅ Created directory: \(directory.rawValue)")
                } catch {
                    print("❌ Failed to create directory \(directory.rawValue): \(error)")
                }
            }
        }
    }
    
    private func getDirectoryURL(for directory: Directory) -> URL {
        return documentsDirectory.appendingPathComponent(directory.rawValue)
    }
    
    // MARK: - Station Storage
    
    /// Save stations to cache
    func saveStations(_ stations: [Station]) {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        
        do {
            let data = try encoder.encode(stations)
            let url = getDirectoryURL(for: .airQualityData)
                .appendingPathComponent("stations.json")
            try data.write(to: url)
            
            // Update last sync date
            userDefaults.set(Date(), forKey: StorageKey.lastSync.rawValue)
            
            print("✅ Saved \(stations.count) stations to cache")
        } catch {
            print("❌ Failed to save stations: \(error)")
        }
    }
    
    /// Load stations from cache
    func loadStations() -> [Station]? {
        let url = getDirectoryURL(for: .airQualityData)
            .appendingPathComponent("stations.json")
        
        guard fileManager.fileExists(atPath: url.path) else {
            print("⚠️ No cached stations found")
            return nil
        }
        
        do {
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            let stations = try decoder.decode([Station].self, from: data)
            
            print("✅ Loaded \(stations.count) stations from cache")
            return stations
        } catch {
            print("❌ Failed to load stations: \(error)")
            return nil
        }
    }
    
    // MARK: - Policy Storage
    
    /// Save policies to cache
    func savePolicies(_ policies: [AirPolicy]) {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        
        do {
            let data = try encoder.encode(policies)
            let url = getDirectoryURL(for: .policies)
                .appendingPathComponent("policies.json")
            try data.write(to: url)
            
            print("✅ Saved \(policies.count) policies to cache")
        } catch {
            print("❌ Failed to save policies: \(error)")
        }
    }
    
    /// Load policies from cache
    func loadPolicies() -> [AirPolicy]? {
        let url = getDirectoryURL(for: .policies)
            .appendingPathComponent("policies.json")
        
        guard fileManager.fileExists(atPath: url.path) else {
            print("⚠️ No cached policies found")
            return nil
        }
        
        do {
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            let policies = try decoder.decode([AirPolicy].self, from: data)
            
            print("✅ Loaded \(policies.count) policies from cache")
            return policies
        } catch {
            print("❌ Failed to load policies: \(error)")
            return nil
        }
    }
    
    // MARK: - Prediction Storage
    
    /// Save prediction history
    func savePredictionHistory(_ predictions: [PredictionResult]) {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        
        do {
            let data = try encoder.encode(predictions)
            let url = getDirectoryURL(for: .predictions)
                .appendingPathComponent("history.json")
            try data.write(to: url)
            
            print("✅ Saved \(predictions.count) predictions to history")
        } catch {
            print("❌ Failed to save prediction history: \(error)")
        }
    }
    
    /// Load prediction history
    func loadPredictionHistory() -> [PredictionResult]? {
        let url = getDirectoryURL(for: .predictions)
            .appendingPathComponent("history.json")
        
        guard fileManager.fileExists(atPath: url.path) else {
            print("⚠️ No prediction history found")
            return nil
        }
        
        do {
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            let predictions = try decoder.decode([PredictionResult].self, from: data)
            
            print("✅ Loaded \(predictions.count) predictions from history")
            return predictions
        } catch {
            print("❌ Failed to load prediction history: \(error)")
            return nil
        }
    }
    
    /// Save prediction image
    func savePredictionImage(_ image: UIImage, filename: String) -> URL? {
        guard let data = image.jpegData(compressionQuality: 0.8) else { return nil }
        
        let url = getDirectoryURL(for: .predictions)
            .appendingPathComponent("\(filename).jpg")
        
        do {
            try data.write(to: url)
            print("✅ Saved prediction image: \(filename)")
            return url
        } catch {
            print("❌ Failed to save prediction image: \(error)")
            return nil
        }
    }
    
    /// Clear prediction history
    func clearPredictionHistory() {
        let url = getDirectoryURL(for: .predictions)
        
        do {
            let contents = try fileManager.contentsOfDirectory(at: url, 
                                                              includingPropertiesForKeys: nil)
            for file in contents {
                try fileManager.removeItem(at: file)
            }
            print("✅ Cleared prediction history")
        } catch {
            print("❌ Failed to clear prediction history: \(error)")
        }
    }
    
    // MARK: - Cache Management
    
    /// Get cache size in MB
    func getCacheSize() -> Double {
        let cachePaths = [
            getDirectoryURL(for: .cache),
            cacheDirectory
        ]
        
        var totalSize: Int64 = 0
        
        for path in cachePaths {
            if let size = try? fileManager.allocatedSizeOfDirectory(at: path) {
                totalSize += size
            }
        }
        
        return Double(totalSize) / (1024 * 1024) // Convert to MB
    }
    
    /// Clear all cache
    func clearCache() {
        let paths = [
            getDirectoryURL(for: .cache),
            cacheDirectory
        ]
        
        for path in paths {
            do {
                let contents = try fileManager.contentsOfDirectory(at: path, 
                                                                  includingPropertiesForKeys: nil)
                for file in contents {
                    try fileManager.removeItem(at: file)
                }
                print("✅ Cleared cache at: \(path.lastPathComponent)")
            } catch {
                print("❌ Failed to clear cache: \(error)")
            }
        }
    }
    
    /// Check if cache is expired
    func isCacheExpired() -> Bool {
        guard let lastSync = userDefaults.object(forKey: StorageKey.lastSync.rawValue) as? Date else {
            return true
        }
        
        let hoursSinceSync = Date().timeIntervalSince(lastSync) / 3600
        return hoursSinceSync > 1 // Cache expires after 1 hour
    }
    
    // MARK: - User Defaults Storage
    
    /// Save last location
    func saveLastLocation(latitude: Double, longitude: Double) {
        let location = ["latitude": latitude, "longitude": longitude]
        userDefaults.set(location, forKey: StorageKey.lastLocation.rawValue)
    }
    
    /// Load last location
    func loadLastLocation() -> (latitude: Double, longitude: Double)? {
        guard let location = userDefaults.object(forKey: StorageKey.lastLocation.rawValue) as? [String: Double],
              let latitude = location["latitude"],
              let longitude = location["longitude"] else {
            return nil
        }
        
        return (latitude, longitude)
    }
    
    /// Save app settings
    func saveSettings(_ settings: [String: Any]) {
        userDefaults.set(settings, forKey: StorageKey.settings.rawValue)
    }
    
    /// Load app settings
    func loadSettings() -> [String: Any]? {
        return userDefaults.object(forKey: StorageKey.settings.rawValue) as? [String: Any]
    }
}

// MARK: - FileManager Extension
extension FileManager {
    func allocatedSizeOfDirectory(at url: URL) throws -> Int64 {
        let resourceKeys: [URLResourceKey] = [.totalFileAllocatedSizeKey, .fileAllocatedSizeKey]
        
        var totalSize: Int64 = 0
        
        let enumerator = self.enumerator(at: url,
                                        includingPropertiesForKeys: resourceKeys,
                                        options: [.skipsHiddenFiles])!
        
        for case let fileURL as URL in enumerator {
            let resourceValues = try fileURL.resourceValues(forKeys: Set(resourceKeys))
            totalSize += Int64(resourceValues.totalFileAllocatedSize ?? 
                              resourceValues.fileAllocatedSize ?? 0)
        }
        
        return totalSize
    }
}

// MARK: - Directory Cases
extension StorageService.Directory: CaseIterable {}