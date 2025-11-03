# 🎭 Mock Mode 업데이트 - 변경사항 요약

## 📋 개요

Gemini API 없이도 앱을 실행할 수 있도록 **Mock Mode**를 추가했습니다!

---

## ✨ 주요 변경사항

### 1. GeminiAPIService.swift
- ✅ `useMockData` 플래그 추가 (기본값: true)
- ✅ `hasAPIKey` 속성 추가
- ✅ Mock 이미지 분석 함수 추가
  - 이미지 밝기 기반 PM2.5 계산
  - 현실적인 confidence 값 생성
- ✅ Mock 위치 정보 함수 추가
  - 좌표 기반 도시 매핑 (한국, 일본, 중국, 미국, 유럽 등)
- ✅ API 키 자동 검증
  - 키 없음 → Mock Mode 자동 활성화
  - "YOUR_GEMINI_API_KEY" → Mock Mode
  - 빈 문자열 → Mock Mode

### 2. LocationService.swift
- ✅ **CoreLocation Geocoder** 통합
  - Gemini API 대신 iOS 내장 Geocoder 사용
  - 실제 주소 → 도시/국가 변환
- ✅ Geocoding 실패 시 Mock 데이터 fallback
- ✅ 지역별 Mock 위치 데이터
  - 한국: 서울, 부산, 인천, 대구, 수원
  - 일본: 도쿄, 오사카, 교토, 요코하마, 삿포로
  - 중국: 베이징, 상하이, 광저우, 선전, 청두
  - 미국: 뉴욕, LA, 시카고, 휴스턴, 피닉스
  - 유럽: 런던, 파리, 베를린, 마드리드, 로마
  - 동남아: 싱가포르, 방콕, 마닐라, 쿠알라룸푸르, 자카르타

### 3. SettingsView.swift
- ✅ **Developer Settings** 섹션 추가
- ✅ **Mock Data Mode** 토글
  - ON/OFF 전환
  - 실시간 GeminiAPIService 업데이트
- ✅ **API Status** 인디케이터
  - 🟢 초록: Real API 연결됨
  - 🟠 주황: Mock Mode 사용 중
- ✅ 상태 메시지 표시

### 4. CameraView.swift
- ✅ 상단에 **Mock Mode 인디케이터** 추가
  - 🌙 "Mock Mode" 배지
  - 주황색 배경
  - Mock Mode일 때만 표시

### 5. Info.plist
- ✅ API 키 주석 업데이트
  - "OPTIONAL" 명시
  - Mock Mode 설명 추가
  - 설정 방법 안내

---

## 📁 수정된 파일 목록

```
AirLens-iOS/
├── AirLens/
│   ├── Services/
│   │   ├── GeminiAPIService.swift    ⚠️ 주요 변경
│   │   └── LocationService.swift     ⚠️ 주요 변경
│   ├── Views/
│   │   ├── SettingsView.swift        ⚠️ 주요 변경
│   │   └── CameraView.swift          ✏️ 소규모 변경
│   └── Info.plist                    ✏️ 주석 업데이트
├── README.md                          ⚠️ 전면 개편
├── QUICKSTART.md                      ⚠️ 전면 개편
└── create_xcode_project.sh            (변경 없음)
```

---

## 🎯 Mock Mode 작동 방식

### 이미지 분석

```swift
// 이미지 밝기 계산
let brightness = calculateImageBrightness(image)

// 밝기 기반 PM2.5 추정
밝은 하늘 (0.7+)  → PM2.5: 5-20   (Good)
보통 하늘 (0.4+)  → PM2.5: 25-50  (Moderate)
어두운 하늘 (<0.4) → PM2.5: 60-120 (Unhealthy)
```

### 위치 정보

```swift
// CoreLocation Geocoder 우선
CLGeocoder().reverseGeocodeLocation(location) { placemark, error in
    if success {
        // 실제 주소 사용
        city = placemark.locality
        country = placemark.country
    } else {
        // Mock 데이터 fallback
        (city, country) = mockLocationFromCoordinates(lat, lon)
    }
}
```

### 측정소 데이터

```swift
// 현실적인 랜덤 값
let pm25 = 10 + Double.random(in: 0...45)  // 10-55 범위
let confidence = 0.85 + Double.random(in: 0...0.1)  // 85-95%
```

