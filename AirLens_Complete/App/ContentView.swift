//
//  ContentView.swift
//  AirLens
//
//  Created on 2025-11-06
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var stationViewModel: StationViewModel
    @EnvironmentObject var policyViewModel: PolicyViewModel
    @EnvironmentObject var cameraViewModel: CameraViewModel
    @EnvironmentObject var globeViewModel: GlobeViewModel
    @EnvironmentObject var locationService: LocationService
    
    @State private var selectedTab = 0
    @State private var showOnboarding = false
    
    var body: some View {
        ZStack {
            // 배경 그라디언트
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.05, green: 0.05, blue: 0.15),
                    Color.black
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            TabView(selection: $selectedTab) {
                // 🌍 Globe Tab - 3D 지구본
                GlobeView()
                    .tabItem {
                        VStack {
                            Image(systemName: "globe.americas.fill")
                                .font(.system(size: 24))
                            Text("Globe")
                                .font(.caption)
                        }
                    }
                    .tag(0)
                
                // 📸 Camera Tab - AI 예측
                CameraView()
                    .tabItem {
                        VStack {
                            Image(systemName: "camera.fill")
                                .font(.system(size: 24))
                            Text("Camera")
                                .font(.caption)
                        }
                    }
                    .tag(1)
                
                // 📋 Policies Tab - 환경 정책
                PoliciesView()
                    .tabItem {
                        VStack {
                            Image(systemName: "doc.text.fill")
                                .font(.system(size: 24))
                            Text("Policies")
                                .font(.caption)
                        }
                    }
                    .tag(2)
                
                // 📊 Stats Tab - 통계
                StatsView()
                    .tabItem {
                        VStack {
                            Image(systemName: "chart.bar.fill")
                                .font(.system(size: 24))
                            Text("Stats")
                                .font(.caption)
                        }
                    }
                    .tag(3)
            }
            .accentColor(colorForTab(selectedTab))
            
            // 상단 헤더
            VStack {
                HeaderView(selectedTab: selectedTab)
                    .padding(.top, 50)
                Spacer()
            }
            .ignoresSafeArea()
        }
        .task {
            await loadInitialData()
        }
        .sheet(isPresented: $showOnboarding) {
            OnboardingView()
        }
    }
    
    private func loadInitialData() async {
        // 측정소 데이터 로드
        await stationViewModel.fetchStations()
        
        // 정책 데이터 로드
        await policyViewModel.fetchPolicies()
        
        // 사용자 위치 기반 가까운 측정소 찾기
        if let location = locationService.currentLocation {
            await stationViewModel.findNearbyStations(
                latitude: location.latitude,
                longitude: location.longitude
            )
        }
    }
    
    private func colorForTab(_ tab: Int) -> Color {
        switch tab {
        case 0: return Color.cyan
        case 1: return Color.green
        case 2: return Color.orange
        case 3: return Color.purple
        default: return Color.blue
        }
    }
}

// MARK: - Header View
struct HeaderView: View {
    let selectedTab: Int
    @EnvironmentObject var stationViewModel: StationViewModel
    
    var headerTitle: String {
        switch selectedTab {
        case 0: return "🌍 AirLens Globe"
        case 1: return "📸 AI Prediction"
        case 2: return "📋 Air Policies"
        case 3: return "📊 Statistics"
        default: return "AirLens"
        }
    }
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(headerTitle)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                if selectedTab == 0 {
                    Text("\(stationViewModel.stations.count) stations worldwide")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
            
            // 알림 버튼
            Button(action: {}) {
                Image(systemName: "bell.badge.fill")
                    .font(.title2)
                    .foregroundColor(.white)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 10)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [
                    Color.black.opacity(0.8),
                    Color.clear
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
        )
    }
}

// MARK: - Onboarding View
struct OnboardingView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Image(systemName: "globe.asia.australia.fill")
                    .font(.system(size: 100))
                    .foregroundColor(.blue)
                
                Text("Welcome to AirLens")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                VStack(spacing: 20) {
                    FeatureRow(
                        icon: "globe",
                        title: "Global Coverage",
                        description: "30,000+ air quality stations worldwide"
                    )
                    
                    FeatureRow(
                        icon: "camera",
                        title: "AI Prediction",
                        description: "Predict PM2.5 from photos using AI"
                    )
                    
                    FeatureRow(
                        icon: "doc.text",
                        title: "Policy Tracking",
                        description: "150+ countries' environmental policies"
                    )
                }
                .padding()
                
                Spacer()
                
                Button(action: { dismiss() }) {
                    Text("Get Started")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(12)
                }
                .padding()
            }
            .padding()
            .navigationBarHidden(true)
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 15) {
            Image(systemName: icon)
                .font(.title)
                .foregroundColor(.blue)
                .frame(width: 50)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            
            Spacer()
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(LocationService.shared)
        .environmentObject(StationViewModel())
        .environmentObject(PolicyViewModel())
        .environmentObject(CameraViewModel())
        .environmentObject(GlobeViewModel())
}