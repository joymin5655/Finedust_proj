# AirLens Complete iOS App Structure

## 프로젝트 구조
```
AirLens_Complete/
├── App/
│   ├── AirLensApp.swift          # 메인 앱 진입점
│   └── ContentView.swift          # 메인 탭 뷰
│
├── Models/
│   ├── Station.swift              # 측정소 데이터 모델
│   ├── AirPolicy.swift            # 정책 데이터 모델
│   └── PredictionResult.swift     # AI 예측 결과 모델
│
├── ViewModels/
│   ├── StationViewModel.swift     # 측정소 비즈니스 로직
│   ├── PolicyViewModel.swift      # 정책 비즈니스 로직
│   ├── CameraViewModel.swift      # 카메라/AI 예측 로직
│   └── GlobeViewModel.swift       # 3D 지구본 로직
│
├── Views/
│   ├── GlobeView.swift           # 3D 지구본 뷰
│   ├── CameraView.swift          # 카메라/예측 뷰
│   ├── PoliciesView.swift        # 정책 리스트 뷰
│   ├── StatsView.swift           # 통계 대시보드 뷰
│   └── Components/
│       ├── StationCard.swift     # 측정소 카드 컴포넌트
│       ├── PolicyCard.swift      # 정책 카드 컴포넌트
│       └── LoadingView.swift     # 로딩 인디케이터
│
├── Services/
│   ├── APIClient.swift           # API 통신 서비스
│   ├── LocationService.swift     # 위치 서비스
│   ├── StorageService.swift      # 로컬 저장소 서비스
│   └── CameraService.swift       # 카메라 서비스
│
├── Utilities/
│   ├── Extensions.swift          # 확장 기능
│   ├── Constants.swift           # 상수 정의
│   └── Helpers.swift             # 도우미 함수
│
├── Resources/
│   ├── Assets.xcassets/          # 이미지, 아이콘
│   └── Info.plist                # 앱 권한 설정
│
└── Backend/
    └── main.py                   # Python FastAPI 서버
```