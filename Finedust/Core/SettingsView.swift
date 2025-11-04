//
//  SettingsView.swift
//  Finedust
//
//  설정 페이지 - 테마, 언어, 모델 정보
//

import SwiftUI

struct SettingsView: View {
    @AppStorage("isDarkMode") private var isDarkMode = false
    @AppStorage("selectedLanguage") private var selectedLanguage = "ko"
    @State private var showModelDetails = false
    @State private var showPerformanceChart = false
    
    let languages = [
        ("ko", "한국어", "🇰🇷"),
        ("en", "English", "🇺🇸"),
        ("ja", "日本語", "🇯🇵"),
        ("zh", "中文", "🇨🇳")
    ]
    
    var body: some View {
        NavigationView {
            Form {
                // MARK: - 테마 설정
                Section(header: Label("테마", systemImage: "paintbrush")) {
                    Toggle(isOn: $isDarkMode) {
                        HStack {
                            Image(systemName: isDarkMode ? "moon.fill" : "sun.max.fill")
                                .foregroundColor(isDarkMode ? .yellow : .orange)
                            Text(isDarkMode ? "다크 모드" : "라이트 모드")
                        }
                    }
                    .onChange(of: isDarkMode) { value in
                        updateColorScheme(isDark: value)
                    }
                    
                    // 색상 미리보기
                    HStack(spacing: 12) {
                        ForEach(["blue", "green", "purple", "orange"], id: \.self) { color in
                            Circle()
                                .fill(Color(color))
                                .frame(width: 30, height: 30)
                        }
                    }
                    .padding(.vertical, 8)
                }
                
                // MARK: - 언어 설정
                Section(header: Label("언어", systemImage: "globe")) {
                    ForEach(languages, id: \.0) { code, name, flag in
                        HStack {
                            Text(flag)
                                .font(.title2)
                            Text(name)
                            Spacer()
                            if selectedLanguage == code {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.blue)
                            }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture {
                            selectedLanguage = code
                        }
                    }
                }
                
                // MARK: - 모델 정보
                Section(header: Label("AI 모델 정보", systemImage: "brain")) {
                    // 모델 성능표
                    Button(action: { showPerformanceChart.toggle() }) {
                        HStack {
                            Image(systemName: "chart.line.uptrend.xyaxis")
                                .foregroundColor(.green)
                            Text("성능 지표")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.gray)
                        }
                    }
                    
                    // 작동 원리
                    Button(action: { showModelDetails.toggle() }) {
                        HStack {
                            Image(systemName: "gearshape.2")
                                .foregroundColor(.blue)
                            Text("작동 원리")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.gray)
                        }
                    }
                    
                    // 모델 버전
                    HStack {
                        Image(systemName: "info.circle")
                            .foregroundColor(.gray)
                        Text("모델 버전")
                        Spacer()
                        Text("v2.0.1")
                            .foregroundColor(.gray)
                    }
                }                
                // MARK: - 추가 설정
                Section(header: Label("추가 설정", systemImage: "slider.horizontal.3")) {
                    // 알림 설정
                    HStack {
                        Image(systemName: "bell")
                            .foregroundColor(.orange)
                        Text("알림 설정")
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(.gray)
                    }
                    
                    // 데이터 사용량
                    HStack {
                        Image(systemName: "network")
                            .foregroundColor(.purple)
                        Text("데이터 사용량")
                        Spacer()
                        Text("32.5 MB")
                            .foregroundColor(.gray)
                    }
                    
                    // 캐시 초기화
                    Button(action: clearCache) {
                        HStack {
                            Image(systemName: "trash")
                                .foregroundColor(.red)
                            Text("캐시 초기화")
                                .foregroundColor(.red)
                        }
                    }
                }
                
                // MARK: - 정보
                Section(header: Label("정보", systemImage: "info.circle")) {
                    HStack {
                        Text("앱 버전")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.gray)
                    }
                    
                    HStack {
                        Text("개발자")
                        Spacer()
                        Text("AirLens Team")
                            .foregroundColor(.gray)
                    }
                    
                    Button(action: {}) {
                        HStack {
                            Text("이용 약관")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.gray)
                        }
                    }
                    
