//
//  AirLensApp.swift
//  AirLens
//
//  Created by Claude on 2025-11-06
//  PRD-Driven Implementation
//

import SwiftUI

@main
struct AirLensApp: App {
    // MARK: - Environment Objects
    @StateObject private var locationService = LocationService.shared
    @StateObject private var stationViewModel = StationViewModel()
    @StateObject private var policyViewModel = PolicyViewModel()
    @StateObject private var cameraViewModel = CameraViewModel()
    @StateObject private var globeViewModel = GlobeViewModel()
    @StateObject private var mlService = MLService.shared

    // MARK: - App State
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false

    var body: some Scene {
        WindowGroup {
            if hasCompletedOnboarding {
                ContentView()
                    .environmentObject(locationService)
                    .environmentObject(stationViewModel)
                    .environmentObject(policyViewModel)
                    .environmentObject(cameraViewModel)
                    .environmentObject(globeViewModel)
                    .environmentObject(mlService)
                    .preferredColorScheme(.dark)
                    .onAppear {
                        setupApp()
                    }
            } else {
                OnboardingView(hasCompletedOnboarding: $hasCompletedOnboarding)
            }
        }
    }

    // MARK: - Setup
    private func setupApp() {
        // Configure accessibility
        configureAccessibility()

        // Request location permission
        locationService.requestPermission()

        // Load CoreML model
        Task {
            await mlService.loadModel()
        }

        // Load initial data
        Task {
            await loadInitialData()
        }

        // Setup local notifications
        setupNotifications()
    }

    private func loadInitialData() async {
        // Fetch stations data
        await stationViewModel.fetchStations()

        // Fetch policies
        await policyViewModel.fetchPolicies()

        // Load cached satellite data
        await stationViewModel.loadSatelliteData()
    }

    private func configureAccessibility() {
        // Note: Dynamic Type is automatically supported by SwiftUI
        // Users can adjust text size in Settings > Accessibility > Display & Text Size
        
        // Reduce motion if needed
        if UIAccessibility.isReduceMotionEnabled {
            globeViewModel.disableAnimations()
        }
    }

    private func setupNotifications() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
            if granted {
                print("✅ Notification permission granted")
            }
        }
    }
}
