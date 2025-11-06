//
//  ContentView.swift
//  AirLens
//
//  Created by Claude on 2025-11-06
//  Main navigation container with Tab-based UI
//

import SwiftUI
import CoreLocation

struct ContentView: View {
    // MARK: - Environment Objects
    @EnvironmentObject var stationViewModel: StationViewModel
    @EnvironmentObject var policyViewModel: PolicyViewModel
    @EnvironmentObject var cameraViewModel: CameraViewModel
    @EnvironmentObject var globeViewModel: GlobeViewModel
    @EnvironmentObject var locationService: LocationService
    @EnvironmentObject var mlService: MLService

    // MARK: - State
    @State private var selectedTab = 0
    @State private var showSettings = false

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.05, green: 0.05, blue: 0.15),
                    Color.black
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            TabView(selection: $selectedTab) {
                // MARK: - Globe Tab
                GlobeView()
                    .tabItem {
                        Label("Globe", systemImage: "globe.americas.fill")
                    }
                    .tag(0)
                    .accessibilityLabel("Globe view showing worldwide air quality stations")

                // MARK: - Camera Tab
                CameraView()
                    .tabItem {
                        Label("Camera", systemImage: "camera.fill")
                    }
                    .tag(1)
                    .accessibilityLabel("Camera view for AI air quality prediction")

                // MARK: - Policies Tab
                PoliciesView()
                    .tabItem {
                        Label("Policies", systemImage: "doc.text.fill")
                    }
                    .tag(2)
                    .accessibilityLabel("Environmental policies by country")

                // MARK: - Stats Tab
                StatsView()
                    .tabItem {
                        Label("Stats", systemImage: "chart.bar.fill")
                    }
                    .tag(3)
                    .accessibilityLabel("Air quality statistics and trends")
            }
            .accentColor(colorForTab(selectedTab))

            // MARK: - Header Overlay
            VStack {
                HeaderView(
                    selectedTab: selectedTab,
                    showSettings: $showSettings
                )
                .padding(.top, 50)
                Spacer()
            }
            .ignoresSafeArea()
        }
        .task {
            await loadInitialData()
        }
        .sheet(isPresented: $showSettings) {
            SettingsView()
        }
        .alert("Location Error", isPresented: .constant(locationService.locationError != nil)) {
            Button("OK") {
                locationService.locationError = nil
            }
        } message: {
            if let error = locationService.locationError {
                Text(error.localizedDescription)
            }
        }
    }

    // MARK: - Helper Methods
    private func loadInitialData() async {
        // Load stations
        await stationViewModel.fetchStations()

        // Load policies
        await policyViewModel.fetchPolicies()

        // Find nearby stations
        if let location = locationService.currentLocation {
            await stationViewModel.findNearbyStations(
                latitude: location.latitude,
                longitude: location.longitude
            )
        }
    }

    private func colorForTab(_ tab: Int) -> Color {
        switch tab {
        case 0: return .cyan
        case 1: return .green
        case 2: return .orange
        case 3: return .purple
        default: return .blue
        }
    }
}

// MARK: - Header View
struct HeaderView: View {
    let selectedTab: Int
    @Binding var showSettings: Bool
    @EnvironmentObject var stationViewModel: StationViewModel
    @EnvironmentObject var locationService: LocationService

    var headerTitle: String {
        switch selectedTab {
        case 0: return "🌍 AirLens Globe"
        case 1: return "📸 AI Prediction"
        case 2: return "📋 Air Policies"
        case 3: return "📊 Statistics"
        default: return "AirLens"
        }
    }

    var headerSubtitle: String {
        switch selectedTab {
        case 0: return "\(stationViewModel.stations.count) stations worldwide"
        case 1: return "On-device CoreML powered"
        case 2: return "\(policyViewModel.policies.count) policies tracked"
        case 3: return locationService.city ?? "Global view"
        default: return ""
        }
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(headerTitle)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .accessibilityAddTraits(.isHeader)

                if !headerSubtitle.isEmpty {
                    Text(headerSubtitle)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }

            Spacer()

            HStack(spacing: 16) {
                // Location indicator
                if let city = locationService.city {
                    HStack(spacing: 4) {
                        Image(systemName: "location.fill")
                            .font(.caption)
                        Text(city)
                            .font(.caption)
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.white.opacity(0.2))
                    .cornerRadius(12)
                }

                // Settings button
                Button(action: { showSettings = true }) {
                    Image(systemName: "gearshape.fill")
                        .font(.title2)
                        .foregroundColor(.white)
                }
                .accessibilityLabel("Settings")
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [
                    Color.black.opacity(0.8),
                    Color.clear
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }
}

// MARK: - Onboarding View
struct OnboardingView: View {
    @Binding var hasCompletedOnboarding: Bool
    @State private var currentPage = 0

    let pages: [(icon: String, title: String, description: String)] = [
        ("globe.americas.fill", "Global Coverage", "Access 30,000+ air quality stations worldwide with real-time data"),
        ("camera.fill", "AI Prediction", "Predict PM2.5 levels from sky photos using on-device CoreML"),
        ("doc.text.fill", "Policy Tracking", "Track 150+ countries' environmental policies with credibility ratings"),
        ("accessibility", "Accessible Design", "VoiceOver, haptic feedback, and color-blind friendly palettes")
    ]

    var body: some View {
        VStack(spacing: 30) {
            Spacer()

            TabView(selection: $currentPage) {
                ForEach(0..<pages.count, id: \.self) { index in
                    OnboardingPage(
                        icon: pages[index].icon,
                        title: pages[index].title,
                        description: pages[index].description
                    )
                    .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .always))
            .indexViewStyle(.page(backgroundDisplayMode: .always))

            Spacer()

            Button(action: { hasCompletedOnboarding = true }) {
                Text(currentPage == pages.count - 1 ? "Get Started" : "Skip")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(12)
            }
            .padding()
        }
        .background(Color.black)
    }
}

struct OnboardingPage: View {
    let icon: String
    let title: String
    let description: String

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: icon)
                .font(.system(size: 100))
                .foregroundColor(.blue)
                .accessibilityHidden(true)

            Text(title)
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .accessibilityAddTraits(.isHeader)

            Text(description)
                .font(.body)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
    }
}

// MARK: - Settings View
struct SettingsView: View {
    @Environment(\.dismiss) var dismiss
    @AppStorage("enableNotifications") private var enableNotifications = true
    @AppStorage("enableHaptics") private var enableHaptics = true
    @AppStorage("dataRefreshInterval") private var dataRefreshInterval = 10.0

    var body: some View {
        NavigationView {
            Form {
                Section("General") {
                    Toggle("Enable Notifications", isOn: $enableNotifications)
                    Toggle("Enable Haptics", isOn: $enableHaptics)
                }

                Section("Data") {
                    VStack(alignment: .leading) {
                        Text("Refresh Interval: \(Int(dataRefreshInterval)) minutes")
                            .font(.subheadline)
                        Slider(value: $dataRefreshInterval, in: 5...60, step: 5)
                    }
                }

                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }

                    Link("Privacy Policy", destination: URL(string: "https://airlens.app/privacy")!)
                    Link("Terms of Service", destination: URL(string: "https://airlens.app/terms")!)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Preview
#Preview {
    ContentView()
        .environmentObject(LocationService.shared)
        .environmentObject(StationViewModel())
        .environmentObject(PolicyViewModel())
        .environmentObject(CameraViewModel())
        .environmentObject(GlobeViewModel())
        .environmentObject(MLService.shared)
}
