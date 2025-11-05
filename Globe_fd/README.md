# 🌍 AirLens - 대기질 AI 모니터링 앱

> 전 지구 대기질 실시간 모니터링 & AI 기반 PM 농도 예측

## ✨ 주요 기능

### 🌐 Globe 탭
- 전 지구 측정소 실시간 데이터
- PM2.5 농도에 따른 색상 시각화
- 국가별 대기질 상태

### 📸 Camera 탭
- iOS 카메라 입력 기반 AI 예측
- 이미지 선택 & 분석
- 신뢰도 점수 표시

### 📋 Policies 탭
- 국가별 대기질 개선 정책
- 정책 신뢰도 평가
- 출처별 정책 분류

### 📊 Stats 탭
- 통계 대시보드
- 최고/최저 PM2.5 순위
- 측정소/정책 통계

---

## 🚀 빠른 시작

### 1단계: 필수 도구 확인

```bash
# Python 3.8+ 확인
python3 --version

# Node.js 확인 (iOS 앱 빌드용)
node --version
```

### 2단계: 백엔드 실행

```bash
# 의존성 설치
pip install fastapi uvicorn

# 백엔드 서버 시작
python main.py

# 예상 출력:
# 🚀 Starting AirLens Backend...
# 📍 Server: http://127.0.0.1:8000
# 📚 Docs: http://127.0.0.1:8000/docs
```

### 3단계: iOS 앱 빌드 & 실행

```bash
# Xcode에서 프로젝트 열기
open -a Xcode Globe_fd.xcodeproj

# 또는 터미널에서
# 1. Clean Build
xcodebuild clean -project Globe_fd.xcodeproj

# 2. Build
xcodebuild build -project Globe_fd.xcodeproj -scheme Globe_fd

# 3. Run on Simulator
xcodebuild -project Globe_fd.xcodeproj -scheme Globe_fd -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

### 4단계: 앱 테스트

시뮬레이터에서 앱을 열고 다음을 확인하세요:

```
✅ 앱 로드 (검은 배경)
✅ 4개 탭 표시 (Globe, Camera, Policies, Stats)
✅ Globe 탭: 3개 측정소 로드 및 표시
✅ Camera 탭: 이미지 선택 가능
✅ Policies 탭: 2개 정책 표시
✅ Stats 탭: 통계 카드 표시
```

---

## 📦 프로젝트 구조

```
Globe_fd/
├── Globe_fd/                          # iOS 앱 코드
│   ├── App/
│   │   ├── Globe_fdApp.swift         # Entry point
│   │   └── ContentView.swift         # Main UI
│   ├── Networking/
│   │   ├── APIClient.swift           # API 통신
│   │   ├── Models.swift              # 데이터 구조
│   │   └── NetworkManager.swift      # 네트워크 유틸
│   ├── ViewModels/
│   │   ├── StationViewModel.swift    # 측정소 VM
│   │   ├── PolicyViewModel.swift     # 정책 VM
│   │   └── CameraViewModel.swift     # 카메라 VM
│   ├── Services/
│   │   ├── LocationService.swift     # GPS
│   │   ├── CameraService.swift       # 카메라
│   │   ├── MLService.swift           # ML 추론
│   │   └── StorageService.swift      # 저장소
│   ├── Views/
│   │   ├── CameraView.swift
│   │   ├── GlobeView.swift
│   │   ├── PoliciesView.swift
│   │   └── GlobeViewController.swift
│   └── Info.plist                    # 권한 설정
├── main.py                           # 백엔드 서버 (FastAPI)
├── CLAUDE.md                         # Claude 프로젝트 가이드
└── README.md                         # 이 파일
```

---

## 🔌 API 엔드포인트

### 헬스 체크
```bash
GET /health

응답:
{
  "status": "ok",
  "timestamp": "2025-11-05T10:00:00Z"
}
```

### 측정소 데이터
```bash
GET /api/stations?limit=100&country=South%20Korea

응답:
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

### 정책 데이터
```bash
GET /api/policies?country=South%20Korea

응답:
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "id": "kr_1",
      "source": "Korea EPA",
      "country": "South Korea",
      "title": "PM2.5 Reduction Policy",
      "description": "Fine dust reduction plan",
      "url": "https://example.com",
      "credibility_score": 0.95
    }
  ]
}
```

### PM2.5 예측
```bash
POST /api/predict
Content-Type: multipart/form-data
Body: image=<image_file>

응답:
{
  "data": {
    "pm25": 35.7,
    "confidence": 0.87,
    "breakdown": {
      "camera": 35.7,
      "station": null,
      "satellite": null
    },
    "timestamp": "2025-11-05T10:00:00Z"
  }
}
```

---

## 📊 PM2.5 분류 기준

| PM2.5 | 상태 | 색상 |
|-------|------|------|
| ≤ 12 | Good (좋음) | 🟢 녹색 |
| 12-35 | Moderate (보통) | 🟡 노랑 |
| 35-55 | Unhealthy (나쁨) | 🟠 주황 |
| 55-150 | Very Unhealthy (매우나쁨) | 🔴 빨강 |
| > 150 | Hazardous (위험) | ⚫ 검정 |

---

## 🛠️ 기술 스택

