# Xcode 프로젝트 설정 값 (복사-붙여넣기용)

## 🎯 Build Settings 설정 값

Xcode의 Build Settings에서 다음 값들을 설정하세요.

### 1. Info.plist 경로

```
항목: Info.plist File
값: iOS_App_fd/Info.plist

또는 절대 경로:
$(SRCROOT)/Info.plist
```

### 2. Product Bundle Identifier

```
항목: Product Bundle Identifier
값: com.airlens.app

(본인의 도메인으로 변경 가능:)
com.yourname.airlens
```

### 3. Display Name

```
항목: Display Name
값: AirLens
```

### 4. Deployment Target

```
항목: iOS Deployment Target
값: 15.0
```

### 5. Swift Language Version

```
항목: Swift Language Version
값: Swift 5
```

---

## 📋 General 탭 설정

### Identity:

```
Display Name: AirLens
Bundle Identifier: com.airlens.app
Version: 1.0.0
Build: 1
```

### Deployment Info:

```
iOS Deployment Target: 15.0

Device Orientation:
✅ Portrait
✅ Landscape Left
✅ Landscape Right
```

### App Category:

```
Primary: Weather
```

---

## 🔐 Signing & Capabilities

### Signing:

```
Automatically manage signing: ✅

Team: (본인의 Apple Developer 계정 선택)

Bundle Identifier: com.airlens.app
```

### Capabilities (+ 버튼으로 추가):

```
✅ Background Modes
  └─ Location updates

✅ Push Notifications (선택사항)
```

---

## 📱 Info 탭 - Custom iOS Target Properties

다음 Privacy 항목들을 추가하세요 (+ 버튼):

### 1. Location Permission

```
Key: Privacy - Location When In Use Usage Description
Type: String
Value: AirLens needs your location to find nearby air quality monitoring stations and provide accurate local predictions.
```

또는 원본 키:
```
Key: NSLocationWhenInUseUsageDescription
Value: AirLens needs your location to find nearby air quality stations.
```

### 2. Camera Permission

```
Key: Privacy - Camera Usage Description
Type: String
Value: AirLens uses your camera to capture sky images for AI-powered PM2.5 prediction. Images are processed on-device and not stored.
```

또는:
```
Key: NSCameraUsageDescription
Value: AirLens uses camera for AI air quality prediction.
```

### 3. Photo Library Permission

```
Key: Privacy - Photo Library Usage Description
Type: String
Value: AirLens can analyze photos from your library to predict air quality. Images are processed locally and not uploaded.
```

또는:
```
Key: NSPhotoLibraryUsageDescription
Value: Analyze photos for air quality prediction.
```

### 4. User Tracking (선택사항)

```
Key: Privacy - Tracking Usage Description
Type: String
Value: This identifier will be used to deliver personalized air quality alerts.
```

---

## 🎨 Asset Catalog 설정

### App Icon:

```
1. Assets.xcassets → AppIcon
2. 다음 크기의 이미지 추가:
   - 1024x1024 (App Store)
   - 60x60 @2x, @3x (iPhone)
   - 76x76 @2x (iPad)
```

### Launch Screen:

```
1. Assets.xcassets → LaunchImage
2. 또는 LaunchScreen.storyboard 사용
```

---

## 🔧 Build Settings 추가 설정 (고급)

### Swift Compiler:

```
Optimization Level:
  Debug: -Onone
  Release: -O -whole-module-optimization

Enable Testability:
  Debug: Yes
  Release: No
```

### Linking:

```
Other Linker Flags:
  $(inherited)
```

### Search Paths:

```
Framework Search Paths:
  $(inherited)
  $(PROJECT_DIR)

Header Search Paths:
  $(inherited)
```

---

## 📦 Framework 추가 (필요시)

프로젝트에 다음 Framework들이 자동으로 링크됩니다:

```
✅ SwiftUI.framework
✅ CoreLocation.framework
✅ CoreML.framework
✅ Vision.framework
✅ SceneKit.framework
✅ Combine.framework
```

수동 추가가 필요하면:
```
TARGETS → Build Phases → Link Binary With Libraries → +
```

---

## 🎯 빠른 설정 체크리스트

완료 여부 확인:

```
□ Info.plist File 경로 설정됨
□ Bundle Identifier 설정됨
□ Display Name = AirLens
□ Deployment Target = 15.0
□ Signing 설정됨 (Team 선택)
□ Location Permission 추가됨
□ Camera Permission 추가됨
□ Photo Library Permission 추가됨
□ Clean Build 실행됨 (⌘⇧K)
□ Build 성공 (⌘B)
□ Run 성공 (⌘R)
```

---

## 💡 설정 확인 방법

### Build Settings 검색:

```
1. TARGETS → Build Settings
2. 검색창 활용:
   - "info" → Info.plist File 확인
   - "bundle" → Bundle Identifier 확인
   - "deploy" → Deployment Target 확인
```

### Info.plist 확인:

```
1. TARGETS → Info 탭
2. Custom iOS Target Properties 섹션
3. 모든 Privacy 항목이 있는지 확인
```

---

## 🚨 문제 해결

### "Info.plist file not found"

```
Build Settings → Info.plist File
값: iOS_App_fd/Info.plist
```

### "Code signing failed"

```
Signing & Capabilities → Team 선택
Bundle Identifier가 유니크한지 확인
```

### "Module not found"

```
Product → Clean Build Folder (⌘⇧K)
다시 빌드 (⌘B)
```

---

## 📚 참고 문서

- `QUICK_FIX.md` - Info.plist 오류 빠른 해결
- `FIX_INFO_PLIST.md` - 상세한 해결 방법
- `PROJECT_SETUP.md` - 프로젝트 생성 가이드
- `XCODE_GUIDE.md` - UI 작업 가이드

---

**이 설정 값들을 복사해서 Xcode에 붙여넣으세요!** 📋
