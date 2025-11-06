//
//  LocationService.swift
//  AirLens
//
//  Created on 2025-11-06
//

import Foundation
import CoreLocation
import Combine

// MARK: - Location Service
class LocationService: NSObject, ObservableObject {
    static let shared = LocationService()
    
    @Published var currentLocation: CLLocationCoordinate2D?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var locationError: Error?
    @Published var address: String?
    @Published var city: String?
    @Published var country: String?
    
    private let locationManager = CLLocationManager()
    private let geocoder = CLGeocoder()
    private var locationUpdateSubject = PassthroughSubject<CLLocationCoordinate2D, Never>()
    
    var locationPublisher: AnyPublisher<CLLocationCoordinate2D, Never> {
        locationUpdateSubject.eraseToAnyPublisher()
    }
    
    override private init() {
        super.init()
        setupLocationManager()
    }
    
    // MARK: - Setup
    
    private func setupLocationManager() {
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 100 // Update every 100 meters
        locationManager.pausesLocationUpdatesAutomatically = true
        locationManager.activityType = .other
        
        // Background location updates
        locationManager.allowsBackgroundLocationUpdates = false // Set to true if needed
        locationManager.showsBackgroundLocationIndicator = false
    }
    
    // MARK: - Public Methods
    
    /// Request location permission
    func requestPermission() {
        switch authorizationStatus {
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
        case .denied, .restricted:
            locationError = LocationError.permissionDenied
        case .authorizedWhenInUse, .authorizedAlways:
            startUpdatingLocation()
        @unknown default:
            break
        }
    }
    
    /// Request always authorization (for background updates)
    func requestAlwaysAuthorization() {
        if authorizationStatus == .authorizedWhenInUse {
            locationManager.requestAlwaysAuthorization()
        }
    }
    
    /// Start updating location
    func startUpdatingLocation() {
        locationManager.startUpdatingLocation()
    }
    
    /// Stop updating location
    func stopUpdatingLocation() {
        locationManager.stopUpdatingLocation()
    }
    
    /// Get current location once
    func requestLocation() {
        locationManager.requestLocation()
    }
    
    /// Start monitoring significant location changes (battery efficient)
    func startMonitoringSignificantLocationChanges() {
        locationManager.startMonitoringSignificantLocationChanges()
    }
    
    /// Stop monitoring significant location changes
    func stopMonitoringSignificantLocationChanges() {
        locationManager.stopMonitoringSignificantLocationChanges()
    }
    
    // MARK: - Geocoding
    
    /// Reverse geocode location to get address
    func reverseGeocode(location: CLLocation) {
        geocoder.reverseGeocodeLocation(location) { [weak self] placemarks, error in
            guard let self = self else { return }
            
            if let error = error {
                print("❌ Geocoding error: \(error.localizedDescription)")
                return
            }
            
            guard let placemark = placemarks?.first else { return }
            
            DispatchQueue.main.async {
                self.address = self.formatAddress(from: placemark)
                self.city = placemark.locality
                self.country = placemark.country
            }
        }
    }
    
    private func formatAddress(from placemark: CLPlacemark) -> String {
        var components: [String] = []
        
        if let streetNumber = placemark.subThoroughfare {
            components.append(streetNumber)
        }
        
        if let street = placemark.thoroughfare {
            components.append(street)
        }
        
        if let city = placemark.locality {
            components.append(city)
        }
        
        if let state = placemark.administrativeArea {
            components.append(state)
        }
        
        if let postalCode = placemark.postalCode {
            components.append(postalCode)
        }
        
        if let country = placemark.country {
            components.append(country)
        }
        
        return components.joined(separator: ", ")
    }
    
    // MARK: - Distance Calculation
    
    /// Calculate distance between two coordinates in kilometers
    func distance(from: CLLocationCoordinate2D, to: CLLocationCoordinate2D) -> Double {
        let fromLocation = CLLocation(latitude: from.latitude, longitude: from.longitude)
        let toLocation = CLLocation(latitude: to.latitude, longitude: to.longitude)
        return fromLocation.distance(from: toLocation) / 1000 // Convert to kilometers
    }
    
    /// Check if location is within radius (in kilometers)
    func isWithinRadius(_ location: CLLocationCoordinate2D, center: CLLocationCoordinate2D, radius: Double) -> Bool {
        return distance(from: location, to: center) <= radius
    }
    
    // MARK: - Region Monitoring
    
    /// Start monitoring a circular region
    func startMonitoring(region: CLCircularRegion) {
        locationManager.startMonitoring(for: region)
    }
    
    /// Stop monitoring a region
    func stopMonitoring(region: CLCircularRegion) {
        locationManager.stopMonitoring(for: region)
    }
    
    /// Create a circular region
    func createRegion(center: CLLocationCoordinate2D, radius: Double, identifier: String) -> CLCircularRegion {
        let region = CLCircularRegion(
            center: center,
            radius: radius * 1000, // Convert to meters
            identifier: identifier
        )
        region.notifyOnEntry = true
        region.notifyOnExit = true
        return region
    }
}

// MARK: - CLLocationManagerDelegate
extension LocationService: CLLocationManagerDelegate {
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        DispatchQueue.main.async {
            self.authorizationStatus = manager.authorizationStatus
            
            switch manager.authorizationStatus {
            case .authorizedWhenInUse, .authorizedAlways:
                self.startUpdatingLocation()
            case .denied, .restricted:
                self.locationError = LocationError.permissionDenied
            case .notDetermined:
                break
            @unknown default:
                break
            }
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        
        DispatchQueue.main.async {
            self.currentLocation = location.coordinate
            self.locationUpdateSubject.send(location.coordinate)
            
            // Reverse geocode the location
            self.reverseGeocode(location: location)
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        DispatchQueue.main.async {
            self.locationError = error
            print("❌ Location error: \(error.localizedDescription)")
        }
    }
    
    // Region monitoring
    func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        print("📍 Entered region: \(region.identifier)")
        // Handle region entry (e.g., send notification)
    }
    
    func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        print("📍 Exited region: \(region.identifier)")
        // Handle region exit
    }
}

// MARK: - Location Error
enum LocationError: LocalizedError {
    case permissionDenied
    case locationUnavailable
    case unknown
    
    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "Location permission denied. Please enable location services in Settings."
        case .locationUnavailable:
            return "Location is currently unavailable."
        case .unknown:
            return "An unknown location error occurred."
        }
    }
}