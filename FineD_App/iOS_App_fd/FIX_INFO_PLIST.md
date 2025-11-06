# Info.plist 오류 해결 가이드

## 🚨 오류 내용
```
Cannot code sign because the target does not have an Info.plist file
```

## ✅ 해결 방법 (3가지 - 순서대로 시도)

---

## 방법 1: Xcode 자동 생성 활성화 (추천 ⭐⭐⭐)

**가장 빠르고 현대적인 방법입니다!**

### 단계:

1. **Xcode에서 프로젝트 열기**

2. **Project Navigator에서 프로젝트 이름 클릭**
   ```
   (좌측 상단의 파란 아이콘)
   ```

3. **TARGETS → iOS_App_fd (또는 AirLens) 선택**

4. **Build Settings 탭 클릭**

5. **검색창에 "generate info" 입력**

6. **"Generate Info.plist File" 찾기**

7. **값을 "YES"로 변경**
   ```
   Generate Info.plist File: YES
   ```

8. **Clean Build (⌘⇧K)**

9. **다시 빌드 (⌘B)**

### 이제 Info 탭에서 권한 추가:

1. **TARGETS → Info 탭**

2. **Custom iOS Target Properties 섹션에서 + 버튼**

3. **다음 항목들 추가**:

```
Key: NSLocationWhenInUseUsageDescription
Value: AirLens needs your location to find nearby air quality stations.

Key: NSCameraUsageDescription
Value: AirLens uses your camera to capture sky images for AI prediction.

Key: NSPhotoLibraryUsageDescription
Value: AirLens can analyze photos to predict air quality.
```

---

## 방법 2: Info.plist 경로 직접 설정

### 단계:

1. **TARGETS → Build Settings**

2. **검색: "info.plist"**

3. **"Info.plist File" 찾기**

4. **값 설정**:
   ```
   Info.plist File: iOS_App_fd/Info.plist

   또는 절대 경로:
   $(SRCROOT)/iOS_App_fd/Info.plist
   ```

5. **Clean Build (⌘⇧K)**

6. **다시 빌드 (⌘B)**

---

## 방법 3: Info.plist 파일 다시 추가

### 단계:

1. **Project Navigator에서 기존 Info.plist 삭제**
   - 우클릭 → Delete → "Remove Reference" 선택

2. **파일 다시 추가**
   - File → Add Files to "iOS_App_fd"
   - iOS_App_fd/Info.plist 선택
   - ✅ Copy items if needed
   - ✅ Add to targets: iOS_App_fd

3. **Clean Build (⌘⇧K)**

4. **다시 빌드 (⌘B)**

---

## 🎯 빠른 해결 (터미널에서)

만약 Xcode 프로젝트 파일이 있다면:

```bash
cd /Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd

# Xcode 프로젝트 파일 찾기
find . -name "*.xcodeproj"

# 만약 있다면:
open iOS_App_fd.xcodeproj
```

---

## 🔍 문제 진단

현재 상황 확인:

### 1. Info.plist 파일이 있는가?
```bash
ls -la iOS_App_fd/Info.plist
```
✅ 파일 있음

### 2. Xcode 프로젝트가 있는가?
```bash
ls -la iOS_App_fd/*.xcodeproj
```

**만약 .xcodeproj가 없다면** → PROJECT_SETUP.md 참조하여 프로젝트 생성!

---

## ⚠️ 주의사항

### 프로젝트가 아직 생성되지 않았다면:

1. **Xcode → File → New → Project**
2. **iOS → App** 선택
3. **정보 입력**:
   ```
   Product Name: AirLens
   Interface: SwiftUI
   Language: Swift
   ```
4. **저장 위치**:
   ```
   /Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd
   ```

---

## 📋 올바른 설정 확인

빌드가 성공하면 다음을 확인:

### Build Settings에서:
```
Product Bundle Identifier: com.yourname.airlens
Display Name: AirLens
Deployment Target: iOS 15.0
```

### Info 탭에서 (최소 필수):
```
✅ NSLocationWhenInUseUsageDescription
✅ NSCameraUsageDescription
✅ NSPhotoLibraryUsageDescription
```

---

## 🎉 해결 확인

다음 명령어가 성공하면 해결된 것입니다:

```bash
⌘B  # Build 성공
⌘R  # Run 성공
```

---

## 🆘 여전히 안 된다면?

### 옵션 A: 프로젝트 재생성

```bash
# 1. 기존 .xcodeproj 삭제
rm -rf iOS_App_fd.xcodeproj

# 2. Xcode에서 새로 생성 (PROJECT_SETUP.md 참조)
```

### 옵션 B: 클린 빌드

```bash
# Xcode에서:
⌘⇧K  # Clean Build Folder
⌘B   # Build
```

### 옵션 C: Derived Data 삭제

```bash
# Xcode → Preferences → Locations
# Derived Data 경로 확인
# Finder에서 해당 폴더 삭제
# Xcode 재시작
```

---

## 💡 가장 빠른 해결책 (요약)

```
1. TARGETS → Build Settings
2. 검색: "generate info"
3. Generate Info.plist File = YES
4. ⌘⇧K (Clean)
5. ⌘B (Build)
```

**이게 안 되면 방법 2, 3 순서대로 시도하세요!**
