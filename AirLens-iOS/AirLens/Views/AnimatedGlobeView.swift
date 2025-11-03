//
//  AnimatedGlobeView.swift
//  AirLens
//
//  Beautiful animated globe visualization
//

import SwiftUI

struct AnimatedGlobeView: View {
    @State private var rotation: Double = 0
    @State private var scale: CGFloat = 1.0
    @State private var pulseOpacity: Double = 0.3
    
    var body: some View {
        ZStack {
            // Outer glow rings
            ForEach(0..<3) { index in
                Circle()
                    .stroke(
                        LinearGradient(
                            colors: [Color.blue.opacity(0.4), Color.purple.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 2
                    )
                    .frame(width: 250 + CGFloat(index * 30), height: 250 + CGFloat(index * 30))
                    .opacity(pulseOpacity)
                    .animation(
                        Animation.easeInOut(duration: 2.0 + Double(index) * 0.3)
                            .repeatForever(autoreverses: true)
                            .delay(Double(index) * 0.2),
                        value: pulseOpacity
                    )
            }
            
            // Main globe sphere
            ZStack {
                // Base sphere with gradient
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [
                                Color(hex: "#4A90E2").opacity(0.6),
                                Color(hex: "#7B68EE").opacity(0.4),
                                Color(hex: "#8B5CF6").opacity(0.2)
                            ],
                            center: .center,
                            startRadius: 20,
                            endRadius: 150
                        )
                    )
                    .frame(width: 250, height: 250)
                
                // Rotating grid lines
                ForEach(0..<8) { i in
                    Circle()
                        .stroke(Color.white.opacity(0.15), lineWidth: 1)
                        .frame(width: CGFloat(250 - i * 30), height: CGFloat(250 - i * 30))
                        .rotationEffect(.degrees(rotation + Double(i * 45)))
                }
                
                // Latitude lines
                ForEach(0..<5) { i in
                    Ellipse()
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                        .frame(width: 250, height: CGFloat(50 + i * 40))
                        .rotation3DEffect(
                            .degrees(rotation / 2),
                            axis: (x: 0, y: 1, z: 0)
                        )
                }
                
                // Longitude lines
                ForEach(0..<6) { i in
                    Ellipse()
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                        .frame(width: CGFloat(50 + i * 35), height: 250)
                        .rotation3DEffect(
                            .degrees(rotation),
                            axis: (x: 0, y: 1, z: 0)
                        )
                }
                
                // Floating particles
                ForEach(0..<20) { i in
                    Circle()
                        .fill(Color.white.opacity(0.6))
                        .frame(width: 3, height: 3)
                        .offset(
                            x: cos(Double(i) * 0.314 + rotation * 0.01) * 120,
                            y: sin(Double(i) * 0.314 + rotation * 0.01) * 120
                        )
                        .opacity(0.3 + sin(rotation * 0.02 + Double(i)) * 0.3)
                }
                
                // Center glow
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color.white.opacity(0.3), Color.clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: 50
                        )
                    )
                    .frame(width: 100, height: 100)
                    .blur(radius: 10)
            }
            .rotation3DEffect(
                .degrees(rotation),
                axis: (x: 0, y: 1, z: 0),
                perspective: 0.5
            )
            .scaleEffect(scale)
        }
        .onAppear {
            withAnimation(.linear(duration: 20).repeatForever(autoreverses: false)) {
                rotation = 360
            }
            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                scale = 1.05
                pulseOpacity = 0.6
            }
        }
    }
}

#Preview {
    ZStack {
        Color.black
        AnimatedGlobeView()
    }
}
