//
//  MapView.swift
//  Globe_fd
//
//  Interactive Map View with Station Markers
//  Created on 2025-11-05.
//

import SwiftUI
import MapKit

// MARK: - Map View
struct MapView: View {
    @EnvironmentObject var stationVM: StationViewModel
    @EnvironmentObject var locationService: LocationService
    
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 37.5665, longitude: 126.9780),
        span: MKCoordinateSpan(latitudeDelta: 10, longitudeDelta: 10)
    )
    
    @State private var selectedStation: Station?
    @State private var showingFilters = false
    @State private var selectedCategory: PM25Category?
    @State private var searchText = ""
    
    var filteredStations: [Station] {
        var stations = stationVM.stations
        
        if let category = selectedCategory {
            stations = stations.filter { $0.pm25Category == category }
        }
        
        if !searchText.isEmpty {
            stations = stations.filter {
                $0.name.lowercased().contains(searchText.lowercased()) ||
                $0.country.lowercased().contains(searchText.lowercased())
            }
        }
        
        return stations
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                // Map
                Map(coordinateRegion: $region, annotationItems: filteredStations) { station in
                    MapAnnotation(coordinate: CLLocationCoordinate2D(
                        latitude: station.latitude,
                        longitude: station.longitude
                    )) {
                        StationMapMarker(station: station, isSelected: selectedStation?.id == station.id)
                            .onTapGesture {
                                withAnimation(.spring()) {
                                    selectedStation = station
                                    region.center = CLLocationCoordinate2D(
                                        latitude: station.latitude,
                                        longitude: station.longitude
                                    )
                                    region.span = MKCoordinateSpan(
                                        latitudeDelta: 0.5,
                                        longitudeDelta: 0.5
                                    )
                                }
                            }
                    }
                }
                .ignoresSafeArea()
                
                // Controls Overlay
                VStack {
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.secondary)
                        
                        TextField("Search stations...", text: $searchText)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        
                        if !searchText.isEmpty {
                            Button(action: { searchText = "" }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground).opacity(0.95))
                    .cornerRadius(12)
                    .shadow(radius: 5)
                    .padding()
                    
                    // Category Filter Pills
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            FilterChip(
                                title: "All",
                                isSelected: selectedCategory == nil,
                                color: .gray
                            ) {
                                selectedCategory = nil
                            }
                            
                            FilterChip(
                                title: "Good",
                                isSelected: selectedCategory == .good,
                                color: .green
                            ) {
                                selectedCategory = .good
                            }
                            
                            FilterChip(
                                title: "Moderate",
                                isSelected: selectedCategory == .moderate,
                                color: .yellow
                            ) {
                                selectedCategory = .moderate
                            }
                            
                            FilterChip(
                                title: "Unhealthy",
                                isSelected: selectedCategory == .unhealthy,
                                color: .orange
                            ) {
                                selectedCategory = .unhealthy
                            }
                            
                            FilterChip(
                                title: "Very Unhealthy",
                                isSelected: selectedCategory == .veryUnhealthy,
                                color: .red
                            ) {
                                selectedCategory = .veryUnhealthy
                            }
                            
                            FilterChip(
                                title: "Hazardous",
                                isSelected: selectedCategory == .hazardous,
                                color: .purple
                            ) {
                                selectedCategory = .hazardous
                            }
                        }
                        .padding(.horizontal)
                    }
                    
                    Spacer()
                    
                    // Selected Station Card
                    if let station = selectedStation {
                        StationDetailCard(station: station) {
                            withAnimation {
                                selectedStation = nil
                            }
                        }
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                    }
                    
                    // Map Controls
                    HStack {
                        // Current Location Button
                        Button(action: {
                            if let location = locationService.currentLocation {
                                withAnimation {
                                    region.center = location
                                    region.span = MKCoordinateSpan(
                                        latitudeDelta: 1,
                                        longitudeDelta: 1
                                    )
                                }
                            }
                        }) {
                            Image(systemName: "location.fill")
                                .font(.title2)
                                .frame(width: 44, height: 44)
                                .background(Color(.systemBackground))
                                .clipShape(Circle())
                                .shadow(radius: 3)
                        }
                        
                        Spacer()
                        
                        // Refresh Button
                        Button(action: {
                            Task {
                                await stationVM.fetchStations()
                            }
                        }) {
                            Image(systemName: "arrow.clockwise")
                                .font(.title2)
                                .frame(width: 44, height: 44)
                                .background(Color(.systemBackground))
                                .clipShape(Circle())
                                .shadow(radius: 3)
                        }
                    }
                    .padding()
                }
            }
            .navigationBarHidden(true)
        }
    }
}

// MARK: - Station Map Marker
struct StationMapMarker: View {
    let station: Station
    let isSelected: Bool
    
    var body: some View {
        ZStack {
            Circle()
                .fill(station.pm25Category.color)
                .frame(width: isSelected ? 40 : 30, height: isSelected ? 40 : 30)
                .overlay(
                    Circle()
                        .stroke(Color.white, lineWidth: 2)
                )
                .shadow(radius: 3)
            
            Text(String(format: "%.0f", station.pm25))
                .font(.system(size: isSelected ? 14 : 11, weight: .bold))
                .foregroundColor(.white)
        }
        .scaleEffect(isSelected ? 1.2 : 1.0)
        .animation(.spring(), value: isSelected)
    }
}

// MARK: - Station Detail Card
struct StationDetailCard: View {
    let station: Station
    let onClose: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(station.name)
                        .font(.headline)
                    Text(station.country)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Button(action: onClose) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                }
            }
            
            HStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 8) {
                    Label("PM2.5", systemImage: "aqi.medium")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack(alignment: .bottom, spacing: 4) {
                        Text(String(format: "%.1f", station.pm25))
                            .font(.title2)
                            .fontWeight(.bold)
                        Text("μg/m³")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Text(station.pm25Category.label)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(station.pm25Category.color.opacity(0.2))
                        .foregroundColor(station.pm25Category.color)
                        .cornerRadius(6)
                }
                
                if let pm10 = station.pm10 {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("PM10", systemImage: "aqi.high")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        HStack(alignment: .bottom, spacing: 4) {
                            Text(String(format: "%.1f", pm10))
                                .font(.title2)
                                .fontWeight(.bold)
                            Text("μg/m³")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Spacer()
                
                // Visual Indicator
                ZStack {
                    Circle()
                        .fill(station.pm25Category.color.gradient)
                        .frame(width: 60, height: 60)
                    
                    Image(systemName: getAQIIcon(for: station.pm25Category))
                        .font(.title)
                        .foregroundColor(.white)
                }
            }
            
            HStack {
                Label(station.source, systemImage: "antenna.radiowaves.left.and.right")
                Spacer()
                Text("Updated: \(formatDate(station.lastUpdated))")
            }
            .font(.caption2)
            .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(radius: 10)
        .padding()
    }
    
    func getAQIIcon(for category: PM25Category) -> String {
        switch category {
        case .good:
            return "checkmark.circle"
        case .moderate:
            return "exclamationmark.circle"
        case .unhealthy:
            return "exclamationmark.triangle"
        case .veryUnhealthy:
            return "exclamationmark.octagon"
        case .hazardous:
            return "xmark.octagon"
        }
    }
    
    func formatDate(_ date: Date) -> String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}

// MARK: - Filter Chip
struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? color : Color(.systemBackground))
                .foregroundColor(isSelected ? .white : .primary)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(color, lineWidth: 1)
                )
                .cornerRadius(8)
        }
    }
}

#Preview {
    MapView()
        .environmentObject(StationViewModel())
        .environmentObject(LocationService.shared)
}
