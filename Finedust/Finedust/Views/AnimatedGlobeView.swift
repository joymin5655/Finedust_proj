//
//  AnimatedGlobeView.swift
//  Finedust
//
//  WebGL Globe inspired visualization
//  Reference: https://github.com/dataarts/webgl-globe
//

import SwiftUI

struct AnimatedGlobeView: View {
    @State private var rotation: Double = 0
    @State private var dataPoints: [DataPoint] = []
    
    struct DataPoint: Identifiable {
        let id = UUID()
        let angle: Double
        let distance: Double
        let height: Double
        let color: Color
    }
    
    var body: some View {
        ZStack {
            // Background - Pure black like webgl-globe
            Color.black
                .ignoresSafeArea()
            
            // Main Globe Container
            ZStack {
                // Base Globe Sphere
                baseGlobe
                
                // Data Spikes (characteristic webgl-globe feature)
                dataSpikes
                
                // Subtle atmosphere glow
                atmosphereGlow
            }
            .rotation3DEffect(
                .degrees(rotation),
                axis: (x: 0, y: 1, z: 0),
                perspective: 0.6
            )
        }
        .onAppear {
            generateDataPoints()
            startRotation()
        }
    }
    
    // MARK: - Base Globe
    private var baseGlobe: some View {
        ZStack {
            // Main sphere with dark gradient
            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            Color(hex: "#1a1a2e"),
                            Color(hex: "#0f0f1e")
                        ],
                        center: .center,
                        startRadius: 0,
                        endRadius: 120
                    )
                )
                .frame(width: 240, height: 240)
            
            // Thin wireframe grid
            ForEach(0..<12) { i in
                Circle()
                    .stroke(Color.white.opacity(0.05), lineWidth: 0.5)
                    .frame(width: CGFloat(240 - i * 20), height: CGFloat(240 - i * 20))
            }
            
            // Latitude lines (horizontal)
            ForEach(0..<7) { i in
                Ellipse()
                    .stroke(Color.white.opacity(0.03), lineWidth: 0.5)
                    .frame(width: 240, height: CGFloat(40 + i * 30))
            }
            
            // Continents outline (simplified)
            continentsOverlay
        }
    }
    
    // MARK: - Data Spikes (webgl-globe signature)
    private var dataSpikes: some View {
        ZStack {
            ForEach(dataPoints) { point in
                // Spike bar
                RoundedRectangle(cornerRadius: 1)
                    .fill(
                        LinearGradient(
                            colors: [
                                point.color.opacity(0.9),
                                point.color.opacity(0.3)
                            ],
                            startPoint: .bottom,
                            endPoint: .top
                        )
                    )
                    .frame(width: 3, height: point.height)
                    .offset(
                        x: cos(point.angle + rotation * 0.017) * point.distance,
                        y: sin(point.angle + rotation * 0.017) * point.distance - point.height / 2
                    )
                    .opacity(visibilityForPoint(angle: point.angle))
                
                // Glow at spike tip
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [point.color, Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: 8
                        )
                    )
                    .frame(width: 12, height: 12)
                    .offset(
                        x: cos(point.angle + rotation * 0.017) * point.distance,
                        y: sin(point.angle + rotation * 0.017) * point.distance - point.height
                    )
                    .opacity(visibilityForPoint(angle: point.angle) * 0.6)
                    .blur(radius: 3)
            }
        }
    }
    
    // MARK: - Atmosphere Glow
    private var atmosphereGlow: some View {
        Circle()
            .fill(
                RadialGradient(
                    colors: [
                        Color.cyan.opacity(0.15),
                        Color.blue.opacity(0.05),
                        Color.clear
                    ],
                    center: .center,
                    startRadius: 100,
                    endRadius: 140
                )
            )
            .frame(width: 280, height: 280)
            .blur(radius: 8)
    }
    
    // MARK: - Continents Overlay
    private var continentsOverlay: some View {
        ZStack {
            // Simplified continents shapes
            ForEach(0..<8) { i in
                let width: CGFloat = CGFloat.random(in: 20...60)
                let height: CGFloat = CGFloat.random(in: 10...30)
                let offsetX: CGFloat = cos(Double(i) * 0.785) * CGFloat.random(in: 60...100)
                let offsetY: CGFloat = sin(Double(i) * 0.785) * CGFloat.random(in: 60...100)
                
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color.white.opacity(0.08))
                    .frame(width: width, height: height)
                    .rotationEffect(.degrees(Double(i * 45)))
                    .offset(x: offsetX, y: offsetY)
            }
        }
    }
    
    // MARK: - Helper Functions
    private func generateDataPoints() {
        var points: [DataPoint] = []
        
        // Generate data spikes at various positions
        let majorCities = [
            (angle: 0.0, height: 60.0, color: Color(hex: "#ff6b6b")),     // Red
            (angle: 0.8, height: 45.0, color: Color(hex: "#ee5a6f")),
            (angle: 1.6, height: 80.0, color: Color(hex: "#c44569")),     // Deep Red
            (angle: 2.4, height: 35.0, color: Color(hex: "#feca57")),     // Yellow
            (angle: 3.2, height: 55.0, color: Color(hex: "#48dbfb")),     // Cyan
            (angle: 4.0, height: 40.0, color: Color(hex: "#0abde3")),
            (angle: 4.8, height: 70.0, color: Color(hex: "#ff9ff3")),     // Pink
            (angle: 5.6, height: 50.0, color: Color(hex: "#54a0ff")),     // Blue
        ]
        
        for city in majorCities {
            points.append(
                DataPoint(
                    angle: city.angle,
                    distance: 120,
                    height: city.height,
                    color: city.color
                )
            )
        }
        
        // Add smaller data points
        for i in 0..<20 {
            let angle = Double(i) * 0.314
            points.append(
                DataPoint(
                    angle: angle,
                    distance: 120,
                    height: CGFloat.random(in: 15...30),
                    color: Color(hex: "#a29bfe").opacity(0.8)
                )
            )
        }
        
        self.dataPoints = points
    }
    
    private func startRotation() {
        withAnimation(.linear(duration: 30).repeatForever(autoreverses: false)) {
            rotation = 360
        }
    }
    
    // Calculate visibility based on rotation (hide back-facing spikes)
    private func visibilityForPoint(angle: Double) -> Double {
        let adjustedAngle = (angle + rotation * 0.017).truncatingRemainder(dividingBy: 6.28)
        let visibility = cos(adjustedAngle)
        return max(0, visibility)
    }
}

// MARK: - Preview
#Preview {
    ZStack {
        Color.black
        AnimatedGlobeView()
    }
}
