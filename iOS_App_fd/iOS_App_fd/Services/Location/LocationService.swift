//
//  LocationService.swift
//  AirLens
//
//  Location management with <10s lock target (PRD AC-1)
//

import Foundation
import CoreLocation
import Combine

// MARK: - Location Service
class LocationService: NSObject, ObservableObject {
    static let shared = LocationService()

    // MARK: - Published Properties
    @Published var currentLocation: CLLocationCoordinate2D?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var locationError: Error?
    @Published var address: String?
    @Published var city: String?
    @Published var country: String?
    @Published var isLocationLocked = false
    @Published var locationLockTime: TimeInterval = 0

    // MARK: - Private Properties
    private let locationManager = CLLocationManager()
    private let geocoder = CLGeocoder()
    private var locationUpdateSubject = PassthroughSubject<CLLocationCoordinate2D, Never>()
    private var locationLockTimer: Date?

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
        locationManager.distanceFilter = 100 // Update every 100m (PRD)
        locationManager.pausesLocationUpdatesAutomatically = true
        locationManager.activityType = .other
    }

    // MARK: - Public Methods

    /// Request location permission (PRD AC-1: <10s target)
    func requestPermission() {
        locationLockTimer = Date()

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

    func startUpdatingLocation() {
        locationManager.startUpdatingLocation()
    }

    func stopUpdatingLocation() {
        locationManager.stopUpdatingLocation()
    }

    func requestLocation() {
        locationLockTimer = Date()
        locationManager.requestLocation()
    }

    // MARK: - Battery-efficient monitoring (PRD)
    func startMonitoringSignificantLocationChanges() {
        locationManager.startMonitoringSignificantLocationChanges()
    }

    func stopMonitoringSignificantLocationChanges() {
        locationManager.stopMonitoringSignificantLocationChanges()
    }

    // MARK: - Geocoding
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

        if let street = placemark.thoroughfare {
            components.append(street)
        }
        if let city = placemark.locality {
            components.append(city)
        }
        if let state = placemark.administrativeArea {
            components.append(state)
        }
        if let country = placemark.country {
            components.append(country)
        }

        return components.joined(separator: ", ")
    }

    // MARK: - Distance Calculation
    func distance(from: CLLocationCoordinate2D, to: CLLocationCoordinate2D) -> Double {
        let fromLocation = CLLocation(latitude: from.latitude, longitude: from.longitude)
        let toLocation = CLLocation(latitude: to.latitude, longitude: to.longitude)
        return fromLocation.distance(from: toLocation) / 1000 // km
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

        // Calculate location lock time (PRD AC-1: <10s)
        if let startTime = locationLockTimer {
            locationLockTime = Date().timeIntervalSince(startTime)
            print("📍 Location locked in \(String(format: "%.2f", locationLockTime))s")
        }

        DispatchQueue.main.async {
            self.currentLocation = location.coordinate
            self.isLocationLocked = true
            self.locationUpdateSubject.send(location.coordinate)
            self.reverseGeocode(location: location)
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        DispatchQueue.main.async {
            self.locationError = error
            self.isLocationLocked = false
            print("❌ Location error: \(error.localizedDescription)")
        }
    }
}

// MARK: - Location Error
enum LocationError: LocalizedError {
    case permissionDenied
    case locationUnavailable
    case timeout
    case unknown

    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "Location permission denied. Please enable in Settings."
        case .locationUnavailable:
            return "Location is currently unavailable."
        case .timeout:
            return "Location request timed out. Please try again."
        case .unknown:
            return "An unknown location error occurred."
        }
    }
}
