//
//  AirLensApp.swift
//  AirLens
//
//  Main app entry point
//

import SwiftUI

@main
struct AirLensApp: App {
    // ViewModels
    @StateObject private var locationService = LocationService.shared
    @StateObject private var stationViewModel = StationViewModel()
    @StateObject private var policyViewModel = PolicyViewModel()
    @StateObject private var cameraViewModel = CameraViewModel()
    @StateObject private var globeViewModel = GlobeViewModel()

    // App state
    @AppStorage("hasSeenOnboarding") private var hasSeenOnboarding = false

    var body: some Scene {
        WindowGroup {
            if hasSeenOnboarding {
                ContentView()
                    .environmentObject(locationService)
                    .environmentObject(stationViewModel)
                    .environmentObject(policyViewModel)
                    .environmentObject(cameraViewModel)
                    .environmentObject(globeViewModel)
                    .preferredColorScheme(.dark)
                    .task {
                        await setupApp()
                    }
            } else {
                OnboardingView(showOnboarding: $hasSeenOnboarding)
            }
        }
    }

    private func setupApp() async {
        // Request location permission
        locationService.requestPermission()

        // Fetch initial data
        async let stations = stationViewModel.fetchStations()
        async let policies = policyViewModel.fetchPolicies()

        // Wait for both to complete
        await stations
        await policies
    }
}
