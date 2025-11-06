//
//  LocationService.swift
//  AirLens
//
//  Location services for user position tracking
//

import Foundation
import CoreLocation
import Combine

class LocationService: NSObject, ObservableObject {
    static let shared = LocationService()

    @Published var location: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus
    @Published var error: Error?

    private let locationManager = CLLocationManager()

    override private init() {
        self.authorizationStatus = locationManager.authorizationStatus
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 100 // Update every 100 meters
    }

    func requestPermission() {
        locationManager.requestWhenInUseAuthorization()
    }

    func startUpdating() {
        locationManager.startUpdatingLocation()
    }

    func stopUpdating() {
        locationManager.stopUpdatingLocation()
    }

    func getCurrentLocation() -> CLLocation? {
        return location
    }

    func getCoordinates() -> (latitude: Double, longitude: Double)? {
        guard let location = location else { return nil }
        return (location.coordinate.latitude, location.coordinate.longitude)
    }

    // Get location name from coordinates using reverse geocoding
    func getLocationName(latitude: Double, longitude: Double) async throws -> (city: String?, country: String?) {
        let location = CLLocation(latitude: latitude, longitude: longitude)
        let geocoder = CLGeocoder()

        let placemarks = try await geocoder.reverseGeocodeLocation(location)
        guard let placemark = placemarks.first else {
            return (nil, nil)
        }

        return (placemark.locality, placemark.country)
    }

    // Calculate distance between two coordinates in kilometers
    func distance(from: CLLocationCoordinate2D, to: CLLocationCoordinate2D) -> Double {
        let fromLocation = CLLocation(latitude: from.latitude, longitude: from.longitude)
        let toLocation = CLLocation(latitude: to.latitude, longitude: to.longitude)
        return fromLocation.distance(from: toLocation) / 1000.0 // Convert to km
    }
}

extension LocationService: CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        self.location = location
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        self.error = error
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus

        switch authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            startUpdating()
        case .denied, .restricted:
            error = LocationError.permissionDenied
        case .notDetermined:
            requestPermission()
        @unknown default:
            break
        }
    }
}

enum LocationError: Error, LocalizedError {
    case permissionDenied
    case locationUnavailable

    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "Location permission denied. Please enable location services in Settings."
        case .locationUnavailable:
            return "Unable to determine your location."
        }
    }
}
