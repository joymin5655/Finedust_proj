//
//  GlobeView.swift
//  AirLens
//
//  3D Globe view for global air quality visualization
//

import SwiftUI
import MapKit

struct GlobeView: View {
    var onBack: () -> Void
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 20, longitude: 0),
        span: MKCoordinateSpan(latitudeDelta: 90, longitudeDelta: 180)
    )
    
    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                header
                
                // Map View (Placeholder for 3D Globe)
                Map(coordinateRegion: $region, annotationItems: mockStations) { station in
                    MapAnnotation(coordinate: station.coordinate) {
                        Circle()
                            .fill(colorForPM25(station.pm25))
                            .frame(width: 20, height: 20)
                            .overlay(
                                Circle()
                                    .stroke(Color.white, lineWidth: 2)
                            )
                    }
                }
                .ignoresSafeArea(edges: .bottom)
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
            
            Text("Global AQI Explorer")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            Spacer()
        }
        .padding()
    }
    
    private func colorForPM25(_ pm25: Double) -> Color {
        let level = AQILevel.from(pm25: pm25)
        switch level {
        case .good: return Color(hex: "#30d158")
        case .moderate: return Color(hex: "#ffd60a")
        case .unhealthyForSensitive: return Color(hex: "#ff9f0a")
        case .unhealthy: return Color(hex: "#ff453a")
        case .veryUnhealthy: return Color(hex: "#bf5af2")
        case .hazardous: return Color(hex: "#8b0000")
        }
    }
    
    private var mockStations: [MonitoringStation] {
        [
            MonitoringStation(name: "Washington D.C.", country: "USA", latitude: 38.9, longitude: -77.0, pm25: Double.random(in: 10...50)),
            MonitoringStation(name: "Seoul", country: "South Korea", latitude: 37.5, longitude: 127.0, pm25: Double.random(in: 20...80)),
            MonitoringStation(name: "Tokyo", country: "Japan", latitude: 35.7, longitude: 139.7, pm25: Double.random(in: 15...45)),
            MonitoringStation(name: "London", country: "UK", latitude: 51.50, longitude: -0.12, pm25: Double.random(in: 10...40)),
            MonitoringStation(name: "Beijing", country: "China", latitude: 39.9, longitude: 116.4, pm25: Double.random(in: 40...120))
        ]
    }
}

#Preview {
    GlobeView(onBack: {})
}
