# AirLens iOS - 미세먼지 예측 네이티브 앱

## 프로젝트 개요
AirLens는 카메라로 하늘을 촬영하여 AI가 미세먼지(PM2.5) 수치를 예측하는 iOS 네이티브 앱입니다.

## 주요 기능
- 📸 **카메라 캡처**: 하늘 사진 촬영으로 실시간 대기질 분석
- 🤖 **AI 분석**: Google Gemini API를 통한 이미지 기반 PM2.5 예측
- 📍 **위치 기반**: 현재 위치의 대기질 정보 제공
- 🌍 **글로벌 맵**: 전세계 대기질 모니터링 스테이션 시각화
- 📊 **데이터 소스**: 여러 소스(카메라, 측정소, 위성)의 데이터 통합

## 기술 스택
- **Language**: Swift 5.9+
- **Framework**: SwiftUI
- **iOS Version**: iOS 16.0+
- **API**: Google Gemini 2.5 Flash
- **Architecture**: MVVM

## 프로젝트 구조

```
AirLens-iOS/
├── AirLens/
│   ├── AirLensApp.swift          # 앱 진입점
│   ├── Info.plist                # 앱 설정 및 권한
│   ├── Models/
│   │   └── DataModels.swift      # 데이터 모델 정의
│   ├── Views/
│   │   ├── ContentView.swift     # 메인 네비게이션
│   │   ├── CameraView.swift      # 카메라 캡처 화면
│   │   ├── AnimatedGlobeView.swift # 애니메이션 글로브
│   │   ├── ResultsDisplayView.swift # 결과 표시 화면
│   │   ├── GlobeView.swift       # 전세계 맵 화면
│   │   └── SettingsView.swift    # 설정 화면
│   ├── ViewModels/
│   │   └── CameraViewModel.swift # 카메라 비즈니스 로직
│   ├── Services/
│   │   ├── GeminiAPIService.swift # Gemini API 통신
│   │   └── LocationService.swift  # 위치 서비스
│   └── Utilities/
│       ├── CameraPickerView.swift # 카메라 캡처 유틸
│       ├── ImagePicker.swift      # 이미지 피커
│       └── Colors.swift           # 색상 정의
└── README.md
```

## Xcode 프로젝트 생성 방법

### 1. Xcode에서 새 프로젝트 생성

1. Xcode를 실행합니다
2. "Create a new Xcode project" 선택
3. "iOS" → "App" 템플릿 선택
4. 프로젝트 정보 입력:
   - **Product Name**: AirLens
   - **Team**: 본인의 Apple Developer 계정
   - **Organization Identifier**: com.yourname
   - **Interface**: SwiftUI
   - **Language**: Swift
5. 저장 위치를 `/Users/joymin/Coding_proj/Finedust_proj/` 선택
6. **중요**: 기존 AirLens-iOS 폴더를 덮어쓰지 말고, 새로 생성된 프로젝트를 닫은 후 아래 단계를 따라하세요

### 2. 기존 파일 통합


**방법 A: 간단한 방법 (권장)**

터미널에서 다음 스크립트를 실행하세요:

