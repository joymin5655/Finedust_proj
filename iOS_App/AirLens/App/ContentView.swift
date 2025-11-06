//
//  ContentView.swift
//  AirLens
//
//  Main app content with tab navigation
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var stationViewModel: StationViewModel
    @EnvironmentObject var locationService: LocationService

    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Globe Tab
            GlobeView()
                .tabItem {
                    Label("Globe", systemImage: "globe.americas.fill")
                }
                .tag(0)

            // Camera Tab
            CameraView()
                .tabItem {
                    Label("Scan", systemImage: "camera.fill")
                }
                .tag(1)

            // Stations Tab
            StationsListView()
                .tabItem {
                    Label("Stations", systemImage: "antenna.radiowaves.left.and.right")
                }
                .tag(2)

            // Settings Tab
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
                .tag(3)
        }
        .accentColor(.cyan)
    }
}

// Stations list view
struct StationsListView: View {
    @EnvironmentObject var stationViewModel: StationViewModel
    @EnvironmentObject var locationService: LocationService

    @State private var searchText = ""
    @State private var selectedCountry: String?
    @State private var showingNearby = false

    var body: some View {
        NavigationView {
            ZStack {
                // Background
                LinearGradient(
                    colors: [Color(hex: "#0f172a"), Color(hex: "#1e293b")],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        // Header with station count
                        if !stationViewModel.stations.isEmpty {
                            HeaderCard(
                                title: "Air Quality Stations",
                                subtitle: "\(stationViewModel.stations.count) stations worldwide"
                            )
                        }

                        // Nearby stations button
                        if locationService.location != nil {
                            Button(action: {
                                Task {
                                    if let coords = locationService.getCoordinates() {
                                        await stationViewModel.fetchNearbyStations(
                                            latitude: coords.latitude,
                                            longitude: coords.longitude
                                        )
                                        showingNearby = true
                                    }
                                }
                            }) {
                                HStack {
                                    Image(systemName: "location.fill")
                                    Text("Find Nearby Stations")
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                }
                                .foregroundColor(.cyan)
                                .padding()
                                .background(Color.cyan.opacity(0.1))
                                .cornerRadius(12)
                            }
                            .padding(.horizontal)
                        }

                        // Stations list
                        if stationViewModel.isLoading {
                            LoadingView()
                        } else if filteredStations.isEmpty {
                            EmptyStateView()
                        } else {
                            LazyVStack(spacing: 16) {
                                ForEach(filteredStations) { station in
                                    NavigationLink(destination: StationDetailView(station: station)) {
                                        StationCardView(station: station)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                    .padding(.vertical)
                }
            }
            .navigationTitle("Stations")
            .navigationBarTitleDisplayMode(.large)
            .searchable(text: $searchText, prompt: "Search stations")
            .refreshable {
                await stationViewModel.refresh()
            }
        }
        .sheet(isPresented: $showingNearby) {
            NearbyStationsSheet(stations: stationViewModel.nearbyStations)
        }
    }

    private var filteredStations: [Station] {
        if searchText.isEmpty {
            return stationViewModel.stations
        } else {
            return stationViewModel.filterStations(by: searchText)
        }
    }
}

struct HeaderCard: View {
    let title: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)

            Text(subtitle)
                .font(.subheadline)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

struct LoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
                .tint(.cyan)

            Text("Loading stations...")
                .foregroundColor(.gray)
        }
        .padding(.top, 100)
    }
}

struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "antenna.radiowaves.left.and.right.slash")
                .font(.system(size: 60))
                .foregroundColor(.gray)

            Text("No Stations Found")
                .font(.title3)
                .foregroundColor(.white)

            Text("Try adjusting your search or refresh to load stations")
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .padding()
        .padding(.top, 100)
    }
}

// Station detail view
struct StationDetailView: View {
    let station: Station
    @EnvironmentObject var locationService: LocationService

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Header
                VStack(alignment: .leading, spacing: 12) {
                    Text(station.name)
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.white)

                    HStack {
                        Image(systemName: "location.fill")
                            .foregroundColor(.cyan)

                        Text("\(station.city), \(station.country)")
                            .foregroundColor(.gray)
                    }

                    if let distance = calculateDistance() {
                        HStack {
                            Image(systemName: "arrow.left.and.right")
                                .foregroundColor(.cyan)

                            Text("\(distance.formatted(decimalPlaces: 1)) km away")
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white.opacity(0.05))
                .cornerRadius(12)

                // Air quality metrics
                VStack(alignment: .leading, spacing: 16) {
                    Text("Air Quality Metrics")
                        .font(.headline)
                        .foregroundColor(.white)

                    HStack(spacing: 16) {
                        MetricCard(
                            label: "AQI",
                            value: "\(station.aqi)",
                            description: station.aqiLevel.description,
                            color: Color.from(aqiLevel: station.aqiLevel)
                        )

                        MetricCard(
                            label: "PM2.5",
                            value: station.pm25.formatted(decimalPlaces: 1),
                            description: station.pm25Level.description,
                            color: Color.from(pm25Level: station.pm25Level)
                        )
                    }

                    MetricCard(
                        label: "PM10",
                        value: station.pm10.formatted(decimalPlaces: 1),
                        description: "Particulate Matter 10",
                        color: .blue,
                        fullWidth: true
                    )
                }
                .padding(.horizontal)

                // Additional info
                VStack(alignment: .leading, spacing: 12) {
                    Text("Additional Information")
                        .font(.headline)
                        .foregroundColor(.white)

                    InfoRow(label: "Source", value: station.source)
                    InfoRow(label: "Last Update", value: formatDate(station.lastUpdate))
                    if let pollutant = station.dominantPollutant {
                        InfoRow(label: "Dominant Pollutant", value: pollutant)
                    }
                    InfoRow(label: "Coordinates", value: "\(station.latitude.formatted(decimalPlaces: 4)), \(station.longitude.formatted(decimalPlaces: 4))")
                }
                .padding()
                .background(Color.white.opacity(0.05))
                .cornerRadius(12)
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(
            LinearGradient(
                colors: [Color(hex: "#0f172a"), Color(hex: "#1e293b")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
        .navigationBarTitleDisplayMode(.inline)
    }

    private func calculateDistance() -> Double? {
        guard let userLocation = locationService.location?.coordinate else {
            return nil
        }

        return locationService.distance(from: userLocation, to: station.coordinate)
    }

    private func formatDate(_ dateString: String) -> String {
        if let date = dateString.toDate() {
            return date.timeAgo()
        }
        return dateString
    }
}

struct MetricCard: View {
    let label: String
    let value: String
    let description: String
    let color: Color
    var fullWidth: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)

            Text(value)
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(color)

            Text(description)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding()
        .frame(maxWidth: fullWidth ? .infinity : nil, alignment: .leading)
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
    }
}

struct InfoRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundColor(.gray)

            Spacer()

            Text(value)
                .font(.subheadline)
                .foregroundColor(.white)
        }
    }
}

struct NearbyStationsSheet: View {
    let stations: [Station]
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 16) {
                    ForEach(stations) { station in
                        StationCardView(station: station)
                    }
                }
                .padding()
            }
            .background(
                LinearGradient(
                    colors: [Color(hex: "#0f172a"), Color(hex: "#1e293b")],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
            .navigationTitle("Nearby Stations")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(StationViewModel())
        .environmentObject(PolicyViewModel())
        .environmentObject(CameraViewModel())
        .environmentObject(GlobeViewModel())
        .environmentObject(LocationService.shared)
}