### Frontend (iOS)
- **SwiftUI** - UI 프레임워크
- **Combine** - 반응형 프로그래밍
- **Codable** - JSON 디코딩
- **async/await** - 비동기 처리
- **CoreLocation** - GPS 위치
- **AVFoundation** - 카메라 (향후)

### Backend
- **FastAPI** - 웹 프레임워크
- **Uvicorn** - ASGI 서버
- **Python 3.8+** - 언어

---

## 🧪 테스트

### 백엔드 API 테스트

#### 1. Swagger UI 사용
```
브라우저: http://localhost:8000/docs
```

#### 2. curl 사용
```bash
# 헬스 체크
curl http://localhost:8000/health

# 측정소 데이터
curl http://localhost:8000/api/stations

# 정책 데이터
curl http://localhost:8000/api/policies
```

#### 3. Python 테스트
```python
import requests

# 측정소 데이터
response = requests.get('http://localhost:8000/api/stations')
print(response.json())
```

### iOS 앱 테스트

1. **Xcode 콘솔 확인**
   ```
   Console 탭에서 로그 확인
   ✅ Loaded 3 stations
   ✅ Loaded 2 policies
   ```

2. **UI 테스트**
   - 각 탭 선택
   - 데이터 로드 확인
   - 이미지 선택 기능 테스트

3. **네트워크 디버깅**
   - Xcode Network Link Conditioner 사용
   - 느린 네트워크 환경 시뮬레이션

---

## 🐛 일반적인 오류 해결

### 오류 1: "Cannot find module 'fastapi'"
```bash
해결:
pip install fastapi uvicorn
```

### 오류 2: "Cannot connect to localhost:8000"
```bash
확인:
1. 백엔드가 실행 중인지 확인
2. 터미널에서: python main.py
3. 브라우저에서: http://localhost:8000/health
```

### 오류 3: "Cannot find 'Station' in scope"
```bash
Xcode 해결:
1. Target Membership 확인
2. Build Settings > Search Paths 확인
3. Cmd+B (Clean Build)
```

### 오류 4: "Network request failed"
```bash
확인:
1. 백엔드 헬스: curl http://localhost:8000/health
2. 앱 권한: Info.plist 확인
3. 방화벽: 8000 포트 허용
```

### 오류 5: "Image picker not opening"
```bash
확인:
1. Info.plist에서 NSPhotoLibraryUsageDescription 확인
2. 시뮬레이터 설정에서 사진 라이브러리 권한 확인
```

---

## 📈 성능 최적화

### 초기 로드 시간 단축
- ✅ 필요한 파일만 로드 (Models, APIs)
- ✅ 이미지 최적화 (JPG 80% 품질)
- ✅ 백그라운드 데이터 로드

### 메모리 사용 최소화
- ✅ 50개 측정소만 표시 (전체 로드 후 제한)
- ✅ 30개 정책만 표시
- ✅ 캐싱 활용

### 네트워크 최적화
- ✅ 필요한 데이터만 요청
- ✅ 캐싱으로 중복 요청 방지
- ✅ 배치 처리 고려

---

## 🚀 배포 준비

### 1. 프로덕션 API 설정
```swift
// APIClient.swift 수정
#else
return "https://your-api.onrender.com"  // 프로덕션 URL
#endif
```

### 2. 실제 데이터 소스
- WAQI (https://waqi.info/) - 실제 대기질 데이터
- 각 국가 EPA API
- 위성 데이터 (Copernicus)

### 3. ML 모델 통합
- TensorFlow Lite 모델 추가
- Core ML 형식으로 변환
- 앱 번들에 포함

### 4. App Store 제출
- 아이콘/스크린샷 준비
- 개인정보보호정책 작성
- 테스트 플라이트 배포

---

## 📞 지원 & 문의

### 문서
- `CLAUDE.md` - Claude AI를 위한 프로젝트 가이드
- `Globe_fd_Exact_File_Placement.md` - 파일 구조 & 구현 가이드
- `Globe_fd_Quick_Start_Checklist.md` - 빠른 시작 체크리스트

### 유용한 명령어

```bash
# 프로젝트 클린
cd /path/to/Globe_fd
xcodebuild clean -project Globe_fd.xcodeproj

# 백엔드 재시작
ps aux | grep "python main.py" | grep -v grep | awk '{print $2}' | xargs kill
python main.py

# 시뮬레이터 재설정
xcrun simctl erase iPhone\ 15\ Pro

# 백엔드 로그 확인
tail -f backend.log
```

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 🎉 체크리스트

완성도 체크:

- [x] iOS 앱 기본 구조 (MVVM)
- [x] 4개 탭 UI (Globe, Camera, Policies, Stats)
- [x] 네트워크 API 통신
- [x] 데이터 모델 (Station, Policy)
- [x] 위치 서비스 (LocationService)
- [x] 백엔드 서버 (FastAPI)
- [x] 카메라 입력 (ImagePickerView)
- [x] 통계 대시보드
- [ ] 실시간 지구본 3D 렌더링 (향후)
- [ ] 실제 ML 모델 통합 (향후)
- [ ] App Store 배포 (향후)

---

**마지막 업데이트**: 2025-11-05  
**상태**: ✅ 즉시 실행 가능
