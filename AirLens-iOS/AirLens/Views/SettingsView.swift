//
//  SettingsView.swift
//  AirLens
//
//  Settings and configuration view
//

import SwiftUI

struct SettingsView: View {
    var onBack: () -> Void
    @Binding var isDarkMode: Bool
    @State private var selectedLanguage = "English"
    
    let languages = ["English", "한국어"]
    
    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                header
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Appearance Section
                        settingsCard(title: "Appearance") {
                            VStack(spacing: 16) {
                                // Language Picker
                                HStack {
                                    Text("Language")
                                        .foregroundColor(.white)
                                    Spacer()
                                    Picker("Language", selection: $selectedLanguage) {
                                        ForEach(languages, id: \.self) { language in
                                            Text(language).tag(language)
                                        }
                                    }
                                    .pickerStyle(MenuPickerStyle())
                                }
                                
                                // Dark Mode Toggle
                                HStack {
                                    Text("Dark Mode")
                                        .foregroundColor(.white)
                                    Spacer()
                                    Toggle("", isOn: $isDarkMode)
                                        .labelsHidden()
                                }
                            }
                        }
                        
                        // Data Sources Section
                        settingsCard(title: "Data Sources") {
                            VStack(alignment: .leading, spacing: 12) {
                                dataSourceRow(name: "WAQI API", description: "Primary source for 500k+ ground monitoring stations.")
                                dataSourceRow(name: "IQAir API", description: "Secondary source for verified station data.")
                                dataSourceRow(name: "NOAA GFS", description: "Provides global wind and weather forecast data.")
                                dataSourceRow(name: "NASA FIRMS", description: "Real-time global wildfire tracking.")
                                dataSourceRow(name: "Sentinel-5P", description: "Satellite data for Aerosol Optical Depth (AOD).")
                            }
                        }
                        
                        // About Section
                        settingsCard(title: "About") {
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    Text("Version")
                                        .foregroundColor(.white)
                                    Spacer()
                                    Text("1.0.0")
                                        .foregroundColor(.gray)
                                }
                                
                                HStack {
                                    Text("Build")
                                        .foregroundColor(.white)
                                    Spacer()
                                    Text("2025.01")
                                        .foregroundColor(.gray)
                                }
                            }
                        }
                    }
                    .padding()
                }
            }
        }
    }
    
    private var header: some View {
        HStack {
            Button(action: onBack) {
                Image(systemName: "chevron.left")
                    .font(.title3)
                    .foregroundColor(.white)
                    .frame(width: 44, height: 44)
                    .background(Color.white.opacity(0.2))
                    .clipShape(Circle())
            }
            
            Text("Settings")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            Spacer()
        }
        .padding()
    }
    
    private func settingsCard<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundColor(.white)
            
            content()
        }
        .padding()
        .background(Color.white.opacity(0.1))
        .cornerRadius(12)
    }
    
    private func dataSourceRow(name: String, description: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(name)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.white)
            Text(description)
                .font(.caption)
                .foregroundColor(.gray)
        }
    }
}

#Preview {
    SettingsView(
        onBack: {},
        isDarkMode: .constant(true)
    )
}