---

## 🔄 전환 방법

### Mock Mode → Real API

1. **Gemini API 키 발급**
   - https://ai.google.dev/
   - "Get API Key" 클릭

2. **Info.plist 수정**
   ```xml
   <key>GEMINI_API_KEY</key>
   <string>YOUR_ACTUAL_API_KEY_HERE</string>
   ```

3. **Settings에서 전환**
   - Settings → Developer Settings
   - Mock Data Mode → OFF

### Real API → Mock Mode

1. **Settings에서 전환**
   - Mock Data Mode → ON

또는

2. **Info.plist 리셋**
   ```xml
   <key>GEMINI_API_KEY</key>
   <string>YOUR_GEMINI_API_KEY</string>
   ```

---

## ✅ 테스트 체크리스트

### Mock Mode 테스트
- [ ] API 키 없이 앱 실행
- [ ] 상단에 🌙 Mock Mode 배지 표시
- [ ] 카메라 캡처 작동
  - [ ] 밝은 이미지 → 낮은 PM2.5
  - [ ] 어두운 이미지 → 높은 PM2.5
- [ ] 이미지 업로드 작동
- [ ] 측정소 데이터 작동
- [ ] 위치 정보 표시
  - [ ] Geocoder 성공 시 실제 주소
  - [ ] Geocoder 실패 시 Mock 주소
- [ ] Settings에서 Mock Mode ON/OFF 전환
- [ ] API Status 표시 확인

### Real API 테스트
- [ ] API 키 설정
- [ ] Mock Mode OFF
- [ ] 상단에 Mock Mode 배지 없음
- [ ] Settings에서 🟢 초록 상태
- [ ] 실제 AI 분석 작동
- [ ] 실제 위치 정보 작동

---

## 📊 성능 비교

| 작업 | Mock Mode | Real API |
|------|-----------|----------|
| 이미지 분석 | ~1초 | ~2-3초 |
| 위치 정보 | ~0.5초 | ~1-2초 |
| 측정소 데이터 | ~1.5초 | ~1.5초 |
| **총계** | **~3초** | **~5-7초** |

---

## 🎉 혜택

### 개발자
- ⚡ 빠른 개발 사이클
- 💰 API 할당량 절약
- 🔌 오프라인 개발 가능
- 🧪 일관된 테스트 환경

### 사용자
- 🚀 즉시 시작 가능
- 📱 API 키 설정 불필요
- 🌐 인터넷 없이도 테스트
- 🎭 데모 모드로 활용

---

## 🚨 주의사항

### Mock Mode 제한사항
- 정확도가 실제 AI보다 낮음
- 단순한 밝기 기반 추정
- 날씨, 시간대 등 고려 안 함

### 권장사항
- **개발/테스트**: Mock Mode 사용 ✅
- **실제 사용**: Real API 사용 ✅
- **데모**: Mock Mode 사용 ✅
- **정확한 분석**: Real API 사용 ✅

---

## 📝 다음 단계

### 즉시
1. Xcode에서 프로젝트 열기
2. **Cmd + R** 실행
3. Mock Mode로 테스트

### 나중에 (선택사항)
1. Gemini API 키 발급
2. Info.plist 설정
3. Settings에서 Real API 활성화

---

## 🎓 학습 포인트

### Swift 패턴
- ✅ Singleton Pattern (GeminiAPIService)
- ✅ Delegate Pattern (LocationService)
- ✅ MVVM Architecture
- ✅ Async/Await
- ✅ Error Handling
- ✅ Feature Flags (useMockData)

### iOS 기능
- ✅ CoreLocation
- ✅ CLGeocoder
- ✅ AVFoundation
- ✅ SwiftUI
- ✅ Combine

---

## 💡 팁

### 디버깅
```swift
// Console에서 확인
🎭 Mock Mode: ENABLED
📍 Location found: Seoul, South Korea 🇰🇷
🎭 Mock Analysis: PM2.5=15.0, Confidence=0.87
```

### 개발 워크플로우
1. Mock Mode로 UI 개발
2. Mock Mode로 테스트
3. Real API로 최종 검증

---

**🎉 준비 완료! 지금 바로 시작하세요!**

```bash
cd AirLens-iOS
# Xcode에서 Cmd + R
```
