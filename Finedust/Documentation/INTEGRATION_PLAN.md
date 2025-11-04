# AirLens → Finedust 프로젝트 통합 계획

## 📋 작업 개요
AirLens-iOS의 모든 코드를 Finedust 프로젝트로 이전하여 작동하는 앱 구축

---

## 🎯 통합 단계

### Phase 1: 폴더 구조 생성 ✅
```
Finedust/Finedust/
├── Models/           # 데이터 모델
├── Views/            # UI 화면
├── ViewModels/       # 비즈니스 로직
├── Services/         # 서비스 레이어
├── Utilities/        # 유틸리티
└── Resources/        # 리소스 파일
```

### Phase 2: 파일 복사 📦
**복사할 파일:**
- Models/DataModels.swift
- Views/ (6개 파일)
- ViewModels/CameraViewModel.swift
- Services/ (2개 파일: PM25PredictionService, LocationService)
- Utilities/ (3개 파일)

### Phase 3: 메인 파일 교체 🔄
- FinedustApp.swift → AirLensApp.swift 코드 적용
- ContentView.swift → AirLens 버전으로 교체

### Phase 4: 설정 및 검증 ⚙️
- Info.plist 설정 추가
- 빌드 테스트
- 최종 검증

---

**시작 시간**: 2025-11-03
**예상 소요 시간**: 5-10분
