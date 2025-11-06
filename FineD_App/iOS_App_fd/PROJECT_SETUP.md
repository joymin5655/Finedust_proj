# AirLens 프로젝트 설정 가이드

## 🎯 현재 상태

모든 Swift 파일이 준비되어 있지만, Xcode 프로젝트 파일(`.xcodeproj`)이 필요합니다.

## 📋 빠른 설정 (5분 완료)

### 방법 1: Xcode에서 직접 생성 (권장)

1. **Xcode 실행**

2. **File → New → Project**

3. **iOS → App** 선택하고 Next

4. **프로젝트 정보 입력**:
   ```
   Product Name: AirLens
   Team: (본인의 Apple Developer 계정)
   Organization Identifier: com.yourname.airlens
   Bundle Identifier: com.yourname.airlens.AirLens
   Interface: SwiftUI
   Language: Swift
   ```

5. **저장 위치**:
   ```
   /Users/joymin/Coding_proj/Finedust_proj/
   ```

   중요: `iOS_App_fd` 폴더가 아니라 그 상위 폴더에 저장!

6. **프로젝트 이름을 `iOS_App_fd`로 변경**

7. **기존 파일 삭제**:
   - Xcode가 생성한 `ContentView.swift` 삭제
   - Xcode가 생성한 `AirLensApp.swift` 삭제

8. **기존 소스 추가**:
   - Project Navigator에서 `iOS_App_fd` 우클릭
   - **Add Files to "iOS_App_fd"**
   - 다음 폴더들 선택:
     * App/
     * Models/
     * Views/
     * ViewModels/
     * Services/
     * Utilities/
   - **Options 설정**:
     * ✅ Copy items if needed
     * ✅ Create groups
     * ✅ Add to targets: iOS_App_fd

9. **Info.plist 설정**:
   - TARGETS → iOS_App_fd → Build Settings
   - "Info.plist File" 검색
   - 값을 `iOS_App_fd/Info.plist`로 설정

10. **빌드 및 실행** (⌘R)

---

### 방법 2: Swift Package Manager 사용

```bash
cd /Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd
swift package init --type executable
```

하지만 iOS 앱은 Xcode 프로젝트가 더 적합합니다.

---

## 🔧 필수 설정

### A. Deployment Target

1. TARGETS → iOS_App_fd → General
2. **Minimum Deployments**: iOS 15.0 설정

### B. Capabilities

1. TARGETS → iOS_App_fd → Signing & Capabilities
2. **+ Capability** 클릭
3. 추가할 항목:
   - Background Modes (Location updates)

### C. Privacy Permissions (이미 Info.plist에 포함됨)

- ✅ Location When In Use
- ✅ Camera
- ✅ Photo Library

---

## 📱 테스트 방법

### 1. Preview 테스트 (가장 빠름)

```swift
// 아무 View 파일 열기
// ⌘⌥↩ (Canvas 열기)
// Resume 버튼 클릭
```

### 2. Simulator 테스트

```
⌘R → iPhone 15 Pro 선택 → 실행
```

### 3. 실기기 테스트

1. iPhone USB 연결
2. TARGETS → Signing → Team 선택
3. Scheme에서 본인 iPhone 선택
4. ⌘R 실행

---

## 🚨 문제 해결

### "No such module 'SwiftUI'"

**해결**:
- Xcode → Preferences → Locations
- Command Line Tools 선택
- Xcode 재시작

### "Info.plist not found"

**해결**:
```
TARGETS → Build Settings → "Info.plist File"
값: iOS_App_fd/Info.plist
```

### "Module compiled with Swift X.X cannot be imported"

**해결**:
```
Product → Clean Build Folder (⌘⇧K)
다시 빌드 (⌘B)
```

### Preview 실패

**해결**:
```
1. Canvas에서 "Resume" 클릭
2. 또는 ⌘⌥P (Try Again)
3. 여전히 안되면: Editor → Canvas 재시작
```

---

## 📂 프로젝트 구조 확인

올바른 구조:

```
iOS_App_fd/
├── iOS_App_fd.xcodeproj/     ← Xcode가 생성
├── App/
│   ├── AirLensApp.swift
│   └── ContentView.swift
├── Models/
│   ├── Station.swift
│   ├── PredictionResult.swift
│   └── AirPolicy.swift
├── Views/
│   ├── Globe/
│   ├── Camera/
│   ├── Policies/
│   └── Stats/
├── ViewModels/
├── Services/
├── Utilities/
├── Info.plist
└── README.md
```

---

## ✅ 완료 체크리스트

- [ ] Xcode 프로젝트 생성됨
- [ ] 모든 소스 파일 추가됨
- [ ] Info.plist 경로 설정됨
- [ ] Deployment Target = iOS 15.0
- [ ] Signing 설정됨
- [ ] Simulator에서 빌드 성공
- [ ] Preview 작동 확인

---

## 💡 다음 단계

1. ✅ 프로젝트 설정 완료
2. 🎨 UI 커스터마이징 (XCODE_GUIDE.md 참조)
3. 🧪 기능 테스트
4. 📱 실기기 테스트
5. 🚀 App Store 준비

---

**문제가 있으면 XCODE_GUIDE.md를 참조하세요!**