                    Button(action: {}) {
                        HStack {
                            Text("개인정보 처리방침")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.gray)
                        }
                    }
                }
            }
            .navigationTitle("설정")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("완료") {
                        // 설정 저장 및 닫기
                    }
                }
            }
        }
        .preferredColorScheme(isDarkMode ? .dark : .light)
        .sheet(isPresented: $showPerformanceChart) {
            ModelPerformanceView()
        }
        .sheet(isPresented: $showModelDetails) {
            ModelDetailsView()
        }
    }
    
    // MARK: - Helper Functions
    private func updateColorScheme(isDark: Bool) {
        // 색상 스키마 업데이트 로직
    }
    
    private func clearCache() {
        // 캐시 초기화 로직
    }
}

// MARK: - Model Performance View
struct ModelPerformanceView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("모델 성능 지표")
                        .font(.title)
                        .fontWeight(.bold)
                        .padding(.horizontal)
                    
                    // 성능 차트
                    VStack(alignment: .leading, spacing: 16) {
                        PerformanceMetric(
                            title: "정확도 (RMSE)",
                            value: "8.1 μg/m³",
                            progress: 0.92,
                            color: .green
                        )
                        
                        PerformanceMetric(
                            title: "결정계수 (R²)",
                            value: "0.931",
                            progress: 0.93,
                            color: .blue
                        )
                        
                        PerformanceMetric(
                            title: "예측 시간",
                            value: "< 10초",
                            progress: 0.85,
                            color: .orange
                        )
                        
                        PerformanceMetric(
                            title: "신뢰도",
                            value: "95-98%",
                            progress: 0.96,
                            color: .purple
                        )
                        
                        PerformanceMetric(
                            title: "배터리 효율",
                            value: "< 2%/예측",
                            progress: 0.98,
                            color: .mint
                        )
                    }
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(15)
                    .padding(.horizontal)
                    
                    // 상세 설명
                    VStack(alignment: .leading, spacing: 12) {
                        Text("측정 방식")
                            .font(.headline)
                        
                        Text("• Triple Verification: 측정소 + 카메라 + 위성 데이터 융합")
                        Text("• CNN-LSTM 딥러닝 모델 활용")
                        Text("• 실시간 Bayesian Fusion 적용")
                        Text("• 100% 온디바이스 처리")
                    }
                    .font(.subheadline)
                    .padding()
                    
                    Spacer()
                }
            }
            .navigationTitle("성능 지표")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("닫기") {
                        // 닫기
                    }
                }
            }
        }
    }
}

// MARK: - Model Details View  
struct ModelDetailsView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("작동 원리")
                        .font(.title)
                        .fontWeight(.bold)
                        .padding(.horizontal)
                    
                    // 3단계 프로세스
                    ForEach(1...3, id: \.self) { step in
                        ModelStepView(step: step)
                    }
                    
                    // 기술 스택
                    VStack(alignment: .leading, spacing: 12) {
                        Text("기술 스택")
                            .font(.headline)
                        
                        TechStackRow(icon: "brain", title: "CoreML", description: "온디바이스 ML 추론")
                        TechStackRow(icon: "camera", title: "AVFoundation", description: "실시간 카메라 처리")
                        TechStackRow(icon: "location", title: "CoreLocation", description: "정확한 위치 추적")
                        TechStackRow(icon: "network", title: "REST API", description: "실시간 데이터 수집")
                    }
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(15)
                    .padding(.horizontal)
                }
            }
            .navigationTitle("작동 원리")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - Supporting Views
struct PerformanceMetric: View {
    let title: String
    let value: String
    let progress: Double
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(title)
                    .font(.subheadline)
                Spacer()
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.semibold)
            }
            
            ProgressView(value: progress)
                .tint(color)
        }
    }
}

struct ModelStepView: View {
    let step: Int
    
    var stepInfo: (title: String, description: String, icon: String) {
        switch step {
        case 1:
            return ("Tier 1: 측정소 데이터", "주변 측정소 데이터 수집 및 IDW 보간", "location.circle")
        case 2:
            return ("Tier 2: 카메라 분석", "하늘 사진 CNN-LSTM 분석", "camera")
        case 3:
            return ("Tier 3: 위성 데이터", "Sentinel-5P AOD 데이터 변환", "antenna.radiowaves.left.and.right")
        default:
            return ("", "", "")
        }
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.blue)
                    .frame(width: 40, height: 40)
                Text("\(step)")
                    .foregroundColor(.white)
                    .fontWeight(.bold)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: stepInfo.icon)
                        .foregroundColor(.blue)
                    Text(stepInfo.title)
                        .font(.headline)
                }
                Text(stepInfo.description)
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
            
            Spacer()
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(10)
        .padding(.horizontal)
    }
}

struct TechStackRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            
            Spacer()
        }
    }
}

#Preview {
    SettingsView()
}
