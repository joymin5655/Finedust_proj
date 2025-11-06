//
//  StationCardView.swift
//  AirLens
//
//  Reusable card component for displaying station information
//

import SwiftUI

struct StationCardView: View {
    let station: Station

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(station.name)
                        .font(.headline)
                        .foregroundColor(.primary)

                    Text("\(station.city), \(station.country)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                Spacer()

                // AQI Badge
                AQIBadge(aqi: station.aqi)
            }

            Divider()

            // Pollutant measurements
            HStack(spacing: 20) {
                PollutantMeasurement(
                    label: "PM2.5",
                    value: station.pm25,
                    unit: "μg/m³",
                    level: station.pm25Level
                )

                Divider()
                    .frame(height: 40)

                PollutantMeasurement(
                    label: "PM10",
                    value: station.pm10,
                    unit: "μg/m³",
                    level: .moderate // Simplified for PM10
                )
            }

            // Footer
            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                        .font(.caption2)
                    Text("Updated \(formatDate(station.lastUpdate))")
                        .font(.caption2)
                }
                .foregroundColor(.secondary)

                Spacer()

                Text(station.source)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }

    private func formatDate(_ dateString: String) -> String {
        if let date = dateString.toDate() {
            return date.timeAgo()
        }
        return "recently"
    }
}

struct AQIBadge: View {
    let aqi: Int

    var body: some View {
        let level = AQILevel.from(aqi: aqi)

        VStack(spacing: 4) {
            Text("\(aqi)")
                .font(.title2)
                .fontWeight(.bold)

            Text("AQI")
                .font(.caption2)
        }
        .foregroundColor(.white)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.from(aqiLevel: level))
        .cornerRadius(10)
    }
}

struct PollutantMeasurement: View {
    let label: String
    let value: Double
    let unit: String
    let level: PM25Level

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)

            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(value.formatted(decimalPlaces: 1))
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundColor(Color.from(pm25Level: level))

                Text(unit)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Text(level.description)
                .font(.caption2)
                .foregroundColor(Color.from(pm25Level: level))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

#Preview {
    StationCardView(
        station: Station(
            id: "1",
            name: "Seoul City Hall",
            country: "South Korea",
            city: "Seoul",
            latitude: 37.5665,
            longitude: 126.9780,
            pm25: 35.5,
            pm10: 52.0,
            aqi: 95,
            lastUpdate: "2024-11-06T10:30:00",
            source: "WAQI",
            dominantPollutant: "PM2.5"
        )
    )
    .padding()
}
