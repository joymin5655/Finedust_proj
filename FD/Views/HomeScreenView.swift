//
//  HomeScreenView.swift
//  Finedust
//
//  Home screen with AirLens-inspired design
//  Features: 3D globe, location info, and action buttons
//

import SwiftUI
import CoreLocation

struct HomeScreenView: View {
    @State private var rotation: Double = 0
    @State private var scale: CGFloat = 1.0
    @State private var showingCamera = false
    @State private var userLocation: CLLocationCoordinate2D?
    @State private var locationName = "South Korea"
    @State private var cityName = "Suwon"
    
    var body: some View {
        ZStack {
            // Dark background
            Color.black
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("AirLens")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    // Top right icons
                    HStack(spacing: 16) {
                        Button(action: {}) {
                            Image(systemName: "globe")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 44, height: 44)
                        }
                        
                        Button(action: {}) {
                            Image(systemName: "gear")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 44, height: 44)
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                
                Spacer()
                
                // 3D Globe View
                globeContainer
                
                Spacer()
                
                // Location info and buttons
                bottomSection
            }
        }
        .onAppear {
            startRotation()
        }
    }
    
    // MARK: - Globe Container
    private var globeContainer: some View {
        ZStack {
            // Outer glow/atmosphere rings
            VStack(spacing: 8) {
                Circle()
                    .stroke(Color.blue.opacity(0.15), lineWidth: 1)
                    .frame(width: 280, height: 280)
                
                Circle()
                    .stroke(Color.blue.opacity(0.1), lineWidth: 1)
                    .frame(width: 320, height: 320)
                
                Circle()
                    .stroke(Color.blue.opacity(0.05), lineWidth: 1)
                    .frame(width: 360, height: 360)
            }
            
            // Main globe
            ZStack {
                // Globe background - blue ocean
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [
                                Color(hex: "#4A90E2"),
                                Color(hex: "#357ABD")
                            ],
                            center: .center,
                            startRadius: 0,
                            endRadius: 130
                        )
                    )
                
                // Continents - green landmass simulation
                ZStack {
                    // North America
                    ellipseContinent(x: -60, y: -40, width: 50, height: 60)
                    
                    // South America
                    ellipseContinent(x: -50, y: 30, width: 30, height: 50)
                    
                    // Europe & Africa
                    ellipseContinent(x: 20, y: -20, width: 45, height: 70)
                    
                    // Asia
                    ellipseContinent(x: 60, y: 0, width: 60, height: 50)
                    
                    // Australia
                    ellipseContinent(x: 70, y: 50, width: 25, height: 30)
                }
                
                // Specular highlight (shine effect)
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [
                                Color.white.opacity(0.25),
                                Color.white.opacity(0.05),
                                Color.clear
                            ],
                            center: UnitPoint(x: 0.3, y: 0.3),
                            startRadius: 0,
                            endRadius: 80
                        )
                    )
            }
            .frame(width: 260, height: 260)
            .rotation3DEffect(
                .degrees(rotation),
                axis: (x: 0, y: 1, z: 0.2)
            )
            .shadow(color: Color.blue.opacity(0.3), radius: 20, x: 0, y: 10)
        }
    }
    
    // Helper function to create continent shapes
    private func ellipseContinent(x: CGFloat, y: CGFloat, width: CGFloat, height: CGFloat) -> some View {
        Ellipse()
            .fill(Color(hex: "#6BC86E"))
            .frame(width: width, height: height)
            .offset(x: x, y: y)
    }
    
    // MARK: - Bottom Section: Location & Buttons
    private var bottomSection: some View {
        VStack(spacing: 16) {
            // Location info card
            HStack(spacing: 12) {
                Image(systemName: "location.fill")
                    .foregroundColor(.white)
                    .font(.system(size: 16))
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(locationName)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    
                    Text(cityName)
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                }
                
                Spacer()
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(Color.white.opacity(0.05))
            .cornerRadius(12)
            
            // Action buttons
            HStack(spacing: 12) {
                // Capture button
                Button(action: { showingCamera = true }) {
                    HStack(spacing: 8) {
                        Image(systemName: "camera.fill")
                        Text("Capture")
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .foregroundColor(.white)
                    .background(Color.gray.opacity(0.3))
                    .cornerRadius(12)
                }
                
                // Upload button
                Button(action: {}) {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.up.square.fill")
                        Text("Upload")
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .foregroundColor(.white)
                    .background(Color(hex: "#1E88E5"))
                    .cornerRadius(12)
                }
            }
            .font(.system(size: 16, weight: .semibold))
            
            // Stations button (full width)
            Button(action: {}) {
                HStack(spacing: 8) {
                    Image(systemName: "location.circle.fill")
                    Text("Stations")
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .foregroundColor(.white)
                .background(Color(hex: "#7C3AED"))
                .cornerRadius(12)
            }
            .font(.system(size: 16, weight: .semibold))
        }
        .padding(20)
        .background(
            Color.white.opacity(0.02)
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.white.opacity(0.08), lineWidth: 1)
                )
        )
        .padding(16)
    }
    
    // MARK: - Animations
    private func startRotation() {
        withAnimation(.linear(duration: 40).repeatForever(autoreverses: false)) {
            rotation = 360
        }
    }
}

#Preview {
    HomeScreenView()
}
