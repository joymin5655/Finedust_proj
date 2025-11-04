//
//  LocationManager.swift
//  Finedust
//
//  Location management wrapper for CoreLocation
//

import Foundation
import CoreLocation
import Combine

class LocationManager: NSObject, ObservableObject {
    
    @Published var location: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus
    @Published var isAuthorized: Bool = false
    @Published var error: LocationError?
    
    private let locationManager = CLLocationManager()
    private var cancellables = Set<AnyCancellable>()
    
    override init() {
        // 임시 값으로 초기화
        self.authorizationStatus = .notDetermined
        super.init()
        
        // super.init() 이후에 실제 값 설정
        self.authorizationStatus = locationManager.authorizationStatus
        self.isAuthorized = [.authorizedWhenInUse, .authorizedAlways].contains(authorizationStatus)
        
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 100
    }
    
    func requestPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startUpdatingLocation() {
        guard isAuthorized else {
            error = .unauthorized
            return
        }
        locationManager.startUpdatingLocation()
    }
    
    func stopUpdatingLocation() {
        locationManager.stopUpdatingLocation()
    }
    
    func requestLocation() {
        guard isAuthorized else {
            error = .unauthorized
            return
        }
        locationManager.requestLocation()
    }
}

extension LocationManager: CLLocationManagerDelegate {
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        guard location.horizontalAccuracy > 0 && location.horizontalAccuracy < 100 else {
            error = .lowAccuracy(location.horizontalAccuracy)
            return
        }
        self.location = location
        self.error = nil
        print("📍 Location updated: \(location.coordinate.latitude), \(location.coordinate.longitude)")
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        self.error = .locationFailed(error.localizedDescription)
        print("❌ Location error: \(error.localizedDescription)")
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus
        isAuthorized = [.authorizedWhenInUse, .authorizedAlways].contains(authorizationStatus)
        
        switch authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            print("✅ Location authorization: Granted")
            startUpdatingLocation()
        case .denied, .restricted:
            error = .unauthorized
            print("❌ Location authorization: Denied")
        default:
            break
        }
    }
}

enum LocationError: Error, LocalizedError {
    case unauthorized
    case locationFailed(String)
    case lowAccuracy(Double)
    
    var errorDescription: String? {
        switch self {
        case .unauthorized:
            return "Location access not authorized"
        case .locationFailed(let message):
            return "Failed to get location: \(message)"
        case .lowAccuracy(let accuracy):
            return "Location accuracy too low: ±\(Int(accuracy))m"
        }
    }
}
