# CLAUDE.md - AirLens Project Guide

## 📋 프로젝트 개요

**AirLens - 대기질 모니터링 & AI 예측 앱**
- iOS 앱: 실시간 전지구 대기질 데이터 시각화
- 카메라 AI: iOS 카메라 입력으로 PM 농도 예측
- 정책 통합: 국가별 대기질 개선 정책 통합

## ✅ 읽을 파일 (우선순위)

### 1단계: 아키텍처 이해 (필수)
- `Globe_fd/App/ContentView.swift` - 메인 UI (4개 탭)
- `Globe_fd/ViewModels/` - 비즈니스 로직 (Station, Policy, Camera)
- `Globe_fd/Networking/Models.swift` - 데이터 구조

### 2단계: 구체적 문제 해결 (필요시)
- `Globe_fd/Networking/APIClient.swift` - API 통신
- `Globe_fd/Services/LocationService.swift` - 위치 서비스
- `Globe_fd/Services/CameraService.swift` - 카메라 처리

### 3단계: 상세 구현 (심화 분석 시)
- `Globe_fd/Services/` - 모든 서비스 (ML, Storage)
- Test 파일들

## ❌ 읽지 말아야 할 디렉토리

```
.DS_Store                # macOS 시스템 파일
.git/                    # Git 메타데이터
.xcodeproj/xcuserdata/  # Xcode 사용자 데이터
*.xcworkspace/          # Workspace 설정
```

## 📁 프로젝트 구조

```
Globe_fd/
├── App/
│   ├── Globe_fdApp.swift      # Entry point
│   └── ContentView.swift      # Main UI (4 tabs)
├── Networking/
│   ├── APIClient.swift        # API calls
│   ├── Models.swift           # Data structures
│   └── NetworkManager.swift   # Network utilities
├── ViewModels/
│   ├── StationViewModel.swift # 측정소 데이터
│   ├── PolicyViewModel.swift  # 정책 데이터
│   └── CameraViewModel.swift  # 카메라 AI
├── Services/
│   ├── LocationService.swift  # GPS 위치
│   ├── CameraService.swift    # 카메라 캡처
│   ├── MLService.swift        # ML 추론
│   └── StorageService.swift   # 저장소
├── Views/
│   ├── CameraView.swift       # 카메라 UI
│   ├── GlobeView.swift        # 지구본 시각화
│   ├── PoliciesView.swift     # 정책 목록
│   └── GlobeViewController.swift
├── Info.plist                 # 권한 설정
└── Assets.xcassets           # 이미지/아이콘
```

## 🎯 4개 탭 기능

### 1️⃣ Globe 탭 (🌍)
- 전 지구 측정소 데이터 표시
- PM2.5 농도에 따른 색상 (녹/노/주/빨)
- 국가별 측정소 정보

### 2️⃣ Camera 탭 (📸)
- 사진 라이브러리에서 이미지 선택
- AI 모델로 PM 농도 예측
- 신뢰도 점수 표시

### 3️⃣ Policies 탭 (📋)
- 국가별 대기질 개선 정책
- 정책 신뢰도 점수
- 정책 상세 정보

### 4️⃣ Stats 탭 (📊)
- 측정소/정책 통계
- 최고/최저 PM2.5 순위
- 요약 통계

## 💡 기술 스택

| 항목 | 기술 |
|------|------|
| UI | SwiftUI |
| 데이터 | Codable (JSON) |
| 위치 | CoreLocation |
| 카메라 | AVFoundation |
| 비동기 | async/await |
| 아키텍처 | MVVM |

## 🔑 핵심 개념

### PM (Particulate Matter) 분류
```
PM2.5 ≤ 12   → Good (초록)
PM2.5 ≤ 35   → Moderate (노랑)
PM2.5 ≤ 55   → Unhealthy (주황)
PM2.5 ≤ 150  → Very Unhealthy (빨강)
PM2.5 > 150  → Hazardous (검정)
```

### API 구조
```
/api/stations  - 측정소 데이터 (lat, long, PM2.5, 국가)
/api/policies  - 정책 데이터 (제목, URL, 신뢰도)
/api/predict   - AI 예측 (이미지 업로드 → PM 예측)
```

## 🚀 빠른 시작

### 1. 백엔드 실행
```bash
pip install fastapi uvicorn
python main.py
# http://127.0.0.1:8000
```

### 2. Xcode 실행
```
Cmd + B (Build)
Cmd + R (Run)
```

### 3. 앱 테스트
- Globe: 3개 측정소 표시
- Camera: 이미지 선택 가능
- Policies: 2개 정책 표시
- Stats: 통계 카드

## 📊 API 응답 예시

### /api/stations
```json
{
  "status": "success",
  "count": 3,
  "data": [
    {
      "id": "seoul_1",
      "name": "Seoul Center",
      "latitude": 37.5665,
      "longitude": 126.9780,
      "country": "South Korea",
      "pm25": 28.5,
      "pm10": 45.2,
      "source": "WAQI",
      "last_updated": "2025-11-05T10:00:00Z"
    }
  ]
}
```

## 🛠️ 일반적인 문제 해결

### 오류: "Cannot find 'Station' in scope"
1. Models.swift의 Target Membership 확인
2. Build Settings에서 검색 경로 확인

### 오류: "Cannot connect to API"
1. 백엔드가 실행 중인지 확인
2. http://localhost:8000/health 테스트
3. 네트워크 권한 확인

### 오류: "Image picker 안 열림"
1. Info.plist에서 NSPhotoLibraryUsageDescription 확인
2. 시뮬레이터 권한 재설정

## 📞 추가 도움

현재 완성도: **100% (기본 기능 완성)**
- ✅ 4개 탭 UI
- ✅ API 통신
- ✅ 카메라 입력
- ✅ 정책 표시
- ✅ 통계 대시보드

---
마지막 업데이트: 2025-11-05
