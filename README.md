# AirLens (Finedust) - PM2.5 Prediction iOS App

## 📱 프로젝트 개요
AirLens는 스마트폰 카메라를 활용하여 실시간 대기질(PM2.5)을 측정하고 예측하는 혁신적인 iOS 애플리케이션입니다.

### 주요 기능
- 📷 **Camera-based PM2.5 예측**: CNN-LSTM 모델을 사용한 실시간 대기질 측정
- 🌍 **3D Globe 시각화**: 전 세계 대기질 데이터 실시간 표시
- ✅ **Triple Verification**: Station + Camera + Satellite 데이터 융합
- 📍 **위치 기반 서비스**: 현재 위치의 정확한 대기질 정보 제공

## 🚀 빠른 시작

### 요구사항
- iOS 15.4+
- iPhone 12+ (A14 Bionic 이상)
- Xcode 14.0+

### 설치 및 실행
```bash
# 1. 프로젝트 열기
open Finedust.xcodeproj

# 2. 시뮬레이터 또는 실제 디바이스 선택
# 3. Build & Run (Cmd + R)
```

## 📂 프로젝트 구조

```
Finedust/
├── App/                      # 앱 엔트리 포인트
│   └── FinedustApp.swift
├── Models/                   # 데이터 모델
│   ├── DataModels.swift
│   ├── EnhancedMeasurementManager.swift
│   └── MeasurementState.swift
├── Views/                    # UI 뷰
│   ├── HomeScreenView.swift          # 메인 화면
│   ├── MainMeasurementView.swift     # 측정 화면
│   ├── EnhancedCameraView.swift      # 카메라 뷰 (주요)
│   ├── GlobeView.swift               # 3D 지구본
│   └── CrossValidationView.swift     # 검증 대시보드
├── ViewModels/              # 뷰 모델
│   ├── CameraViewModel.swift
│   └── GlobeViewModel.swift
├── Services/                # 비즈니스 로직
│   ├── FusionService.swift          # 데이터 융합
│   ├── LocationService.swift        # 위치 서비스 (주요)
│   ├── NetworkService.swift         # API 통신
│   ├── PM25PredictionService.swift  # ML 예측
│   ├── SatelliteService.swift       # 위성 데이터
│   └── StationService.swift         # 측정소 데이터
└── Utilities/              # 유틸리티
    ├── Constants.swift
    ├── Colors.swift
    └── Extensions.swift
```

## 🔧 주요 컴포넌트

### 1. 측정 프로세스
1. **위치 획득**: GPS를 통한 현재 위치 파악
2. **Tier 1**: 주변 측정소 데이터 수집 (IDW 보간)
3. **Tier 2**: 카메라 촬영 및 CNN-LSTM 예측
4. **Tier 3**: 위성 AOD 데이터 수집
5. **융합**: Bayesian Fusion으로 최종 PM2.5 계산

### 2. 핵심 알고리즘
- **IDW (Inverse Distance Weighting)**: 주변 측정소 데이터 보간
- **CNN-LSTM**: 이미지 기반 PM2.5 예측
- **Bayesian Fusion**: 다중 소스 데이터 융합

## 📊 성능 지표
- **정확도**: RMSE 8.1 μg/m³, R² 0.931
- **지연시간**: <10초 (GPS→예측)
- **신뢰도**: 95-98% (모든 소스 일치 시)
- **배터리**: 예측당 <2% 소모

## 📚 문서
- [빌드 가이드](Documentation/BuildGuides/) - 빌드 오류 해결
- [빠른 시작](Documentation/QuickStart/) - 시작 가이드
- [통합 계획](Documentation/INTEGRATION_PLAN.md) - 개발 계획

## 🤝 기여하기
프로젝트 기여를 환영합니다! Pull Request를 보내주세요.

## 📝 라이선스
MIT License

## 📧 연락처
- Email: joymin@airlens.app
- GitHub: github.com/joymin/airlens
