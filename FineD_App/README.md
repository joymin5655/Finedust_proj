# AirLens - iOS Air Quality Monitoring App

iOS 네이티브 대기질 모니터링 애플리케이션 (Finedust 프로젝트에서 수집)

## 📱 프로젝트 구조

```
├── iOS_App/                      # ✅ iOS 앱 소스 코드 (48개 Swift 파일)
│   ├── AirLens/                  # 새로 개발한 iOS 앱 (21개 파일)
│   │   ├── App/                  # 앱 엔트리 포인트
│   │   ├── Models/               # 데이터 모델
│   │   ├── ViewModels/           # 뷰모델 (MVVM)
│   │   ├── Views/                # SwiftUI 뷰
│   │   ├── Services/             # API, 위치, 카메라 서비스
│   │   └── Utilities/            # 확장 및 상수
│   │
│   ├── AirLens_Complete/         # Finedust_proj의 완전한 iOS 앱 (17개 파일)
│   │   ├── App/
│   │   ├── Models/
│   │   ├── ViewModels/
│   │   ├── Views/
│   │   ├── Services/
│   │   ├── Utilities/
│   │   ├── Info.plist
│   │   ├── README.md
│   │   └── *.sh                  # 빌드 스크립트
│   │
│   └── FineD_App/                # Finedust_proj의 다른 iOS 앱 (10개 파일)
│       └── FineD_App/
│           ├── App/
│           ├── Networking/
│           ├── Services/
│           └── ViewModels/
│
├── Del_file/                     # ✅ 정리 예정 파일 (iOS 관련 없음)
│   ├── Ai_studio/                # React/TypeScript 웹 앱 (193KB)
│   ├── Backend/                  # Python FastAPI 백엔드 (70MB)
│   ├── OLD_README.md             # 이전 README
│   └── Original_gitignore        # 원본 .gitignore
│
├── .gitignore                    # Git 제외 규칙
├── README.md                     # 이 파일
└── PROJECT_VALIDATION.md         # 프로젝트 검증 보고서
```

## 📊 iOS 앱 비교

| 프로젝트 | Swift 파일 | 특징 | 상태 |
|---------|-----------|------|------|
| **AirLens** | 21개 | 새로 개발한 완전한 iOS 앱 | ✅ 완료 |
| **AirLens_Complete** | 17개 | Finedust_proj의 원본 iOS 앱 | ✅ 완료 |
| **FineD_App** | 10개 | Finedust_proj의 또 다른 iOS 앱 | ✅ 포함 |

### AirLens (신규 개발)
- **위치**: `iOS_App/AirLens/`
- **파일 수**: 21개 Swift 파일
- **아키텍처**: MVVM + SwiftUI
- **특징**:
  - 완전히 새로 개발된 iOS 앱
  - React 웹 앱에서 Swift로 완전 변환
  - 최신 SwiftUI 및 Combine 사용
  - 포괄적인 기능 구현

### AirLens_Complete (원본)
- **위치**: `iOS_App/AirLens_Complete/`
- **파일 수**: 17개 Swift 파일
- **특징**:
  - Finedust_proj의 원본 iOS 앱
  - 빌드 스크립트 포함
  - README 및 문서 포함
  - Backend 연동 스크립트

### FineD_App
- **위치**: `iOS_App/FineD_App/`
- **파일 수**: 10개 Swift 파일
- **특징**:
  - Finedust_proj의 또 다른 iOS 구현
  - 네트워킹 계층 중심
  - ML 서비스 포함

## ✨ 주요 기능 (공통)

### 📸 AI 기반 PM2.5 예측
- iPhone 카메라로 하늘 촬영
- 머신러닝을 통한 PM2.5 농도 예측
- 실시간 분석 결과 표시

### 🌍 글로벌 대기질 모니터링
- 전 세계 측정소 데이터
- 인터랙티브 지도 뷰
- 실시간 PM2.5/PM10 수치

### 📊 통계 및 분석
- 대기질 통계
- 모델 성능 지표
- 데이터 소스 정보

### 📋 환경 정책 추적
- 국가별 환경 정책
- 신뢰도 점수
- 카테고리별 분류

## 🚀 시작하기

### 요구사항

- Xcode 14.0 이상
- iOS 15.0 이상
- Swift 5.9 이상

### 어떤 앱을 사용할까?

1. **AirLens (권장)** - 가장 최신이며 완전한 구현
   ```bash
   cd iOS_App/AirLens
   # Xcode에서 열기
   ```

2. **AirLens_Complete** - 원본 Finedust_proj 앱
   ```bash
   cd iOS_App/AirLens_Complete
   # README.md 참조
   ```

3. **FineD_App** - 또 다른 구현
   ```bash
   cd iOS_App/FineD_App
   ```

## 🗂️ Del_file 폴더 내용

### Ai_studio (웹 앱)
- React + TypeScript 웹 애플리케이션
- Vite 빌드 도구
- 크기: 193KB

### Backend (서버)
- Python FastAPI 서버
- PM2.5 예측 API
- 크기: 70MB (venv 포함)

### 기타
- 이전 README 및 설정 파일

## 📝 API 설정

각 앱의 `Services/APIService.swift` 또는 `APIClient.swift` 파일에서 백엔드 URL 설정:

```swift
private let baseURL = "YOUR_BACKEND_URL"
```

백엔드 실행:
```bash
cd Del_file/Backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🏗️ 아키텍처

모든 iOS 앱은 MVVM 패턴을 사용합니다:

- **패턴**: MVVM (Model-View-ViewModel)
- **UI 프레임워크**: SwiftUI
- **리액티브 프로그래밍**: Combine
- **네트워킹**: URLSession + async/await
- **위치 서비스**: CoreLocation
- **카메라**: AVFoundation

## 📚 문서

- **프로젝트 검증**: `PROJECT_VALIDATION.md`
- **AirLens 앱 문서**: `iOS_App/AirLens/README.md`
- **AirLens_Complete 문서**: `iOS_App/AirLens_Complete/README.md`
- **원본 프로젝트**: https://github.com/joymin5655/Finedust_proj

## 🔄 프로젝트 히스토리

1. **ea14df0** - 초기 저장소 생성
2. **daf2960** - React 앱을 Swift로 변환
3. **02775b4** - iOS_App 폴더로 재구성
4. **0a75afa** - 프로젝트 검증 보고서 추가
5. **현재** - Finedust_proj의 모든 iOS 앱 통합

## 📄 라이센스

MIT License

---

**Made with ❤️ for cleaner air**
