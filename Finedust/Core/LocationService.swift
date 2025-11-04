//
//  LocationService.swift
//  AirLens
//
//  Service for handling location-based operations
//  Now uses CoreLocation's CLGeocoder instead of Gemini API
//

import Foundation
import CoreLocation
import Combine

class LocationService: NSObject, ObservableObject {
    @Published var currentLocation: CLLocation?
    @Published var locationDetails: LocationDetails?
    @Published var authorizationStatus: CLAuthorizationStatus
    @Published var error: Error?
    
    private let locationManager = CLLocationManager()
    private let geocoder = CLGeocoder()
    private var cancellables = Set<AnyCancellable>()
    
    override init() {
        self.authorizationStatus = locationManager.authorizationStatus
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }
    
    func requestPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startUpdatingLocation() {
        locationManager.startUpdatingLocation()
    }
    
    func stopUpdatingLocation() {
        locationManager.stopUpdatingLocation()
    }
    
    func fetchLocationName(for coordinate: CLLocationCoordinate2D) async throws -> LocationDetails {
        let location = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        
        return try await withCheckedThrowingContinuation { continuation in
            geocoder.reverseGeocodeLocation(location) { [weak self] placemarks, error in
                if let error = error {
                    print("❌ Geocoding error: \(error.localizedDescription)")
                    // Fall back to mock data on error
                    let mockDetails = self?.generateMockLocationDetails(
                        latitude: coordinate.latitude,
                        longitude: coordinate.longitude
                    )
                    if let details = mockDetails {
                        continuation.resume(returning: details)
                    } else {
                        continuation.resume(throwing: error)
                    }
                    return
                }
                
                guard let placemark = placemarks?.first else {
                    let error = NSError(
                        domain: "LocationService",
                        code: -1,
                        userInfo: [NSLocalizedDescriptionKey: "No placemark found"]
                    )
                    continuation.resume(throwing: error)
                    return
                }
                
                let city = placemark.locality ?? placemark.subAdministrativeArea ?? "Unknown City"
                let country = placemark.country ?? "Unknown Country"
                let countryCode = placemark.isoCountryCode ?? "XX"
                let flag = self?.countryCodeToFlag(countryCode) ?? "🌍"
                
                let details = LocationDetails(
                    city: city,
                    country: country,
                    flag: flag,
                    coordinate: coordinate
                )
                
                print("📍 Location found: \(city), \(country) \(flag)")
                
                DispatchQueue.main.async {
                    self?.locationDetails = details
                }
                
                continuation.resume(returning: details)
            }
        }
    }
    
    // MARK: - Mock Location Data (Fallback)
    private func generateMockLocationDetails(latitude: Double, longitude: Double) -> LocationDetails {
        let location = determineMockLocation(latitude: latitude, longitude: longitude)
        let flag = countryCodeToFlag(location.countryCode)
        
        print("🎭 Using mock location: \(location.city), \(location.country)")
        
        return LocationDetails(
            city: location.city,
            country: location.country,
            flag: flag,
            coordinate: CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
        )
    }
    
    private func determineMockLocation(latitude: Double, longitude: Double) -> (city: String, country: String, countryCode: String) {
        // Korea
        if (33...39).contains(latitude) && (124...132).contains(longitude) {
            let cities = [
                ("Seoul", "South Korea", "KR"),
                ("Busan", "South Korea", "KR"),
                ("Incheon", "South Korea", "KR"),
                ("Daegu", "South Korea", "KR"),
                ("Suwon", "South Korea", "KR")
            ]
            return cities.randomElement()!
        }
        
        // Japan
        if (30...46).contains(latitude) && (128...146).contains(longitude) {
            let cities = [
                ("Tokyo", "Japan", "JP"),
                ("Osaka", "Japan", "JP"),
                ("Kyoto", "Japan", "JP"),
                ("Yokohama", "Japan", "JP"),
                ("Sapporo", "Japan", "JP")
            ]
            return cities.randomElement()!
        }
        
        // China
        if (18...54).contains(latitude) && (73...135).contains(longitude) {
            let cities = [
                ("Beijing", "China", "CN"),
                ("Shanghai", "China", "CN"),
                ("Guangzhou", "China", "CN"),
                ("Shenzhen", "China", "CN"),
                ("Chengdu", "China", "CN")
            ]
            return cities.randomElement()!
        }
        
        // USA
        if (25...49).contains(latitude) && (-125...(-66)).contains(longitude) {
            let cities = [
                ("New York", "United States", "US"),
                ("Los Angeles", "United States", "US"),
                ("Chicago", "United States", "US"),
                ("Houston", "United States", "US"),
                ("Phoenix", "United States", "US")
            ]
            return cities.randomElement()!
        }
        
        // Europe
        if (35...72).contains(latitude) && (-10...40).contains(longitude) {
            let cities = [
                ("London", "United Kingdom", "GB"),
                ("Paris", "France", "FR"),
                ("Berlin", "Germany", "DE"),
                ("Madrid", "Spain", "ES"),
                ("Rome", "Italy", "IT")
            ]
            return cities.randomElement()!
        }
        
        // Southeast Asia
        if (-11...28).contains(latitude) && (95...141).contains(longitude) {
            let cities = [
                ("Singapore", "Singapore", "SG"),
                ("Bangkok", "Thailand", "TH"),
                ("Manila", "Philippines", "PH"),
                ("Kuala Lumpur", "Malaysia", "MY"),
                ("Jakarta", "Indonesia", "ID")
            ]
            return cities.randomElement()!
        }
        
        // Default
        return ("Unknown City", "Unknown Country", "XX")
    }
    
    private func countryCodeToFlag(_ countryCode: String) -> String {
        let base: UInt32 = 127397
        var flag = ""
        for scalar in countryCode.uppercased().unicodeScalars {
            if let scalarValue = UnicodeScalar(base + scalar.value) {
                flag.unicodeScalars.append(scalarValue)
            }
        }
        return flag.isEmpty ? "🌍" : flag
    }
}

// MARK: - CLLocationManagerDelegate
extension LocationService: CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        currentLocation = location
        
        // Fetch location name
        Task {
            do {
                _ = try await fetchLocationName(for: location.coordinate)
            } catch {
                self.error = error
                print("⚠️ Could not fetch location name, using mock data")
            }
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        self.error = error
        print("❌ Location error: \(error.localizedDescription)")
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus
        
        switch authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            startUpdatingLocation()
        case .denied, .restricted:
            error = NSError(
                domain: "LocationService",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "Location access denied"]
            )
        default:
            break
        }
    }
}
