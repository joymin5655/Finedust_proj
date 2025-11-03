# AirLens iOS - 빠른 시작 가이드 ⚡

## 🎭 API 키 없이 바로 시작!

**좋은 소식**: Gemini API 키가 없어도 앱을 바로 실행할 수 있습니다!
**Mock Mode**가 자동으로 활성화되어 시뮬레이션 데이터로 작동합니다.

---

## 1️⃣ 사전 준비 (2분)

### 필수 도구 확인
```bash
# Xcode 설치 확인
xcodebuild -version
# Xcode 15.0 이상 필요

# macOS 버전 확인
sw_vers
# macOS 14.0 (Sonoma) 이상 권장
```

### ⚠️ API 키 발급 (선택사항)
> 💡 **건너뛰어도 됩니다!** Mock Mode로 바로 시작할 수 있습니다.

실제 AI 분석을 원하시면:
1. https://ai.google.dev/ 접속
2. "Get API Key" 클릭
3. 새 API 키 생성
4. 키 복사 (나중에 사용)

---

## 2️⃣ 프로젝트 확인 (2분)

### 터미널에서 실행
```bash
cd /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS
./create_xcode_project.sh
```

---

## 3️⃣ Xcode 프로젝트 생성 (10분)

### Step 1: 새 프로젝트
1. **Xcode** 실행
2. **"Create a new Xcode project"** 클릭
3. **iOS → App** 선택
4. **Next** 클릭

### Step 2: 프로젝트 정보
- **Product Name**: `AirLens`
- **Team**: 본인의 Apple ID 선택
- **Organization Identifier**: `com.yourname`
- **Interface**: `SwiftUI` ✅
- **Language**: `Swift` ✅

### Step 3: 저장 위치
1. 저장 위치: `/Users/joymin/Coding_proj/Finedust_proj/`
2. **Create** 클릭

---

## 4️⃣ 파일 추가 (5분)

### 기존 파일 삭제
1. Project Navigator에서 `ContentView.swift` 선택
2. **Delete** → "Move to Trash"

### AirLens 파일 추가
1. Project Navigator에서 **AirLens** 우클릭
2. **"Add Files to AirLens..."** 선택
3. `/Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS/AirLens` 폴더 선택
4. 옵션:
   - ☐ **Copy items if needed** (체크 해제!)
   - ☑ **Create groups** (체크)
5. **Add** 클릭

---

## 5️⃣ API 키 설정 (선택사항 - 건너뛰어도 됨!)

> 💡 **이 단계를 건너뛰면 Mock Mode로 작동합니다!**

### 실제 AI 분석을 원한다면:

1. Project Navigator에서 **Info.plist** 클릭
2. **GEMINI_API_KEY** 찾기
3. `YOUR_GEMINI_API_KEY`를 실제 API 키로 변경
4. Settings에서 **Mock Data Mode** OFF

---

## 6️⃣ 빌드 및 실행 (3분)

### 시뮬레이터 선택
1. Xcode 상단에서 시뮬레이터 선택
   - 추천: `iPhone 15 Pro`

### 바로 실행!
```
Cmd + R
```

**그게 전부입니다!** 🎉

---

## 7️⃣ 권한 허용 (1분)

첫 실행 시:
1. **📍 위치 접근** → "Allow While Using App"
2. **📸 카메라 접근** → "OK"
3. **🖼️ 사진 접근** → "Allow"

---

## 8️⃣ Mock Mode 확인

앱 상단에 **🌙 Mock Mode** 배지가 보이면 정상입니다!

### Mock Mode에서 할 수 있는 것:
- ✅ 카메라 캡처 (이미지 밝기 분석)
- ✅ 이미지 업로드 (시뮬레이션 분석)
- ✅ 측정소 데이터 (Mock 데이터)
- ✅ 위치 정보 (CoreLocation Geocoder)
- ✅ 글로브 뷰
- ✅ 모든 UI 기능

---

## 9️⃣ Real API로 전환하기 (선택사항)

1. **Settings** (⚙️) 탭
2. **Developer Settings** 섹션
3. **Mock Data Mode** OFF
4. Info.plist에 API 키 설정 확인

---

## 🎉 완료!

축하합니다! AirLens가 정상적으로 작동합니다.

### Mock Mode vs Real API

| 기능 | Mock Mode | Real API |
|------|-----------|----------|
| 설정 시간 | ⚡ 즉시 | ⏱️ +5분 |
| API 키 | ❌ 불필요 | ✅ 필요 |
| 인터넷 | ❌ 불필요 | ✅ 필요 |
| 정확도 | 📊 시뮬레이션 | 🎯 AI 분석 |

---

## 문제 해결

### "Mock Mode" 배지가 안 보여요
- 정상입니다! Settings에서 상태 확인 가능

### API를 사용하고 싶어요
1. Gemini API 키 발급 (https://ai.google.dev/)
2. Info.plist에 키 입력
3. Settings에서 Mock Mode OFF

### 빌드 에러
```bash
# Clean Build
Cmd + Shift + K

# Derived Data 삭제
rm -rf ~/Library/Developer/Xcode/DerivedData
```

---

**총 소요 시간: 약 20분 (API 키 없이)**

**Happy Coding! 🚀**
