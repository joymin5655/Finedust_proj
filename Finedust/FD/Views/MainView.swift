//
//  MainView.swift
//  Finedust
//
//  새로운 메인 화면 - 지구본과 사람 애니메이션
//

import SwiftUI
import CoreLocation

struct MainView: View {
    @StateObject private var locationService = LocationService()
    @State private var showSettings = false
    @State private var showPolicy = false
    @State private var showCamera = false
    @State private var showImagePicker = false
    @State private var selectedImage: UIImage?
    @State private var globeRotation: Double = 0
    @State private var personPosition: CGFloat = 0
    @State private var isNightMode = false
    @State private var nearbyStationData: StationData?
    
    var body: some View {
        NavigationView {
            ZStack {
                // 배경 그라데이션
                LinearGradient(
                    colors: isNightMode ? 
                        [Color.black, Color.indigo.opacity(0.3)] :
                        [Color.blue.opacity(0.1), Color.cyan.opacity(0.05)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // 헤더
                    headerView
                    
                    Spacer()
                    
                    // 지구본과 사람 애니메이션
                    globeWithPerson
                    
                    Spacer()
                    
                    // 촬영/업로드 섹션
                    captureSection
                        .padding(.bottom, 30)
                }
            }
            .onAppear {
                requestPermissions()
                startAnimations()
                checkTimeForNightMode()
            }
            .sheet(isPresented: $showSettings) {
                SettingsView()
            }
            .sheet(isPresented: $showPolicy) {
                PolicyView()
            }
        }
    }
    
    // MARK: - Header View
    private var headerView: some View {
        HStack {
            // 로고 (왼쪽 위)
            HStack(spacing: 8) {
                Image(systemName: "wind")
                    .font(.title2)
                    .foregroundColor(.blue)
                Text("AirLens")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.primary)
            }
            
            Spacer()
            
            // 설정 & 정책 아이콘 (오른쪽 위)
            HStack(spacing: 20) {
                Button(action: { showPolicy = true }) {
                    Image(systemName: "globe.asia.australia")
                        .font(.title2)
                        .foregroundColor(.primary)
                }
                
                Button(action: { showSettings = true }) {
                    Image(systemName: "gearshape")
                        .font(.title2)
                        .foregroundColor(.primary)
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 15)
    }
        
    // MARK: - Globe with Person Animation
    private var globeWithPerson: some View {
        ZStack {
            // 지구본
            Globe3DView(rotation: $globeRotation)
                .frame(width: 250, height: 250)
                .overlay(
                    // 사람이 걸어가는 애니메이션
                    GeometryReader { geometry in
                        WalkingPersonView(
                            position: personPosition,
                            currentLocation: locationService.currentLocation
                        )
                        .position(
                            x: geometry.size.width/2 + cos(personPosition) * 100,
                            y: geometry.size.height/2 + sin(personPosition) * 100
                        )
                    }
                )
            
            // 현재 위치 표시
            if let location = locationService.locationDetails {
                VStack(spacing: 4) {
                    Text(location.cityName ?? "Unknown City")
                        .font(.headline)
                        .foregroundColor(.primary)
                    Text(location.countryName ?? "Unknown Country")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.white.opacity(0.9))
                .cornerRadius(20)
                .offset(y: 150)
            }
        }
    }
    
    // MARK: - Capture Section
    private var captureSection: some View {
        VStack(spacing: 16) {
            if isNightMode {
                // 야간 모드 - 관측소 데이터 표시
                nightModeView
            } else {
                // 주간 모드 - 촬영/업로드 섹션
                dayModeCapture
            }
        }
        .padding(.horizontal, 20)
    }
    
    private var nightModeView: some View {
        VStack(spacing: 12) {
            Label("야간 모드", systemImage: "moon.fill")
                .font(.headline)
                .foregroundColor(.yellow)
            
            Text("하늘 촬영이 어려운 시간입니다")
                .font(.caption)
                .foregroundColor(.secondary)
            
            if let stationData = nearbyStationData {
                VStack(spacing: 8) {
                    Text("근처 관측소 데이터")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    HStack {
                        Text("PM2.5:")
                        Text("\(stationData.pm25) μg/m³")
                            .fontWeight(.bold)
                            .foregroundColor(getColorForPM25(stationData.pm25))
                    }
                    
                    Text(stationData.stationName)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
            }
            
            Button(action: fetchNearbyStationData) {
                Label("관측소 데이터 새로고침", systemImage: "arrow.clockwise")
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(25)
            }
        }
    }
    
    private var dayModeCapture: some View {
        HStack(spacing: 20) {
            // 촬영 버튼
            Button(action: { showCamera = true }) {
                VStack(spacing: 8) {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 30))
                    Text("촬영")
                        .font(.headline)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
                .background(
                    LinearGradient(
                        colors: [Color.blue, Color.cyan],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .foregroundColor(.white)
                .cornerRadius(15)
            }
            
            // 업로드 버튼
            Button(action: { showImagePicker = true }) {
                VStack(spacing: 8) {
                    Image(systemName: "square.and.arrow.up.fill")
                        .font(.system(size: 30))
                    Text("업로드")
                        .font(.headline)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
                .background(
                    LinearGradient(
                        colors: [Color.purple, Color.pink],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .foregroundColor(.white)
                .cornerRadius(15)
            }
        }
        .sheet(isPresented: $showCamera) {
            CameraPickerView(
                isPresented: $showCamera,
                selectedImage: $selectedImage,
                onImageCaptured: processCapturedImage
            )
        }
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(selectedImage: $selectedImage)
                .onDisappear {
                    if let image = selectedImage {
                        processCapturedImage(image)
                    }
                }
        }
    }
    
    // MARK: - Helper Functions
    private func requestPermissions() {
        locationService.requestPermission()
        // 카메라 권한 요청
        AVCaptureDevice.requestAccess(for: .video) { _ in }
    }
    
    private func startAnimations() {
        // 지구본 회전 애니메이션
        withAnimation(.linear(duration: 30).repeatForever(autoreverses: false)) {
            globeRotation = 360
        }
        
        // 사람 걷기 애니메이션
        withAnimation(.linear(duration: 20).repeatForever(autoreverses: false)) {
            personPosition = .pi * 2
        }
    }
    
    private func checkTimeForNightMode() {
        let hour = Calendar.current.component(.hour, from: Date())
        isNightMode = hour < 6 || hour > 19
    }
    
    private func fetchNearbyStationData() {
        guard let location = locationService.currentLocation else { return }
        
        Task {
            // API 호출하여 근처 관측소 데이터 가져오기
            nearbyStationData = await StationService.shared.fetchNearbyStation(
                lat: location.coordinate.latitude,
                lng: location.coordinate.longitude
            )
        }
    }
    
    private func processCapturedImage(_ image: UIImage) {
        // 이미지 처리 및 PM2.5 예측
        Task {
            await PM25PredictionManager.shared.predict(from: image)
        }
    }
    
    private func getColorForPM25(_ value: Double) -> Color {
        switch value {
        case 0...30: return .green
        case 31...80: return .yellow
        case 81...150: return .orange
        default: return .red
        }
    }
}

// MARK: - Supporting Views

struct Globe3DView: View {
    @Binding var rotation: Double
    
    var body: some View {
        // 3D 지구본 구현 (SceneKit 또는 간단한 SwiftUI)
        ZStack {
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color.blue.opacity(0.6), Color.blue],
                        center: .center,
                        startRadius: 50,
                        endRadius: 125
                    )
                )
                .rotation3DEffect(
                    .degrees(rotation),
                    axis: (x: 0, y: 1, z: 0)
                )
            
            // 대륙 표시 (간단한 형태)
            ForEach(0..<5) { index in
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.green.opacity(0.7))
                    .frame(width: 40, height: 30)
                    .offset(
                        x: CGFloat.random(in: -80...80),
                        y: CGFloat.random(in: -80...80)
                    )
                    .rotation3DEffect(
                        .degrees(rotation + Double(index * 72)),
                        axis: (x: 0, y: 1, z: 0)
                    )
            }
        }
    }
}

struct WalkingPersonView: View {
    let position: CGFloat
    let currentLocation: CLLocation?
    
    var body: some View {
        Image(systemName: "figure.walk")
            .font(.system(size: 24))
            .foregroundColor(.orange)
            .rotationEffect(.radians(position))
    }
}

struct StationData {
    let stationName: String
    let pm25: Double
    let pm10: Double
    let aqi: Int
}

#Preview {
    MainView()
}
