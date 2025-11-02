//
//  LocationService.swift
//  AirLens
//
//  Service for handling location-based operations
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
        // This will call Gemini API to get location details
        let apiService = GeminiAPIService.shared
        let response = try await apiService.getLocationDetails(
            latitude: coordinate.latitude,
            longitude: coordinate.longitude
        )
        
        // Convert country code to flag emoji
        let flag = countryCodeToFlag(response.countryCode)
        
        let details = LocationDetails(
            city: response.city,
            country: response.country,
            flag: flag,
            coordinate: coordinate
        )
        
        DispatchQueue.main.async {
            self.locationDetails = details
        }
        
        return details
    }
    
    private func countryCodeToFlag(_ countryCode: String) -> String {
        let base: UInt32 = 127397
        var flag = ""
        for scalar in countryCode.uppercased().unicodeScalars {
            if let scalarValue = UnicodeScalar(base + scalar.value) {
                flag.unicodeScalars.append(scalarValue)
            }
        }
        return flag
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
            }
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        self.error = error
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
