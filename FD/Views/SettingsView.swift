//
//  SettingsView.swift
//  AirLens
//
//  Settings and configuration view
//  Updated for native ML model
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
                        // ML Model Info Section
                        settingsCard(title: "Prediction Model") {
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    Circle()
                                        .fill(Color.green)
                                        .frame(width: 8, height: 8)
                                    
                                    Text("Native ML Model Active")
                                        .font(.subheadline)
                                        .foregroundColor(.white)
                                }
                                
                                Text("Using on-device computer vision analysis")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                
                                Divider()
                                    .background(Color.white.opacity(0.2))
                                
                                modelFeatureRow(
                                    icon: "cpu",
                                    title: "Processing",
                                    value: "100% On-Device"
                                )
                                
                                modelFeatureRow(
                                    icon: "wifi.slash",
                                    title: "Internet",
                                    value: "Not Required"
                                )
                                
                                modelFeatureRow(
                                    icon: "lock.shield",
                                    title: "Privacy",
                                    value: "Full Privacy"
                                )
                                
                                modelFeatureRow(
                                    icon: "bolt.fill",
                                    title: "Speed",
                                    value: "Instant Analysis"
                                )
                            }
                        }
                        
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
                        
                        // Analysis Features Section
                        settingsCard(title: "Analysis Features") {
                            VStack(alignment: .leading, spacing: 12) {
                                analysisFeatureRow(
                                    name: "Image Brightness",
                                    description: "Measures overall sky luminosity"
                                )
                                analysisFeatureRow(
                                    name: "Color Saturation",
                                    description: "Analyzes color intensity and purity"
                                )
                                analysisFeatureRow(
                                    name: "Blue Sky Ratio",
                                    description: "Detects clear blue sky conditions"
                                )
                                analysisFeatureRow(
                                    name: "Contrast Analysis",
                                    description: "Evaluates visibility clarity"
                                )
                                analysisFeatureRow(
                                    name: "Haze Detection",
                                    description: "Identifies atmospheric haze levels"
                                )
                                analysisFeatureRow(
                                    name: "Colorfulness",
                                    description: "Measures color diversity in sky"
                                )
                            }
                        }
                        
                        // Data Sources Section
                        settingsCard(title: "Data Sources") {
                            VStack(alignment: .leading, spacing: 12) {
                                dataSourceRow(
                                    name: "Camera Analysis",
                                    description: "Real-time image-based PM2.5 estimation using computer vision."
                                )
                                dataSourceRow(
                                    name: "Station Data (Simulated)",
                                    description: "Nearby monitoring station data simulation."
                                )
                                dataSourceRow(
                                    name: "Satellite Data (Simulated)",
                                    description: "Atmospheric optical depth simulation."
                                )
                            }
                        }
                        
                        // About Section
                        settingsCard(title: "About") {
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    Text("Version")
                                        .foregroundColor(.white)
                                    Spacer()
                                    Text("2.0.0")
                                        .foregroundColor(.gray)
                                }
                                
                                HStack {
                                    Text("Build")
                                        .foregroundColor(.white)
                                    Spacer()
                                    Text("Native ML")
                                        .foregroundColor(.gray)
                                }
                                
                                HStack {
                                    Text("Model")
                                        .foregroundColor(.white)
                                    Spacer()
                                    Text("Computer Vision")
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
    
    private func modelFeatureRow(icon: String, title: String, value: String) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .frame(width: 20)
            
            Text(title)
                .font(.subheadline)
                .foregroundColor(.white)
            
            Spacer()
            
            Text(value)
                .font(.caption)
                .foregroundColor(.gray)
        }
    }
    
    private func analysisFeatureRow(name: String, description: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
                    .font(.caption)
                
                Text(name)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
            }
            
            Text(description)
                .font(.caption)
                .foregroundColor(.gray)
                .padding(.leading, 20)
        }
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
