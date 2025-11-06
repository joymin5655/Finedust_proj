# Xcode에서 AirLens 프로젝트 작업하기

## 🎯 빠른 시작 가이드

### 1. Xcode 프로젝트 생성

현재 구조가 이미 준비되어 있으므로, Xcode에서 새 프로젝트를 생성해야 합니다:

1. **Xcode 실행**
2. **File → New → Project** 선택
3. **iOS → App** 템플릿 선택
4. 다음 정보 입력:
   - Product Name: `AirLens`
   - Team: 본인의 Apple Developer 계정
   - Organization Identifier: `com.airlens` (또는 본인의 identifier)
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Storage: **None**
5. **위치 선택**: `/Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd/`로 선택
6. 기존 파일들을 **Replace** 또는 **Merge** 선택

### 2. 기존 파일 Import하기

프로젝트가 생성되면:

1. **File Navigator** (⌘1) 열기
2. 불필요한 기본 파일 삭제:
   - `ContentView.swift` (이미 App 폴더에 있음)
   - `AirLensApp.swift` (이미 App 폴더에 있음)
3. **File → Add Files to "AirLens"** 선택
4. 다음 폴더들을 모두 선택:
   - `App/`
   - `Models/`
   - `Views/`
   - `ViewModels/`
   - `Services/`
   - `Utilities/`
5. **Options** 체크:
   - ✅ Copy items if needed
   - ✅ Create groups
   - ✅ Add to targets: AirLens

### 3. Info.plist 설정

1. **Project Navigator**에서 프로젝트 이름 클릭
2. **TARGETS → AirLens** 선택
3. **Build Settings** 탭 클릭
4. 검색창에 "Info.plist" 입력
5. **Packaging → Info.plist File** 찾기
6. 값을 `iOS_App_fd/Info.plist`로 설정

또는 더 간단하게:

1. **TARGETS → AirLens → Info** 탭 클릭
2. 하단의 "Custom iOS Target Properties" 섹션에서
3. 기존 Info.plist를 `/Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd/Info.plist`로 지정

---

## 📱 UI 작업 방법

### A. SwiftUI Preview 사용 (실시간 미리보기)

가장 빠른 방법입니다!

1. **파일 열기**: 예를 들어 `CameraView.swift`
2. **Canvas 열기**:
   - ⌘⌥↩ (Cmd + Option + Enter) 또는
   - Editor → Canvas 메뉴
3. **Resume 버튼 클릭**: Canvas 상단의 ▶️ 버튼
4. **실시간 편집**:
   - 코드 수정 → 자동으로 Preview 업데이트
   - Preview에서 클릭 → 인터랙션 테스트 가능

#### Preview 팁:
```swift
// 파일 맨 아래에 이미 있습니다:
#Preview {
    CameraView()
        .environmentObject(CameraViewModel())
        .environmentObject(LocationService.shared)
        .environmentObject(StationViewModel())
}
```

### B. Simulator 실행

전체 앱 테스트:

1. **Scheme 선택**: 상단 바에서 `AirLens > iPhone 15 Pro` 등 선택
2. **실행**: ⌘R (Cmd + R)
3. **Simulator가 시작됨**
4. **변경사항 적용**: 코드 수정 후 다시 ⌘R

#### Simulator 단축키:
- ⌘K: 키보드 토글
- ⌘→: 화면 회전
- ⌘1/2/3: 확대/축소

### C. Live Preview (권장!)

가장 강력한 방법:

1. **Canvas 열기** (⌘⌥↩)
2. **Preview 시작** (▶️ 버튼)
3. **Live Mode 활성화**: Canvas 하단의 🎮 아이콘 클릭
4. **실제 앱처럼 작동**: 클릭, 스크롤, 네비게이션 등 모두 가능

---

## 🛠️ 수정 작업 예시

### 예시 1: Globe View 색상 변경

```swift
// Views/Globe/GlobeView.swift 열기

// 찾기 (⌘F):
.foregroundColor(.white)

// 변경:
.foregroundColor(.cyan)

// Preview에서 즉시 확인!
```

### 예시 2: 버튼 크기 조정

```swift
// Views/Camera/CameraView.swift 열기

// 찾기:
.padding()

// 변경:
.padding(.horizontal, 32)
.padding(.vertical, 16)

// Canvas에서 실시간으로 보기
```

### 예시 3: 텍스트 변경

```swift
// App/ContentView.swift 열기

// 찾기:
"🌍 AirLens Globe"

// 변경:
"🌍 글로벌 대기질"

// 즉시 반영됨
```

---

## 🎨 UI 커스터마이징 가이드

### 색상 변경

```swift
// Utilities/Constants.swift에서 관리됨

// 예시:
enum AppColors {
    static let primary = Color.blue  // 이걸 변경
    static let secondary = Color.cyan
    // ...
}
```

### 폰트 변경

```swift
// 현재 코드:
.font(.largeTitle)

// 커스텀 폰트:
.font(.custom("SF Pro Display", size: 32))
```

### 레이아웃 조정

```swift
// VStack 간격:
VStack(spacing: 24) { ... }  // 24 → 16, 32 등으로 변경

// 패딩:
.padding(.horizontal, 20)  // 20 → 다른 값으로
```

---

## 🔧 현재 수정된 오류들

### ✅ 1. Info.plist 오류
- **원인**: Xcode 프로젝트 설정에서 경로 지정 필요
- **해결**: Build Settings에서 `INFOPLIST_FILE` 설정

### ✅ 2. MLService ObservableObject 오류
- **원인**: `import Combine` 누락
- **해결**: 이미 수정 완료

### ✅ 3. policyViewModel 오류
- **원인**: HeaderView에 `@EnvironmentObject` 누락
- **해결**: 이미 수정 완료

---

## 🚀 추천 작업 순서

1. **프로젝트 설정** (위 1-3단계)
2. **Preview로 각 View 확인**:
   - `CameraView.swift` 열기 → Canvas 확인
   - `GlobeView.swift` 열기 → Canvas 확인
   - `PoliciesView.swift` 열기 → Canvas 확인
3. **Simulator에서 전체 테스트** (⌘R)
4. **UI 수정** (Live Preview 사용)
5. **실기기 테스트** (iPhone 연결 후 실행)

---

## 💡 유용한 Xcode 단축키

- ⌘R: 실행
- ⌘.: 정지
- ⌘B: 빌드
- ⌘⇧K: Clean Build
- ⌘⌥↩: Canvas 토글
- ⌘1-9: Navigator 패널 전환
- ⌘⇧O: Quick Open (파일 빠르게 열기)
- ⌘/: 주석 토글
- ⌘⌥[/]: 코드 접기/펴기

---

## 📞 문제 해결

### Canvas가 안 보여요
1. Editor → Canvas 메뉴 확인
2. 또는 ⌘⌥↩ 누르기

### Preview가 실패해요
1. Canvas 상단의 "Resume" 버튼 클릭
2. 또는 ⌘⌥P (Try Again)

### 빌드 오류가 나요
1. Product → Clean Build Folder (⌘⇧K)
2. Xcode 재시작
3. `iOS_App_fd` 폴더의 모든 파일이 올바르게 추가되었는지 확인

---

**이제 Xcode에서 실시간으로 UI를 보면서 작업할 수 있습니다! 🎉**
