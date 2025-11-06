//
//  ResultsView.swift
//  AirLens
//
//  Display PM2.5 prediction results
//

import SwiftUI

struct ResultsView: View {
    let prediction: PredictionResult
    let onClose: () -> Void

    var body: some View {
        ZStack {
            // Background gradient based on air quality
            LinearGradient(
                colors: gradientColors(),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 30) {
                    // Close button
                    HStack {
                        Spacer()
                        Button(action: onClose) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.title)
                                .foregroundColor(.white.opacity(0.8))
                        }
                    }
                    .padding()

                    // Main PM2.5 display
                    VStack(spacing: 16) {
                        Text("PM2.5 Level")
                            .font(.headline)
                            .foregroundColor(.white.opacity(0.8))

                        ZStack {
                            // Circular gradient background
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: [
                                            Color.white.opacity(0.3),
                                            Color.white.opacity(0.1)
                                        ],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 200, height: 200)

                            VStack(spacing: 8) {
                                Text("\(prediction.pm25.formatted(decimalPlaces: 1))")
                                    .font(.system(size: 60, weight: .bold))
                                    .foregroundColor(.white)

                                Text("μg/m³")
                                    .font(.title3)
                                    .foregroundColor(.white.opacity(0.8))
                            }
                        }
                        .shadow(color: .black.opacity(0.2), radius: 10)

                        Text(prediction.pm25Level.description)
                            .font(.title2)
                            .fontWeight(.semibold)
                            .foregroundColor(.white)

                        Text(prediction.pm25Level.message)
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.9))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .padding(.top, 20)

                    // Location info
                    if let location = prediction.location {
                        LocationCard(location: location)
                    }

                    // Confidence
                    ConfidenceCard(confidence: prediction.confidence)

                    // Methodology breakdown
                    MethodologyCard(methodology: prediction.methodology)

                    // Action button
                    Button(action: onClose) {
                        Text("Take Another Photo")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.white.opacity(0.2))
                            .cornerRadius(12)
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 40)
                }
            }

            // Confetti effect for good air quality
            if prediction.pm25Level == .good {
                ConfettiView()
            }
        }
    }

    private func gradientColors() -> [Color] {
        let hexColors = prediction.pm25Level.gradientColors
        return hexColors.map { Color(hex: $0) }
    }
}

struct LocationCard: View {
    let location: LocationInfo

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "location.fill")
                    .foregroundColor(.white)

                if let city = location.city, let country = location.country {
                    Text("\(city), \(country)")
                        .font(.headline)
                        .foregroundColor(.white)
                }

                if let flag = location.countryFlag {
                    Text(flag)
                        .font(.title2)
                }
            }

            Text("Lat: \(location.latitude.formatted(decimalPlaces: 4)), Lon: \(location.longitude.formatted(decimalPlaces: 4))")
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color.white.opacity(0.15))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

struct ConfidenceCard: View {
    let confidence: Double

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundColor(.white)
                Text("Confidence")
                    .font(.headline)
                    .foregroundColor(.white)
                Spacer()
                Text("\(Int(confidence * 100))%")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.white.opacity(0.2))
                        .frame(height: 8)

                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.white)
                        .frame(width: geometry.size.width * confidence, height: 8)
                }
            }
            .frame(height: 8)
        }
        .padding()
        .background(Color.white.opacity(0.15))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

struct MethodologyCard: View {
    let methodology: Methodology

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "chart.bar.fill")
                    .foregroundColor(.white)
                Text("Analysis Methodology")
                    .font(.headline)
                    .foregroundColor(.white)
            }

            VStack(spacing: 12) {
                ForEach(methodology.components, id: \.name) { component in
                    MethodologyRow(
                        name: component.name,
                        value: component.value
                    )
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white.opacity(0.15))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

struct MethodologyRow: View {
    let name: String
    let value: Double

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(name)
                    .font(.subheadline)
                    .foregroundColor(.white)
                Spacer()
                Text("\(Int(value * 100))%")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
            }

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.white.opacity(0.2))
                        .frame(height: 6)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.white)
                        .frame(width: geometry.size.width * value, height: 6)
                }
            }
            .frame(height: 6)
        }
    }
}

struct ConfettiView: View {
    @State private var animate = false

    var body: some View {
        ZStack {
            ForEach(0..<20) { index in
                ConfettiPiece()
                    .offset(
                        x: CGFloat.random(in: -UIScreen.main.bounds.width/2...UIScreen.main.bounds.width/2),
                        y: animate ? UIScreen.main.bounds.height : -100
                    )
                    .rotationEffect(.degrees(animate ? 360 : 0))
                    .animation(
                        Animation.linear(duration: Double.random(in: 2...4))
                            .repeatForever(autoreverses: false)
                            .delay(Double.random(in: 0...2)),
                        value: animate
                    )
            }
        }
        .ignoresSafeArea()
        .onAppear {
            animate = true
        }
    }
}

struct ConfettiPiece: View {
    let colors: [Color] = [.red, .green, .blue, .yellow, .purple, .orange, .pink]
    let color: Color

    init() {
        color = colors.randomElement() ?? .blue
    }

    var body: some View {
        Circle()
            .fill(color)
            .frame(width: 10, height: 10)
    }
}

#Preview {
    ResultsView(
        prediction: PredictionResult(
            pm25: 25.0,
            confidence: 0.87,
            location: LocationInfo(
                latitude: 37.5665,
                longitude: 126.9780,
                country: "South Korea",
                city: "Seoul",
                countryFlag: "🇰🇷"
            ),
            timestamp: ISO8601DateFormatter().string(from: Date()),
            methodology: Methodology(
                imageAnalysis: 0.45,
                weatherData: 0.25,
                historicalTrends: 0.20,
                satelliteData: 0.10
            )
        ),
        onClose: {}
    )
}