```bash
cd /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS

# Xcode 프로젝트 생성
xcodebuild -project AirLens.xcodeproj \
    -scheme AirLens \
    -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

**방법 B: 수동 방법**

1. Xcode에서 "File" → "New" → "Project..."
2. iOS → App 선택
3. Product Name: AirLens
4. Interface: SwiftUI, Language: Swift
5. 생성 후 프로젝트 네비게이터에서:
   - 기존 ContentView.swift 삭제
   - "Add Files to AirLens..." 선택
   - `/Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS/AirLens` 폴더의 모든 파일 추가

### 3. Info.plist 설정

1. 프로젝트 네비게이터에서 `Info.plist` 선택
2. 다음 키들이 있는지 확인:
   - `NSCameraUsageDescription`
   - `NSPhotoLibraryUsageDescription`
   - `NSLocationWhenInUseUsageDescription`
   - `GEMINI_API_KEY`

3. **중요**: `GEMINI_API_KEY` 값을 실제 API 키로 변경하세요

### 4. API 키 발급

Google Gemini API 키가 필요합니다:

1. https://ai.google.dev/ 접속
2. "Get API Key" 클릭
3. 새 프로젝트 생성 또는 기존 프로젝트 선택
4. API 키 복사
5. `Info.plist`에서 `GEMINI_API_KEY` 값을 복사한 키로 변경

### 5. 빌드 및 실행

1. Xcode에서 시뮬레이터 또는 실제 기기 선택
2. `Cmd + R` 또는 상단의 ▶️ 버튼 클릭
3. 앱 실행 후:
   - 카메라 권한 허용
   - 위치 권한 허용
   - 하늘 사진 촬영 또는 업로드


## 주요 화면

### 1. 카메라 뷰 (CameraView)
- 🎯 중앙 애니메이션 글로브
- 📸 하늘 촬영 버튼
- 📤 이미지 업로드
- 📡 측정소 데이터 확인
- 📍 현재 위치 표시

### 2. 결과 화면 (ResultsDisplayView)
- 🔢 PM2.5 수치 표시
- 📊 신뢰도 및 불확실성
- 📈 데이터 소스 분석 (측정소/카메라/위성)
- 🎨 AQI 레벨별 색상 구분

### 3. 글로브 뷰 (GlobeView)
- 🌍 전세계 모니터링 스테이션
- 📍 실시간 AQI 표시
- 🗺️ 인터랙티브 맵

### 4. 설정 (SettingsView)
- 🌓 다크모드 전환
- 🌐 언어 설정
- 📚 데이터 소스 정보
- ℹ️ 앱 정보

## AQI 레벨 기준

| PM2.5 (μg/m³) | 레벨 | 색상 | 설명 |
|---------------|------|------|------|
| 0-12 | Good | 🟢 Green | 대기질 우수 |
| 13-35 | Moderate | 🟡 Yellow | 보통 |
| 36-55 | Unhealthy for Sensitive | 🟠 Orange | 민감군 영향 |
| 56-150 | Unhealthy | 🔴 Red | 나쁨 |
| 151-250 | Very Unhealthy | 🟣 Purple | 매우 나쁨 |
| 251+ | Hazardous | 🟤 Maroon | 위험 |

## 개발 가이드

### 필수 요구사항
- macOS 14.0 (Sonoma) 이상
- Xcode 15.0 이상
- iOS 16.0+ 테스트 기기 또는 시뮬레이터
- Google Gemini API 키

### 의존성
이 프로젝트는 외부 라이브러리를 사용하지 않습니다.
모든 기능은 Swift 표준 라이브러리와 iOS SDK로 구현되었습니다.


### 빌드 설정

**Deployment Target**: iOS 16.0
**Supported Devices**: iPhone, iPad
**Orientations**: Portrait only

### 디버깅

로그 확인:
```swift
// Xcode Console에서 다음과 같은 로그를 확인할 수 있습니다
print("📍 Location: \(latitude), \(longitude)")
print("🤖 AI Analysis: PM2.5 = \(pm25)")
print("📊 Confidence: \(confidence * 100)%")
```

## 문제 해결

### 카메라가 작동하지 않음
1. Info.plist에 `NSCameraUsageDescription` 확인
2. 설정 → 개인정보 보호 → 카메라에서 AirLens 권한 확인
3. 시뮬레이터에서는 카메라 사용 불가 (실제 기기 필요)

### API 요청 실패
1. `GEMINI_API_KEY`가 올바르게 설정되었는지 확인
2. 인터넷 연결 확인
3. API 할당량 확인 (https://console.cloud.google.com/)
4. Console에서 에러 메시지 확인

### 위치를 가져올 수 없음
1. Info.plist에 `NSLocationWhenInUseUsageDescription` 확인
2. 설정 → 개인정보 보호 → 위치 서비스에서 AirLens 권한 확인
3. 위치 서비스가 켜져 있는지 확인

### 빌드 에러
1. Xcode를 최신 버전으로 업데이트
2. Clean Build Folder (`Cmd + Shift + K`)
3. Derived Data 삭제:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

## 향후 개선 사항

- [ ] Core ML 모델 통합 (오프라인 예측)
- [ ] 히스토리 기능 (과거 측정 기록)
- [ ] 위젯 지원
- [ ] Apple Watch 앱
- [ ] 푸시 알림 (대기질 악화 시)
- [ ] 공유 기능 (소셜 미디어)
- [ ] AR 뷰 (증강현실로 대기질 시각화)

## 라이선스

이 프로젝트는 개인 학습 및 연구 목적으로 제작되었습니다.

## 기여

버그 리포트나 기능 제안은 Issues에 등록해 주세요.

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ for Clean Air**

## 🎭 Mock Mode - API 키 없이 바로 시작!

### 빠른 시작 (API 키 불필요)

앱을 바로 실행할 수 있습니다! Gemini API 키가 없어도 **Mock Mode**가 자동으로 활성화됩니다.

```bash
# 1. Xcode에서 프로젝트 열기
open AirLens.xcodeproj

