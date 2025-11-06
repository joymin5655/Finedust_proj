//
//  OnboardingView.swift
//  AirLens
//
//  Onboarding screen for first-time users
//

import SwiftUI

struct OnboardingView: View {
    @Binding var showOnboarding: Bool

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(hex: "#0f172a"), Color(hex: "#1e293b"), Color(hex: "#334155")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 40) {
                Spacer()

                // App icon and title
                VStack(spacing: 20) {
                    Image(systemName: "camera.metering.matrix")
                        .font(.system(size: 80))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [.cyan, .blue, .purple],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )

                    Text("Welcome to AirLens")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.white)

                    Text("Monitor air quality with AI")
                        .font(.title3)
                        .foregroundColor(.gray)
                }

                // Features
                VStack(spacing: 30) {
                    FeatureRow(
                        icon: "globe.americas.fill",
                        iconColor: .cyan,
                        title: "Global Coverage",
                        description: "Track air quality from thousands of monitoring stations worldwide"
                    )

                    FeatureRow(
                        icon: "camera.fill",
                        iconColor: .green,
                        title: "AI Prediction",
                        description: "Analyze sky images with advanced machine learning to predict PM2.5 levels"
                    )

                    FeatureRow(
                        icon: "doc.text.fill",
                        iconColor: .orange,
                        title: "Policy Tracking",
                        description: "Stay informed about environmental policies and regulations"
                    )
                }
                .padding(.horizontal)

                Spacer()

                // Get started button
                Button(action: {
                    withAnimation {
                        showOnboarding = false
                    }
                }) {
                    Text("Get Started")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            LinearGradient(
                                colors: [.cyan, .blue],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                }
                .padding(.horizontal, 40)
                .padding(.bottom, 40)
            }
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let iconColor: Color
    let title: String
    let description: String

    var body: some View {
        HStack(alignment: .top, spacing: 20) {
            // Icon
            ZStack {
                Circle()
                    .fill(iconColor.opacity(0.2))
                    .frame(width: 60, height: 60)

                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundColor(iconColor)
            }

            // Text
            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.white)

                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer()
        }
    }
}

#Preview {
    OnboardingView(showOnboarding: .constant(true))
}
