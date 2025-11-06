//
//  GlobeView.swift
//  AirLens
//
//  Interactive 3D globe view with station markers
//

import SwiftUI
import MapKit

struct GlobeView: View {
    @EnvironmentObject var viewModel: GlobeViewModel

    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 20, longitude: 0),
        span: MKCoordinateSpan(latitudeDelta: 180, longitudeDelta: 180)
    )

    var body: some View {
        ZStack {
            // Background
            Color.black.ignoresSafeArea()

            // Map view
            Map(coordinateRegion: $region, annotationItems: viewModel.stations) { station in
                MapAnnotation(coordinate: station.coordinate) {
                    StationMarker(station: station) {
                        viewModel.selectStation(station)
                    }
                }
            }
            .ignoresSafeArea()

            // Policy panel overlay
            if viewModel.showPolicyPanel {
                PolicyPanelView(
                    station: viewModel.selectedStation,
                    policies: viewModel.policiesForSelectedCountry,
                    onClose: {
                        viewModel.deselectStation()
                    }
                )
                .transition(.move(edge: .trailing))
            }

            // Loading overlay
            if viewModel.isLoading {
                ZStack {
                    Color.black.opacity(0.5)
                        .ignoresSafeArea()

                    VStack(spacing: 16) {
                        ProgressView()
                            .scaleEffect(1.5)
                            .tint(.cyan)

                        Text("Loading stations...")
                            .foregroundColor(.white)
                    }
                }
            }
        }
        .task {
            if viewModel.stations.isEmpty {
                // Load mock data for demo
                viewModel.loadMockStations()
                // Or load from API:
                // await viewModel.loadGlobeStations()
            }
        }
    }
}

struct StationMarker: View {
    let station: Station
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            ZStack {
                Circle()
                    .fill(Color.from(pm25Level: station.pm25Level))
                    .frame(width: 30, height: 30)
                    .shadow(color: .black.opacity(0.3), radius: 5)

                Circle()
                    .strokeBorder(Color.white, lineWidth: 2)
                    .frame(width: 30, height: 30)

                Text("\(Int(station.pm25))")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.white)
            }
        }
    }
}

struct PolicyPanelView: View {
    let station: Station?
    let policies: [Policy]
    let onClose: () -> Void

    var body: some View {
        HStack {
            Spacer()

            VStack(alignment: .leading, spacing: 0) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 8) {
                        if let station = station {
                            Text(station.country)
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)

                            Text("\(station.city) - PM2.5: \(station.pm25.formatted(decimalPlaces: 1)) μg/m³")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }
                    }

                    Spacer()

                    Button(action: onClose) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundColor(.gray)
                    }
                }
                .padding()
                .background(Color(.systemBackground))

                Divider()

                // Policies list
                ScrollView {
                    if policies.isEmpty {
                        VStack(spacing: 16) {
                            Image(systemName: "doc.text.magnifyingglass")
                                .font(.system(size: 50))
                                .foregroundColor(.gray)

                            Text("No policies found")
                                .font(.headline)
                                .foregroundColor(.gray)

                            Text("Environmental policies for this country are not available yet.")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                                .multilineTextAlignment(.center)
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .padding(.top, 60)
                    } else {
                        LazyVStack(spacing: 16) {
                            ForEach(policies) { policy in
                                PolicyCard(policy: policy)
                            }
                        }
                        .padding()
                    }
                }
            }
            .frame(width: UIScreen.main.bounds.width * 0.85)
            .background(Color(.systemBackground))
            .ignoresSafeArea()
        }
        .background(
            Color.black.opacity(0.3)
                .ignoresSafeArea()
                .onTapGesture {
                    onClose()
                }
        )
    }
}

struct PolicyCard: View {
    let policy: Policy

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header with category
            HStack {
                Image(systemName: policy.category.icon)
                    .foregroundColor(Color.from(policyCategory: policy.category))

                Text(policy.category.displayName)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(Color.from(policyCategory: policy.category))

                Spacer()

                // Credibility badge
                HStack(spacing: 4) {
                    Image(systemName: "checkmark.shield.fill")
                        .font(.caption2)
                    Text("\(policy.credibilityPercentage)%")
                        .font(.caption2)
                        .fontWeight(.semibold)
                }
                .foregroundColor(credibilityColor(policy.credibilityScore))
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(credibilityColor(policy.credibilityScore).opacity(0.2))
                .cornerRadius(8)
            }

            // Title
            Text(policy.title)
                .font(.headline)
                .foregroundColor(.primary)

            // Description
            Text(policy.description)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(3)

            // Footer
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(policy.authority)
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text(policy.effectiveDate)
                        .font(.caption2)
                        .foregroundColor(.gray)
                }

                Spacer()

                if policy.link != nil {
                    Button(action: {
                        if let link = policy.link, let url = URL(string: link) {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack(spacing: 4) {
                            Text("Learn More")
                                .font(.caption)
                            Image(systemName: "arrow.up.right")
                                .font(.caption2)
                        }
                        .foregroundColor(.blue)
                    }
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }

    private func credibilityColor(_ score: Double) -> Color {
        if score >= 0.95 {
            return .green
        } else if score >= 0.90 {
            return .yellow
        } else {
            return .orange
        }
    }
}

#Preview {
    GlobeView()
        .environmentObject(GlobeViewModel())
}
