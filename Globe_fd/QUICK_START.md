# 🚀 AirLens 즉시 실행 가이드
## 5분 안에 완벽하게 작동하기

**최종 확인일**: 2025-11-05  
**상태**: ✅ 100% 준비 완료

---

## 📋 파일 수정 완료 목록

### ✅ Networking 폴더 (완료)
- [x] `Models.swift` - Station, Policy, PM25 카테고리 모델 ✓
- [x] `APIClient.swift` - API 통신 (stations, policies, predict) ✓
- [x] `NetworkManager.swift` - 네트워크 유틸 ✓

### ✅ ViewModels 폴더 (완료)
- [x] `StationViewModel.swift` - 측정소 데이터 로직 ✓
- [x] `PolicyViewModel.swift` - 정책 데이터 로직 ✓
- [x] `CameraViewModel.swift` - 카메라 AI 예측 ✓

### ✅ Services 폴더 (완료)
- [x] `LocationService.swift` - GPS 위치 서비스 ✓
- [x] `CameraService.swift` - 카메라 캡처 ✓
- [x] `MLService.swift` - ML 추론 ✓
- [x] `StorageService.swift` (수정: StorageSerevice.swift) ✓

### ✅ App 폴더 (완료)
- [x] `Globe_fdApp.swift` - 진입점 ✓
- [x] `ContentView.swift` - 메인 UI (4개 탭) ✓

### ✅ 백엔드 (완료)
- [x] `main.py` - FastAPI 서버 ✓
- [x] `/health` 엔드포인트 ✓
- [x] `/api/stations` 엔드포인트 ✓
- [x] `/api/policies` 엔드포인트 ✓
- [x] `/api/predict` 엔드포인트 ✓

### ✅ 문서 (완료)
- [x] `CLAUDE.md` - Claude를 위한 프로젝트 가이드 ✓
- [x] `README.md` - 프로젝트 전체 설명 ✓
- [x] `Info.plist` - 권한 설정 확인 ✓

---

## 🎯 Step 1: 백엔드 실행 (1분)

### 터미널 1 열기

```bash
# 프로젝트 폴더 이동
cd /Users/joymin/Coding_proj/Finedust_proj/Globe_fd

# 의존성 설치 (처음 1회만)
pip install fastapi uvicorn

# 백엔드 시작
python main.py
```

### 예상 출력
```
🚀 Starting AirLens Backend...
📍 Server: http://127.0.0.1:8000
📚 Docs: http://127.0.0.1:8000/docs

INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 정상 작동 확인
브라우저에서: `http://localhost:8000/health`
```json
{"status":"ok","timestamp":"2025-11-05T..."}
```

---

## 🎯 Step 2: Xcode 실행 (3분)

### 1. Xcode 열기
```bash
# Xcode 프로젝트 열기
open /Users/joymin/Coding_proj/Finedust_proj/Globe_fd/Globe_fd.xcodeproj
```

또는 Finder에서 `Globe_fd.xcodeproj` 더블클릭

### 2. 빌드 설정

```
1. 상단에서 Device 선택: iPhone 15 Pro (또는 임의의 시뮬레이터)
2. Cmd + B (Build)
   - 첫 빌드는 30-60초 소요
   - "Build Succeeded" 메시지 확인
```

### 3. 앱 실행
```
Cmd + R (Run)
또는 상단의 ▶️ 버튼 클릭
```

시뮬레이터가 자동으로 시작됩니다 (10-15초 소요)

---

## ✅ Step 3: 앱 테스트 (1분)

### 1️⃣ Globe 탭 확인
```
예상 화면:
- 제목: 🌍 AirLens Globe
- 텍스트: "Stations: 3"
- 목록:
  ✓ Seoul Center (PM2.5: 28.5)
  ✓ Beijing Center (PM2.5: 85.3)
  ✓ Tokyo Center (PM2.5: 18.7)
- 색상 표시:
  ✓ Seoul (노랑 - Moderate)
  ✓ Beijing (빨강 - Very Unhealthy)
  ✓ Tokyo (초록 - Good)
```

### 2️⃣ Camera 탭 확인
```
예상 화면:
- 제목: 📸 Camera AI
- 버튼: "Select Photo" (파랑 배경)
- (클릭 가능)
```

### 3️⃣ Policies 탭 확인
```
예상 화면:
- 제목: 📋 Air Quality Policies
- 텍스트: "Total: 2"
- 정책 목록:
  ✓ PM2.5 Reduction Policy (Korea EPA)
  ✓ Air Quality Improvement (China MEE)
```

### 4️⃣ Stats 탭 확인
```
예상 화면:
- 제목: 📊 Statistics
- 카드:
  ✓ Stations: 3
  ✓ Policies: 2
- 순위:
  ✓ 🔴 Highest PM2.5 (Beijing 85.3)
  ✓ 🟢 Lowest PM2.5 (Tokyo 18.7)
```

---

## 🔍 Debug 로그 확인

