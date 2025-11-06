//
//  SettingsView.swift
//  AirLens
//
//  Settings and statistics view
//

import SwiftUI
import Charts

struct SettingsView: View {
    @EnvironmentObject var stationViewModel: StationViewModel

    @AppStorage("selectedLanguage") private var selectedLanguage = "en"
    @AppStorage("isDarkMode") private var isDarkMode = true
    @State private var showingAbout = false

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
                    VStack(spacing: 24) {
                        // App Settings
                        SettingsSection(title: "App Settings") {
                            VStack(spacing: 0) {
                                SettingsRow(
                                    icon: "moon.fill",
                                    title: "Dark Mode",
                                    color: .indigo
                                ) {
                                    Toggle("", isOn: $isDarkMode)
                                        .labelsHidden()
                                }

                                Divider()
                                    .padding(.leading, 50)

                                SettingsRow(
                                    icon: "globe",
                                    title: "Language",
                                    color: .blue
                                ) {
                                    Picker("Language", selection: $selectedLanguage) {
                                        ForEach(AppConstants.Language.allCases, id: \.rawValue) { language in
                                            Text("\(language.flag) \(language.displayName)")
                                                .tag(language.rawValue)
                                        }
                                    }
                                    .pickerStyle(.menu)
                                }
                            }
                        }

                        // Statistics
                        if let stats = stationViewModel.statistics {
                            StatisticsSection(statistics: stats)
                        }

                        // Model Performance
                        ModelPerformanceSection()

                        // Data Sources
                        DataSourcesSection()

                        // About
                        SettingsSection(title: "About") {
                            VStack(spacing: 0) {
                                SettingsRow(
                                    icon: "info.circle.fill",
                                    title: "Version",
                                    color: .gray
                                ) {
                                    Text(AppConstants.appVersion)
                                        .foregroundColor(.gray)
                                }

                                Divider()
                                    .padding(.leading, 50)

                                Button(action: { showingAbout = true }) {
                                    SettingsRow(
                                        icon: "doc.text.fill",
                                        title: "About AirLens",
                                        color: .purple
                                    ) {
                                        Image(systemName: "chevron.right")
                                            .foregroundColor(.gray)
                                    }
                                }
                            }
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $showingAbout) {
                AboutView()
            }
        }
        .task {
            if stationViewModel.statistics == nil {
                await stationViewModel.fetchStatistics()
            }
        }
    }
}

struct SettingsSection<Content: View>: View {
    let title: String
    let content: Content

    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundColor(.white)
                .padding(.leading, 4)

            content
                .background(Color.white.opacity(0.1))
                .cornerRadius(12)
        }
    }
}

struct SettingsRow<Content: View>: View {
    let icon: String
    let title: String
    let color: Color
    let trailing: Content

    init(icon: String, title: String, color: Color, @ViewBuilder trailing: () -> Content) {
        self.icon = icon
        self.title = title
        self.color = color
        self.trailing = trailing()
    }

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 24)

            Text(title)
                .foregroundColor(.white)

            Spacer()

            trailing
        }
        .padding()
    }
}

struct StatisticsSection: View {
    let statistics: Statistics

    var body: some View {
        SettingsSection(title: "Statistics") {
            VStack(spacing: 16) {
                HStack(spacing: 16) {
                    StatCard(
                        title: "Total Stations",
                        value: "\(statistics.totalStations)",
                        icon: "antenna.radiowaves.left.and.right",
                        color: .cyan
                    )

                    StatCard(
                        title: "Countries",
                        value: "\(statistics.countriesCount)",
                        icon: "globe.americas.fill",
                        color: .green
                    )
                }

                HStack(spacing: 16) {
                    StatCard(
                        title: "Avg PM2.5",
                        value: statistics.averagePM25.formatted(decimalPlaces: 1),
                        icon: "cloud.fill",
                        color: .orange
                    )

                    StatCard(
                        title: "Updated",
                        value: "Today",
                        icon: "clock.fill",
                        color: .purple
                    )
                }
            }
            .padding()
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
            }

            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)

            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
    }
}

struct ModelPerformanceSection: View {
    let performanceData = ModelPerformance.mockData