# 2. 그냥 실행하기 (Cmd + R)
# API 키 설정 없이 바로 작동합니다!
```

### Mock Mode란?

Mock Mode는 실제 API를 사용하지 않고 시뮬레이션된 데이터로 앱을 테스트할 수 있게 해줍니다:

- ✅ **API 키 불필요** - 즉시 실행 가능
- ✅ **무료** - API 할당량 걱정 없음
- ✅ **오프라인** - 인터넷 연결 불필요
- ✅ **빠름** - API 대기 시간 없음
- ✅ **실제 같은 데이터** - 이미지 밝기 기반 PM2.5 계산
- ✅ **위치 기반** - 좌표에 맞는 도시 이름

### Mock Mode 작동 방식

#### 1. 이미지 분석
- 이미지의 **밝기를 분석**하여 PM2.5 추정
- 밝은 하늘 = 좋은 공기질 (5-20 μg/m³)
- 흐린 하늘 = 보통 공기질 (25-50 μg/m³)
- 어두운 하늘 = 나쁜 공기질 (60-120 μg/m³)

#### 2. 위치 정보
- **CoreLocation Geocoder** 사용 (iOS 내장)
- 실제 주소 → 도시 이름, 국가 코드
- Geocoding 실패 시 → 좌표 기반 Mock 데이터

#### 3. 측정소 데이터
- 랜덤하지만 현실적인 PM2.5 값 (10-50 μg/m³)

### Mock Mode vs Real API

| 기능 | Mock Mode | Real API |
|------|-----------|----------|
| API 키 | ❌ 불필요 | ✅ 필요 |
| 인터넷 | ❌ 불필요 | ✅ 필요 |
| 비용 | 💰 무료 | 💰 무료 (할당량 제한) |
| 정확도 | 📊 시뮬레이션 | 🎯 AI 분석 |
| 속도 | ⚡ 즉시 | 🌐 1-3초 |
| 위치 | 📍 Geocoder | 📍 Gemini |

### Mock Mode 사용하기

#### 설정에서 전환

1. 앱 실행
2. ⚙️ **Settings** 탭
3. **Developer Settings** 섹션
4. **Mock Data Mode** 토글

```
ON  → 🎭 Mock Mode (API 키 불필요)
OFF → 🌐 Real API (API 키 필요)
```

#### 자동 활성화

다음 경우에 자동으로 Mock Mode가 활성화됩니다:
- Info.plist에 API 키가 없을 때
- API 키가 "YOUR_GEMINI_API_KEY"일 때
- API 키가 빈 문자열일 때

