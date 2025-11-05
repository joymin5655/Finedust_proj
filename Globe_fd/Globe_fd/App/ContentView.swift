//
//  ContentView.swift
//  Globe_fd
//
//  Enhanced AirLens iOS App with Modern UI
//  Created on 2025-11-05.
//

import SwiftUI
import MapKit

struct ContentView: View {
    @StateObject private var stationVM = StationViewModel()
    @StateObject private var policyVM = PolicyViewModel()
    @StateObject private var cameraVM = CameraViewModel()
    @StateObject private var locationService = LocationService.shared
    
    @State private var selectedTab = 0
    @State private var showOnboarding = !UserDefaults.standard.bool(forKey: "hasSeenOnboarding")
    @State private var showNotifications = false
    
    init() {
        // Custom Tab Bar appearance
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor.systemBackground.withAlphaComponent(0.95)
        
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }
    
    var body: some View {
        ZStack {
            if showOnboarding {
                OnboardingView(showOnboarding: $showOnboarding)
                    .transition(.move(edge: .trailing))
            } else {
                mainContent
            }
        }
        .preferredColorScheme(.dark)
    }
    
    var mainContent: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .environmentObject(stationVM)
                .environmentObject(locationService)
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            MapView()
                .environmentObject(stationVM)
                .environmentObject(locationService)
                .tabItem {
                    Label("Map", systemImage: "map.fill")
                }
                .tag(1)
            
            CameraView()
                .environmentObject(cameraVM)
                .tabItem {
                    Label("Scan", systemImage: "camera.fill")
                }
                .tag(2)
            
            PoliciesView()
                .environmentObject(policyVM)
                .tabItem {
                    Label("Policies", systemImage: "doc.text.fill")
                }
                .tag(3)
            
            ProfileView()
                .environmentObject(stationVM)
                .environmentObject(policyVM)
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
                .tag(4)
        }
        .accentColor(.green)
        .task {
            await stationVM.fetchStations()
            await policyVM.fetchPolicies()
            locationService.requestPermission()
        }
    }
}

// MARK: - Onboarding View
struct OnboardingView: View {
    @Binding var showOnboarding: Bool
    @State private var currentPage = 0
    