### Xcode Console에서 확인
```
상단 메뉴: View → Debug Area → Show Console
또는: Cmd + Shift + C
```

### 성공 로그
```
✅ Loaded 3 stations
✅ Loaded 2 policies
```

### 에러 로그
```
❌ Error loading stations: Network request failed
→ 백엔드가 실행 중인지 확인 (Step 1)
```

---

## ⚙️ 주요 설정 확인

### Info.plist 권한
```
✅ NSLocationWhenInUseUsageDescription
✅ NSCameraUsageDescription
✅ NSPhotoLibraryUsageDescription
✅ NSLocalNetworkUsageDescription
```

모두 자동으로 설정되어 있습니다.

### API 기본값
```swift
// Debug 모드 (현재)
http://localhost:8000

// Release 모드 (향후)
https://your-api.onrender.com
```

---

## 🆘 문제 해결

### 문제 1: Build 실패 - "Cannot find module"
```
해결:
1. Xcode 메뉴: Product → Clean Build Folder
   또는: Shift + Cmd + K
2. Cmd + B (Build 다시 시도)
3. 여전히 안 되면: 프로젝트 폴더의 DerivedData 삭제
   rm -rf ~/Library/Developer/Xcode/DerivedData/
```

### 문제 2: 백엔드 연결 실패
```
확인:
1. 백엔드 실행 중인가?
   - 터미널에서 python main.py 실행했나?
   
2. 포트 확인
   - 다른 앱이 8000 포트 사용하는가?
   - lsof -i :8000 (사용 중인 프로세스 확인)

3. 백엔드 헬스 체크
   - 브라우저: http://localhost:8000/health
   - curl http://localhost:8000/health
```

### 문제 3: "Cannot find 'Station' in scope"
```
해결:
1. Models.swift가 Target에 포함되었는가?
   - Models.swift 선택
   - File Inspector 우측 패널
   - Target Membership에서 ✓ Globe_fd 활성화
```

### 문제 4: 이미지 선택 안 됨
```
해결:
1. Info.plist 확인
2. 시뮬레이터 설정 > 권한 > 사진 허용
3. Xcode 재시작
```

### 문제 5: 느린 성능
```
최적화:
1. 시뮬레이터 재시작: Cmd + Q
2. Xcode 재시작
3. 디버그 빌드 대신 릴리스 빌드 사용
   Product → Scheme → Edit Scheme → Release
```

---

## 📊 네트워크 테스트 (선택사항)

### API 응답 확인
```bash
# 터미널에서 테스트
curl http://localhost:8000/api/stations | json_pp
curl http://localhost:8000/api/policies | json_pp

# 또는 Python
python3 << 'EOF'
import requests
r = requests.get('http://localhost:8000/api/stations')
print(r.json())
EOF
```

### Swagger UI 확인
브라우저: `http://localhost:8000/docs`
- 모든 API 엔드포인트 테스트 가능
- 요청/응답 형식 확인 가능

---

## 🎯 최종 체크리스트

### 백엔드 ✅
- [ ] `python main.py` 실행 중
- [ ] `http://localhost:8000/health` 응답 확인
- [ ] API 엔드포인트 3개 작동 (stations, policies, predict)

### iOS 앱 ✅
- [ ] Xcode Build 성공 (0 errors, 0 warnings)
- [ ] 시뮬레이터 앱 시작
- [ ] 4개 탭 모두 표시
- [ ] 데이터 로드 (3 stations, 2 policies)
- [ ] Xcode 콘솔에 성공 메시지

### 통합 테스트 ✅
- [ ] Globe 탭: 3개 측정소 표시 ✓
- [ ] Camera 탭: 이미지 선택 가능 ✓
- [ ] Policies 탭: 2개 정책 표시 ✓
- [ ] Stats 탭: 통계 대시보드 표시 ✓

---

## 🎉 성공!

모든 체크박스가 ✓ 되었다면 **완벽하게 작동 중입니다!**

다음 단계 (선택사항):
- 실제 WAQI API 연동
- 더 많은 측정소 데이터
- 3D 지구본 시각화
- ML 모델 통합
- App Store 배포

---

## 📞 빠른 참고

### 자주 사용하는 명령어

```bash
# 백엔드 시작
cd /Users/joymin/Coding_proj/Finedust_proj/Globe_fd
python main.py

# 프로젝트 클린
xcodebuild clean -project Globe_fd.xcodeproj

# 백엔드 PID 확인 및 종료
ps aux | grep "python main.py" | grep -v grep
kill -9 <PID>

# 시뮬레이터 초기화
xcrun simctl erase iPhone\ 15\ Pro
```

### 유용한 파일
- `CLAUDE.md` - AI 지원을 위한 프로젝트 설명
- `README.md` - 전체 프로젝트 가이드
- `main.py` - 백엔드 서버 코드

---

**마지막 확인**: 2025-11-05 ✅  
**모든 파일 준비 완료**: ✅  
**즉시 실행 가능**: ✅
