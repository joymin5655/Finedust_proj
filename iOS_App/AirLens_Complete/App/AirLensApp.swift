//
//  AirLensApp.swift
//  AirLens
//
//  Created on 2025-11-06
//

import SwiftUI

@main
struct AirLensApp: App {
    @StateObject private var locationService = LocationService.shared
    @StateObject private var stationViewModel = StationViewModel()
    @StateObject private var policyViewModel = PolicyViewModel()
    @StateObject private var cameraViewModel = CameraViewModel()
    @StateObject private var globeViewModel = GlobeViewModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(locationService)
                .environmentObject(stationViewModel)
                .environmentObject(policyViewModel)
                .environmentObject(cameraViewModel)
                .environmentObject(globeViewModel)
                .preferredColorScheme(.dark)
                .onAppear {
                    setupApp()
                }
        }
    }
    
    private func setupApp() {
        // 위치 권한 요청
        locationService.requestPermission()
        
        // 초기 데이터 로드
        Task {
            await stationViewModel.fetchStations()
            await policyViewModel.fetchPolicies()
        }
    }
}