    var body: some View {
        VStack(spacing: 0) {
            TabView(selection: $currentPage) {
                OnboardingPage(
                    image: "🌍",
                    title: "Welcome to AirLens",
                    description: "Monitor global air quality in real-time"
                )
                .tag(0)
                
                OnboardingPage(
                    image: "📸",
                    title: "AI-Powered Analysis",
                    description: "Use your camera to predict PM2.5 levels instantly"
                )
                .tag(1)
                
                OnboardingPage(
                    image: "📍",
                    title: "Stay Informed",
                    description: "Get alerts about air quality in your area"
                )
                .tag(2)
            }
            .tabViewStyle(PageTabViewStyle())
            .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
            
            Button(action: {
                UserDefaults.standard.set(true, forKey: "hasSeenOnboarding")
                withAnimation {
                    showOnboarding = false
                }
            }) {
                Text(currentPage == 2 ? "Get Started" : "Skip")
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(
                        LinearGradient(
                            colors: [.green, .mint],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .cornerRadius(12)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
        .background(Color(.systemBackground))
    }
}

struct OnboardingPage: View {
    let image: String
    let title: String
    let description: String
    
    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            
            Text(image)
                .font(.system(size: 100))
                .padding()
            
            Text(title)
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text(description)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Spacer()
            Spacer()
        }
    }
}

// MARK: - Home View
struct HomeView: View {
    @EnvironmentObject var stationVM: StationViewModel
    @EnvironmentObject var locationService: LocationService
    @State private var selectedTimeRange = "Today"
    @State private var showDetailedStats = false
    
    let timeRanges = ["Today", "Week", "Month"]
    
    var nearestStation: Station? {
        guard let location = locationService.currentLocation else { return nil }
        return stationVM.stations.min { station1, station2 in
            let dist1 = distance(from: location, to: station1)
            let dist2 = distance(from: location, to: station2)
            return dist1 < dist2
        }
    }
    
    func distance(from: CLLocationCoordinate2D, to station: Station) -> Double {
        let lat1 = from.latitude
        let lon1 = from.longitude
        let lat2 = station.latitude
        let lon2 = station.longitude
        
        let dLat = (lat2 - lat1) * .pi / 180
        let dLon = (lon2 - lon1) * .pi / 180
        
        let a = sin(dLat/2) * sin(dLat/2) +
                cos(lat1 * .pi / 180) * cos(lat2 * .pi / 180) *
                sin(dLon/2) * sin(dLon/2)
        let c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return 6371 * c // Distance in km
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header Card
                    headerCard
                    
                    // Quick Stats
                    quickStatsView
                    
                    // Air Quality Chart
                    airQualityChart
                    
                    // Nearby Stations
                    nearbyStationsView
                    
                    // Health Tips
                    healthTipsCard
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("AirLens")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        Task {
                            await stationVM.fetchStations()
                        }
                    }) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
        }
    }
    
    var headerCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            if let station = nearestStation {
                HStack {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Your Location")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(station.name)
                            .font(.title2)
                            .fontWeight(.bold)
                        Text(station.country)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 8) {
                        ZStack {
                            Circle()
                                .fill(station.pm25Category.color.gradient)
                                .frame(width: 80, height: 80)
                            
                            VStack(spacing: 2) {
                                Text(String(format: "%.0f", station.pm25))
                                    .font(.title)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                Text("PM2.5")
                                    .font(.caption2)
                                    .foregroundColor(.white.opacity(0.8))
                            }
                        }
                        
                        Text(station.pm25Category.label)
                            .font(.caption)
                            .fontWeight(.semibold)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 4)
                            .background(station.pm25Category.color.opacity(0.2))
                            .foregroundColor(station.pm25Category.color)
                            .cornerRadius(8)
                    }
                }
                
                // Air Quality Indicator Bar
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(LinearGradient(
                                colors: [.green, .yellow, .orange, .red, .purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            ))
                            .frame(height: 8)
                        
                        Circle()
                            .fill(Color.white)
                            .frame(width: 16, height: 16)
                            .shadow(radius: 2)
                            .offset(x: min(max(0, CGFloat(station.pm25 / 200) * geometry.size.width - 8), geometry.size.width - 16))
                    }
                }
                .frame(height: 16)
            } else {
                HStack {
                    ProgressView()
                    Text("Locating nearest station...")
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 10)
    }
    
    var quickStatsView: some View {
        HStack(spacing: 12) {
            QuickStatCard(
                title: "Stations",
                value: "\(stationVM.stations.count)",
                icon: "mappin.circle.fill",
                color: .blue
            )
            
            QuickStatCard(
                title: "Avg PM2.5",
                value: String(format: "%.1f", stationVM.averagePM25),
                icon: "aqi.medium",
                color: .orange
            )
            
            QuickStatCard(
                title: "Safe Areas",
                value: "\(stationVM.safeStationsCount)",
                icon: "checkmark.shield.fill",
                color: .green
            )
        }
    }
    
    var airQualityChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Air Quality Trend")
                    .font(.headline)
                
                Spacer()
                
                Picker("Time Range", selection: $selectedTimeRange) {
                    ForEach(timeRanges, id: \.self) { range in
                        Text(range)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
                .frame(width: 180)
            }
            
            // Placeholder for chart
            RoundedRectangle(cornerRadius: 12)
                .fill(LinearGradient(
                    colors: [.green.opacity(0.3), .yellow.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))
                .frame(height: 200)
                .overlay(
                    Text("Chart will be displayed here")
                        .foregroundColor(.secondary)
                )
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    var nearbyStationsView: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Nearby Stations")
                    .font(.headline)
                
                Spacer()
                
                NavigationLink(destination: StationsListView().environmentObject(stationVM)) {
                    Text("See All")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
            
            ForEach(stationVM.stations.prefix(3)) { station in
                StationCard(station: station)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    var healthTipsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Health Tips")
                .font(.headline)
            
            if let station = nearestStation {
                ForEach(getHealthTips(for: station.pm25Category), id: \.self) { tip in
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: "info.circle.fill")
                            .foregroundColor(.blue)
                        Text(tip)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    func getHealthTips(for category: PM25Category) -> [String] {
        switch category {
        case .good:
            return [
                "Air quality is ideal for outdoor activities",
                "Great day for exercise and sports"
            ]
        case .moderate:
            return [
                "Unusually sensitive people should consider reducing outdoor exertion",
                "Most people can enjoy normal outdoor activities"
            ]
        case .unhealthy:
            return [
                "Limit prolonged outdoor exertion",
                "Keep windows closed to prevent outdoor air from getting inside"
            ]
        case .veryUnhealthy, .hazardous:
            return [
                "Avoid all outdoor exertion",
                "Everyone should remain indoors",
                "Consider using air purifiers"
            ]
        }
    }
}

// Helper Views
struct QuickStatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
}

struct StationCard: View {
    let station: Station
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(station.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(station.country)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            HStack(spacing: 8) {
                Circle()
                    .fill(station.pm25Category.color)
                    .frame(width: 8, height: 8)
                
                Text(String(format: "%.1f", station.pm25))
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                Text(station.pm25Category.label)
                    .font(.caption2)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(station.pm25Category.color.opacity(0.1))
                    .foregroundColor(station.pm25Category.color)
                    .cornerRadius(4)
            }
        }
        .padding(12)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(8)
    }
}

#Preview {
    ContentView()
}
