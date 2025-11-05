//
//  ProfileView.swift
//  Globe_fd
//
//  User Profile and Settings View
//  Created on 2025-11-05.
//

import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var stationVM: StationViewModel
    @EnvironmentObject var policyVM: PolicyViewModel
    @AppStorage("userName") private var userName = "User"
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true
    @AppStorage("autoRefresh") private var autoRefresh = true
    @AppStorage("refreshInterval") private var refreshInterval = 30
    @AppStorage("preferredUnits") private var preferredUnits = "μg/m³"
    
    @State private var showingEditProfile = false
    @State private var showingAbout = false
    @State private var showingExportData = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Header
                    profileHeader
                    
                    // Statistics Summary
                    statisticsSummary
                    
                    // Settings Sections
                    settingsSection
                    
                    // Data Management
                    dataManagementSection
                    
                    // About Section
                    aboutSection
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $showingEditProfile) {
                EditProfileView(userName: $userName)
            }
            .sheet(isPresented: $showingAbout) {
                AboutView()
            }
            .sheet(isPresented: $showingExportData) {
                ExportDataView()
            }
        }
    }
    
    // MARK: - Profile Header
    var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            ZStack {
                Circle()
                    .fill(LinearGradient(
                        colors: [.blue, .cyan],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
                    .frame(width: 100, height: 100)
                
                Text(userName.prefix(2).uppercased())
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }
            
            // User Info
            VStack(spacing: 8) {
                Text(userName)
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Air Quality Enthusiast")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            // Edit Button
            Button(action: { showingEditProfile = true }) {
                Text("Edit Profile")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 8)
                    .background(Color(.systemFill))
                    .cornerRadius(20)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    // MARK: - Statistics Summary
    var statisticsSummary: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Your Activity")
                .font(.headline)
            
            HStack(spacing: 12) {
                StatisticCard(
                    value: "127",
                    label: "Days Active",
                    icon: "calendar",
                    color: .blue
                )
                
                StatisticCard(
                    value: "45",
                    label: "Photos Analyzed",
                    icon: "camera.fill",
                    color: .green
                )
                
                StatisticCard(
                    value: "89%",
                    label: "Accuracy",
                    icon: "checkmark.circle.fill",
                    color: .orange
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    // MARK: - Settings Section
    var settingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Settings")
                .font(.headline)
            
            VStack(spacing: 0) {
                // Notifications
                SettingRow(
                    icon: "bell.fill",
                    title: "Notifications",
                    color: .red
                ) {
                    Toggle("", isOn: $notificationsEnabled)
                        .labelsHidden()
                }
                
                Divider()
                    .padding(.leading, 44)
                
                // Auto Refresh
                SettingRow(
                    icon: "arrow.clockwise",
                    title: "Auto Refresh",
                    color: .blue
                ) {
                    Toggle("", isOn: $autoRefresh)
                        .labelsHidden()
                }
                
                if autoRefresh {
                    Divider()
                        .padding(.leading, 44)
                    
                    // Refresh Interval
                    SettingRow(
                        icon: "timer",
                        title: "Refresh Interval",
                        color: .purple
                    ) {
                        Picker("", selection: $refreshInterval) {
                            Text("15 min").tag(15)
                            Text("30 min").tag(30)
                            Text("1 hour").tag(60)
                        }
                        .pickerStyle(MenuPickerStyle())
                        .labelsHidden()
                    }
                }
                
                Divider()
                    .padding(.leading, 44)
                
                // Units
                SettingRow(
                    icon: "ruler",
                    title: "Preferred Units",
                    color: .green
                ) {
                    Picker("", selection: $preferredUnits) {
                        Text("μg/m³").tag("μg/m³")
                        Text("AQI").tag("AQI")
                        Text("ppm").tag("ppm")
                    }
                    .pickerStyle(MenuPickerStyle())
                    .labelsHidden()
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    // MARK: - Data Management Section
    var dataManagementSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Data Management")
                .font(.headline)
            
            VStack(spacing: 0) {
                // Export Data
                Button(action: { showingExportData = true }) {
                    HStack {
                        Image(systemName: "square.and.arrow.up")
                            .foregroundColor(.blue)
                            .frame(width: 28)
                        
                        Text("Export Data")
                            .foregroundColor(.primary)
                        
                        Spacer()
                        
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 12)
                }
                
                Divider()
                    .padding(.leading, 44)
                
                // Clear Cache
                Button(action: clearCache) {
                    HStack {
                        Image(systemName: "trash")
                            .foregroundColor(.orange)
                            .frame(width: 28)
                        
                        Text("Clear Cache")
                            .foregroundColor(.primary)
                        
                        Spacer()
                        
                        Text("2.3 MB")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 12)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    // MARK: - About Section
    var aboutSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("About")
                .font(.headline)
            
            VStack(spacing: 0) {
                // Version
                HStack {
                    Image(systemName: "info.circle")
                        .foregroundColor(.gray)
                        .frame(width: 28)
                    
                    Text("Version")
                        .foregroundColor(.primary)
                    
                    Spacer()
                    
                    Text("1.0.0")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 12)
                
                Divider()
                    .padding(.leading, 44)
                
                // About
                Button(action: { showingAbout = true }) {
                    HStack {
                        Image(systemName: "questionmark.circle")
                            .foregroundColor(.blue)
                            .frame(width: 28)
                        
                        Text("About AirLens")
                            .foregroundColor(.primary)
                        
                        Spacer()
                        
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 12)
                }
                
                Divider()
                    .padding(.leading, 44)
                
                // Privacy Policy
                Link(destination: URL(string: "https://example.com/privacy")!) {
                    HStack {
                        Image(systemName: "hand.raised")
                            .foregroundColor(.green)
                            .frame(width: 28)
                        
                        Text("Privacy Policy")
                            .foregroundColor(.primary)
                        
                        Spacer()
                        
                        Image(systemName: "arrow.up.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 12)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
    
    // MARK: - Functions
    func clearCache() {
        // Implementation for clearing cache
        print("Cache cleared")
    }
}

// MARK: - Helper Views

struct StatisticCard: View {
    let value: String
    let label: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)
            
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
            
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}

struct SettingRow<Content: View>: View {
    let icon: String
    let title: String
    let color: Color
    let content: () -> Content
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 28)
            
            Text(title)
            
            Spacer()
            
            content()
        }
        .padding(.vertical, 12)
    }
}

// MARK: - Edit Profile View

struct EditProfileView: View {
    @Binding var userName: String
    @Environment(\.dismiss) var dismiss
    @State private var tempName: String = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Profile Information")) {
                    TextField("Name", text: $tempName)
                }
                
                Section(header: Text("Preferences")) {
                    HStack {
                        Text("Default Location")
                        Spacer()
                        Text("Current Location")
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Language")
                        Spacer()
                        Text("English")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        userName = tempName
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
        .onAppear {
            tempName = userName
        }
    }
}

// MARK: - About View

struct AboutView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // App Icon and Name
                    VStack(spacing: 16) {
                        Image(systemName: "camera.metering.multispot")
                            .font(.system(size: 80))
                            .foregroundColor(.blue)
                        
                        Text("AirLens")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Version 1.0.0")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    
                    // Description
                    VStack(alignment: .leading, spacing: 16) {
                        Text("About AirLens")
                            .font(.headline)
                        
                        Text("AirLens is an innovative air quality monitoring app that combines real-time global data with AI-powered camera analysis. Our mission is to help people make informed decisions about their health and environment.")
                            .font(.body)
                            .foregroundColor(.primary)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Features
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Features")
                            .font(.headline)
                        
                        FeatureRow(icon: "globe", title: "Global Coverage", description: "Monitor air quality worldwide")
                        FeatureRow(icon: "camera.fill", title: "AI Analysis", description: "Predict PM2.5 from photos")
                        FeatureRow(icon: "map.fill", title: "Interactive Maps", description: "Visualize pollution patterns")
                        FeatureRow(icon: "doc.text.fill", title: "Policy Tracking", description: "Stay updated on regulations")
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    
                    // Credits
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Credits")
                            .font(.headline)
                        
                        Text("Developed by the AirLens Team")
                            .font(.body)
                        
                        Text("Data sources: WAQI, EPA, Copernicus")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("About")
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

struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.blue)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

// MARK: - Export Data View

struct ExportDataView: View {
    @Environment(\.dismiss) var dismiss
    @State private var exportFormat = "CSV"
    @State private var dateRange = "Last 30 Days"
    @State private var includePhotos = false
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Export Options")) {
                    Picker("Format", selection: $exportFormat) {
                        Text("CSV").tag("CSV")
                        Text("JSON").tag("JSON")
                        Text("PDF Report").tag("PDF")
                    }
                    
                    Picker("Date Range", selection: $dateRange) {
                        Text("Last 7 Days").tag("Last 7 Days")
                        Text("Last 30 Days").tag("Last 30 Days")
                        Text("All Time").tag("All Time")
                    }
                    
                    Toggle("Include Photos", isOn: $includePhotos)
                }
                
                Section {
                    Button(action: exportData) {
                        HStack {
                            Spacer()
                            Text("Export Data")
                                .fontWeight(.semibold)
                            Spacer()
                        }
                    }
                    .foregroundColor(.white)
                    .listRowBackground(Color.blue)
                }
            }
            .navigationTitle("Export Data")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    func exportData() {
        // Implementation for data export
        print("Exporting data as \(exportFormat)")
        dismiss()
    }
}

// MARK: - Stations List View (for navigation)
struct StationsListView: View {
    @EnvironmentObject var viewModel: StationViewModel
    
    var body: some View {
        List(viewModel.stations) { station in
            StationRowView(station: station)
        }
        .navigationTitle("All Stations")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct StationRowView: View {
    let station: Station
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(station.name)
                    .font(.headline)
                Text(station.country)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text(String(format: "%.1f", station.pm25))
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(station.pm25Category.color)
                
                Text("μg/m³")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ProfileView()
        .environmentObject(StationViewModel())
        .environmentObject(PolicyViewModel())
}