    var body: some View {
        SettingsSection(title: "Model Performance") {
            VStack(alignment: .leading, spacing: 20) {
                // Inference Latency Chart
                VStack(alignment: .leading, spacing: 8) {
                    Text("Inference Latency (ms)")
                        .font(.subheadline)
                        .foregroundColor(.white)

                    Chart(performanceData) { item in
                        LineMark(
                            x: .value("Device", item.deviceModel),
                            y: .value("Latency", item.inferenceLatency)
                        )
                        .foregroundStyle(.cyan)

                        PointMark(
                            x: .value("Device", item.deviceModel),
                            y: .value("Latency", item.inferenceLatency)
                        )
                        .foregroundStyle(.cyan)
                    }
                    .frame(height: 150)
                    .chartXAxis {
                        AxisMarks { _ in
                            AxisValueLabel()
                                .foregroundStyle(.white)
                        }
                    }
                    .chartYAxis {
                        AxisMarks { _ in
                            AxisValueLabel()
                                .foregroundStyle(.white)
                        }
                    }
                }

                Divider()
                    .background(Color.white.opacity(0.2))

                // RMSE Chart
                VStack(alignment: .leading, spacing: 8) {
                    Text("Prediction Accuracy (RMSE)")
                        .font(.subheadline)
                        .foregroundColor(.white)

                    Chart(performanceData) { item in
                        BarMark(
                            x: .value("Device", item.deviceModel),
                            y: .value("RMSE", item.rmse)
                        )
                        .foregroundStyle(.green)
                    }
                    .frame(height: 150)
                    .chartXAxis {
                        AxisMarks { _ in
                            AxisValueLabel()
                                .foregroundStyle(.white)
                        }
                    }
                    .chartYAxis {
                        AxisMarks { _ in
                            AxisValueLabel()
                                .foregroundStyle(.white)
                        }
                    }
                }
            }
            .padding()
        }
    }
}

struct DataSourcesSection: View {
    let dataSources = DataSource.sources

    var body: some View {
        SettingsSection(title: "Data Sources") {
            VStack(spacing: 12) {
                ForEach(dataSources) { source in
                    DataSourceRow(source: source)

                    if source.id != dataSources.last?.id {
                        Divider()
                            .padding(.leading, 16)
                    }
                }
            }
            .padding()
        }
    }
}

struct DataSourceRow: View {
    let source: DataSource

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(source.name)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)

                Spacer()

                Text(source.coverage)
                    .font(.caption)
                    .foregroundColor(.cyan)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.cyan.opacity(0.2))
                    .cornerRadius(8)
            }

            Text(source.description)
                .font(.caption)
                .foregroundColor(.gray)

            if let url = URL(string: source.url) {
                Link(destination: url) {
                    HStack(spacing: 4) {
                        Text(source.url)
                            .font(.caption2)
                        Image(systemName: "arrow.up.right")
                            .font(.caption2)
                    }
                    .foregroundColor(.blue)
                }
            }
        }
    }
}

struct AboutView: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(spacing: 16) {
                        Image(systemName: "camera.metering.matrix")
                            .font(.system(size: 60))
                            .foregroundColor(.cyan)

                        Text("AirLens")
                            .font(.title)
                            .fontWeight(.bold)

                        Text("Version \(AppConstants.appVersion)")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 40)

                    VStack(alignment: .leading, spacing: 16) {
                        Text("About")
                            .font(.headline)

                        Text("AirLens is an AI-powered air quality monitoring application that uses computer vision to predict PM2.5 levels from sky images.")
                            .foregroundColor(.secondary)

                        Text("Features")
                            .font(.headline)
                            .padding(.top, 8)

                        FeatureItem(icon: "camera.fill", text: "AI-powered PM2.5 prediction from images")
                        FeatureItem(icon: "globe.americas.fill", text: "Global air quality monitoring stations")
                        FeatureItem(icon: "doc.text.fill", text: "Environmental policy tracking")
                        FeatureItem(icon: "chart.line.uptrend.xyaxis", text: "Real-time statistics and analytics")
                    }
                    .padding(.horizontal)

                    Spacer()
                }
            }
            .navigationTitle("About AirLens")
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

struct FeatureItem: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.cyan)
                .frame(width: 24)

            Text(text)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(StationViewModel())
}
