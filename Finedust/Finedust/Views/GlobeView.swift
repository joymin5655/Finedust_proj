//
//  GlobeView.swift
//  Finedust
//
//  3D Globe view inspired by react-globe.gl
//  Reference: https://github.com/vasturiano/react-globe.gl
//

import SwiftUI
import MapKit

struct GlobeView: View {
    var onBack: () -> Void
    
    @State private var rotation: Double = 0
    @State private var cloudRotation: Double = 0
    @State private var atmospherePulse: Double = 0.8
    @State private var selectedStation: MonitoringStation?
    
    var body: some View {
        ZStack {
            // Night sky background with stars
            nightSkyBackground
            
            VStack(spacing: 0) {
                // Header
                header
                
                Spacer()
                
                // 3D Globe Container
                globe3DView
                
                Spacer()
                
                // Station Info Panel
                if let station = selectedStation {
                    stationInfoPanel(station)
                }
            }
        }
    }
    
    // MARK: - Night Sky Background
    private var nightSkyBackground: some View {
        ZStack {
            // Deep space gradient
            LinearGradient(
                colors: [
                    Color(hex: "#0a0e27"),
                    Color(hex: "#1a1a2e"),
                    Color.black
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            // Stars
            ForEach(0..<100) { i in
                let size: CGFloat = CGFloat.random(in: 1...3)
                let opacity: Double = Double.random(in: 0.3...0.9)
                let xPos: CGFloat = CGFloat.random(in: 0...400)
                let yPos: CGFloat = CGFloat.random(in: 0...800)
                
                Circle()
                    .fill(Color.white.opacity(opacity))
                    .frame(width: size, height: size)
                    .position(x: xPos, y: yPos)
            }
        }
    }
    
    // MARK: - 3D Globe View
    private var globe3DView: some View {
        ZStack {
            // Outer atmosphere glow (characteristic of react-globe.gl)
            atmosphereHalo
            
            // Main globe layers
            ZStack {
                // Base Earth sphere with blue marble texture simulation
                earthSphere
                
                // Topographic bump effect
                topographicLayer
                
                // Cloud layer (animated separately)
                cloudLayer
                
                // Data visualization - Hex bins / Cylinders
                dataVisualization
                
                // Country borders
                countryBorders
            }
            .rotation3DEffect(
                .degrees(rotation),
                axis: (x: 0.2, y: 1, z: 0),
                perspective: 0.5
            )
        }
        .frame(width: 350, height: 350)
        .onAppear {
            startAnimations()
        }
    }
    
    // MARK: - Atmosphere Halo
    private var atmosphereHalo: some View {
        ZStack {
            // Bright outer glow
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            Color.cyan.opacity(0.0),
                            Color.cyan.opacity(0.2),
                            Color.blue.opacity(0.3),
                            Color.clear
                        ],
                        center: .center,
                        startRadius: 150,
                        endRadius: 200
                    )
                )
                .frame(width: 400, height: 400)
                .blur(radius: 15)
                .scaleEffect(atmospherePulse)
            
            // Inner atmosphere
            Circle()
                .stroke(
                    LinearGradient(
                        colors: [
                            Color.cyan.opacity(0.4),
                            Color.blue.opacity(0.2)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 3
                )
                .frame(width: 310, height: 310)
                .blur(radius: 2)
        }
    }
    
    // MARK: - Earth Sphere
    private var earthSphere: some View {
        Circle()
            .fill(
                RadialGradient(
                    colors: [
                        Color(hex: "#1e3a5f"),
                        Color(hex: "#2c5f8d"),
                        Color(hex: "#1a1a2e")
                    ],
                    center: .center,
                    startRadius: 0,
                    endRadius: 150
                )
            )
            .frame(width: 300, height: 300)
            .overlay(
                // Specular highlight
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [
                                Color.white.opacity(0.3),
                                Color.clear
                            ],
                            center: UnitPoint(x: 0.35, y: 0.35),
                            startRadius: 0,
                            endRadius: 100
                        )
                    )
                    .blur(radius: 20)
            )
    }
    
    // MARK: - Topographic Layer
    private var topographicLayer: some View {
        ZStack {
            // Simulate terrain bumps
            ForEach(0..<30) { i in
                let width: CGFloat = CGFloat.random(in: 20...60)
                let height: CGFloat = CGFloat.random(in: 20...60)
                let offsetX: CGFloat = CGFloat.random(in: -120...120)
                let offsetY: CGFloat = CGFloat.random(in: -120...120)
                
                Circle()
                    .fill(Color.black.opacity(0.15))
                    .frame(width: width, height: height)
                    .offset(x: offsetX, y: offsetY)
                    .blur(radius: 5)
            }
        }
        .clipShape(Circle())
        .frame(width: 300, height: 300)
    }
    
    // MARK: - Cloud Layer
    private var cloudLayer: some View {
        ZStack {
            ForEach(0..<15) { i in
                let width: CGFloat = CGFloat.random(in: 30...80)
                let height: CGFloat = CGFloat.random(in: 15...40)
                let angle: Double = Double(i * 24)
                let offsetX: CGFloat = cos(Double(i) * 0.42) * 100
                let offsetY: CGFloat = sin(Double(i) * 0.42) * 100
                
                Ellipse()
                    .fill(Color.white.opacity(0.15))
                    .frame(width: width, height: height)
                    .rotationEffect(.degrees(angle))
                    .offset(x: offsetX, y: offsetY)
                    .blur(radius: 8)
            }
        }
        .frame(width: 310, height: 310)
        .clipShape(Circle())
        .rotation3DEffect(
            .degrees(cloudRotation),
            axis: (x: 0, y: 1, z: 0.1)
        )
    }
    
    // MARK: - Data Visualization (Hex Bins / Cylinders)
    private var dataVisualization: some View {
        ZStack {
            ForEach(mockStations) { station in
                // 3D Cylinder rising from globe surface
                let position = calculatePosition(for: station)
                
                ZStack {
                    // Cylinder body
                    RoundedRectangle(cornerRadius: 3)
                        .fill(
                            LinearGradient(
                                colors: [
                                    colorForPM25(station.pm25),
                                    colorForPM25(station.pm25).opacity(0.5)
                                ],
                                startPoint: .bottom,
                                endPoint: .top
                            )
                        )
                        .frame(width: 8, height: heightForPM25(station.pm25))
                        .offset(
                            x: position.x,
                            y: position.y - heightForPM25(station.pm25) / 2
                        )
                    
                    // Cylinder top glow
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [
                                    colorForPM25(station.pm25),
                                    Color.clear
                                ],
                                center: .center,
                                startRadius: 0,
                                endRadius: 12
                            )
                        )
                        .frame(width: 20, height: 20)
                        .offset(
                            x: position.x,
                            y: position.y - heightForPM25(station.pm25)
                        )
                        .blur(radius: 4)
                }
                .onTapGesture {
                    selectedStation = station
                }
            }
        }
    }
    
    // MARK: - Country Borders
    private var countryBorders: some View {
        ZStack {
            // Graticule grid (latitude/longitude lines)
            ForEach(0..<8) { i in
                Circle()
                    .stroke(Color.white.opacity(0.08), lineWidth: 0.5)
                    .frame(
                        width: CGFloat(300 - i * 35),
                        height: CGFloat(300 - i * 35)
                    )
            }
            
            // Latitude lines
            ForEach(0..<6) { i in
                Ellipse()
                    .stroke(Color.white.opacity(0.05), lineWidth: 0.5)
                    .frame(width: 300, height: CGFloat(60 + i * 40))
            }
        }
    }
    
    // MARK: - Header
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
            
            VStack(alignment: .leading, spacing: 2) {
                Text("Global Air Quality")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Text("Real-time monitoring stations")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            
            Spacer()
        }
        .padding()
    }
    
    // MARK: - Station Info Panel
    private func stationInfoPanel(_ station: MonitoringStation) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(station.name)
                        .font(.headline)
                        .foregroundColor(.white)
                    
                    Text(station.country)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                Button(action: { selectedStation = nil }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                }
            }
            
            Divider()
                .background(Color.white.opacity(0.2))
            
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("PM2.5")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Text("\(Int(station.pm25))")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(colorForPM25(station.pm25))
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("AQI Level")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Text(AQILevel.from(pm25: station.pm25).name)
                        .font(.headline)
                        .foregroundColor(colorForPM25(station.pm25))
                }
            }
        }
        .padding()
        .background(Color.black.opacity(0.8))
        .cornerRadius(16)
        .padding()
        .transition(.move(edge: .bottom).combined(with: .opacity))
    }
    
    // MARK: - Helper Functions
    private func startAnimations() {
        // Globe rotation
        withAnimation(.linear(duration: 40).repeatForever(autoreverses: false)) {
            rotation = 360
        }
        
        // Cloud rotation (slower, opposite direction)
        withAnimation(.linear(duration: 60).repeatForever(autoreverses: false)) {
            cloudRotation = -360
        }
        
        // Atmosphere pulse
        withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) {
            atmospherePulse = 1.0
        }
    }
    
    private func calculatePosition(for station: MonitoringStation) -> CGPoint {
        // Simplified 2D projection
        let lat = station.coordinate.latitude * .pi / 180
        let lon = station.coordinate.longitude * .pi / 180
        
        let x = CGFloat(150 * cos(lat) * sin(lon))
        let y = CGFloat(150 * sin(lat))
        
        return CGPoint(x: x, y: -y)
    }
    
    private func colorForPM25(_ pm25: Double) -> Color {
        AQILevel.from(pm25: pm25).swiftUIColor
    }
    
    private func heightForPM25(_ pm25: Double) -> CGFloat {
        // Scale height based on PM2.5 value (20-100 range)
        return CGFloat(20 + (pm25 / 150) * 80)
    }
    
    private var mockStations: [MonitoringStation] {
        [
            MonitoringStation(name: "Washington D.C.", country: "USA", latitude: 38.9, longitude: -77.0, pm25: Double.random(in: 10...50)),
            MonitoringStation(name: "Seoul", country: "South Korea", latitude: 37.5, longitude: 127.0, pm25: Double.random(in: 20...80)),
            MonitoringStation(name: "Tokyo", country: "Japan", latitude: 35.7, longitude: 139.7, pm25: Double.random(in: 15...45)),
            MonitoringStation(name: "London", country: "UK", latitude: 51.50, longitude: -0.12, pm25: Double.random(in: 10...40)),
            MonitoringStation(name: "Beijing", country: "China", latitude: 39.9, longitude: 116.4, pm25: Double.random(in: 40...120)),
            MonitoringStation(name: "Mumbai", country: "India", latitude: 19.0, longitude: 72.8, pm25: Double.random(in: 50...150)),
            MonitoringStation(name: "Sydney", country: "Australia", latitude: -33.8, longitude: 151.2, pm25: Double.random(in: 10...30)),
            MonitoringStation(name: "São Paulo", country: "Brazil", latitude: -23.5, longitude: -46.6, pm25: Double.random(in: 20...60))
        ]
    }
}

#Preview {
    GlobeView(onBack: {})
}
