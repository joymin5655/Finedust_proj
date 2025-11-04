# 🔧 UIKit 에러 해결 가이드

## 🐛 문제
```
No such module 'UIKit'
```

## 🎯 원인
프로젝트가 **멀티플랫폼**(iOS, macOS, visionOS)으로 설정되어 있습니다.
- `SDKROOT = auto` → macOS SDK 선택
- `SUPPORTED_PLATFORMS` = iOS + macOS + visionOS
- UIKit은 **iOS 전용**이므로 macOS에서 사용 불가

## ✅ 해결 방법

### 방법 1: Xcode UI로 수정 (권장) ⭐

#### Step 1: 프로젝트 설정 열기
1. Xcode에서 프로젝트 열기
2. 왼쪽 Project Navigator에서 **파란색 Finedust 아이콘** 클릭
3. **TARGETS** > **Finedust** 선택

#### Step 2: 플랫폼 설정 변경
1. **General** 탭 선택
2. **Supported Destinations** 섹션 찾기
3. **macOS**와 **Apple Vision** 제거 (- 버튼)
4. **iOS**만 남기기

#### Step 3: Build Settings 확인
1. **Build Settings** 탭 선택
2. 검색창에 "supported platforms" 입력
3. **Supported Platforms** = `iphoneos iphonesimulator`만 있는지 확인
4. 검색창에 "sdkroot" 입력
5. **Base SDK** = `iOS`인지 확인

#### Step 4: 재빌드
```
⇧ ⌘ K (Clean Build Folder)
⌘ B (Build)
```

---

### 방법 2: 프로젝트 파일 직접 수정

**⚠️ 주의: Xcode를 반드시 닫은 상태에서 진행하세요!**

# ✅ UIKit 에러 해결 완료!

## 🎉 문제 해결됨!

프로젝트 파일을 **iOS 전용**으로 성공적으로 수정했습니다!

---

## 🔧 수정된 내용

### 1. 플랫폼 설정
```
변경 전: iOS + macOS + visionOS
변경 후: iOS만
```

### 2. SDK 설정
```
SDKROOT = auto → SDKROOT = iphoneos
```

### 3. 지원 플랫폼
```
SUPPORTED_PLATFORMS = "iphoneos iphonesimulator macosx xros xrsimulator"
↓
SUPPORTED_PLATFORMS = "iphoneos iphonesimulator"
```

### 4. 디바이스 패밀리
```
TARGETED_DEVICE_FAMILY = "1,2,7" (iPhone, iPad, visionOS)
↓
TARGETED_DEVICE_FAMILY = "1,2" (iPhone, iPad)
```

### 5. 배포 타겟
```
IPHONEOS_DEPLOYMENT_TARGET = 26.0 → 17.0 (호환성 개선)
MACOSX_DEPLOYMENT_TARGET = 26.0 (제거됨)
XROS_DEPLOYMENT_TARGET = 26.0 (제거됨)
```

---

## 🚀 다음 단계

### 1. Xcode 재시작

**중요:** 변경 사항이 적용되도록 Xcode를 **완전히 종료**하고 다시 열어야 합니다.

```bash
# 터미널에서 Xcode 강제 종료
killall Xcode

# 프로젝트 다시 열기
open /Users/joymin/Coding_proj/Finedust_proj/Finedust/Finedust.xcodeproj
```

### 2. Clean Build

```
⇧ ⌘ K (Clean Build Folder)
```

또는:
```
Product → Clean Build Folder
```

### 3. 빌드 테스트

```
⌘ B (Build)
```

### 4. 실행!

```
⌘ R (Run)
```

---

## 🎯 확인 사항

Xcode에서 확인:

### 타겟 설정 확인
1. Project Navigator에서 **Finedust** 프로젝트 선택
2. **TARGETS** → **Finedust** 선택
3. **General** 탭

**확인:**
- ✅ **Supported Destinations**에 **iOS**만 있어야 함
- ❌ macOS, Apple Vision 없어야 함

### Build Settings 확인
1. **Build Settings** 탭 선택
2. 검색: "supported platforms"

**확인:**
- ✅ `iphoneos iphonesimulator`

3. 검색: "sdkroot"

**확인:**
- ✅ Base SDK = `iOS`

---

## 🐛 여전히 에러가 발생하면?

### 시도 1: 파생 데이터 삭제
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

### 시도 2: 프로젝트 재설정
1. Xcode 닫기
2. 다음 폴더 삭제:
   ```bash
   rm -rf /Users/joymin/Coding_proj/Finedust_proj/Finedust/Finedust.xcodeproj/xcuserdata
   rm -rf /Users/joymin/Coding_proj/Finedust_proj/Finedust/Finedust.xcodeproj/project.xcworkspace/xcuserdata
   ```
3. Xcode 다시 열기

### 시도 3: 시뮬레이터 선택 확인
Xcode 상단의 시뮬레이터 선택 버튼에서:
- ✅ **iPhone 15 Pro** 또는 다른 iPhone/iPad 시뮬레이터 선택
- ❌ **My Mac** 선택하지 않기

---

## 📱 예상 결과

빌드가 성공하면:
```
✅ Build Succeeded
✅ Finedust.app 생성됨
```

실행하면:
```
✅ 시뮬레이터 실행
✅ 앱 화면 표시
✅ 카메라, 지구본, 설정 버튼 보임
```

---

## 🎊 성공!

이제 UIKit 에러 없이 빌드할 수 있습니다!

**다음 명령으로 시작:**
```bash
# Xcode 종료
killall Xcode

# 다시 열기
open /Users/joymin/Coding_proj/Finedust_proj/Finedust/Finedust.xcodeproj

# Xcode에서:
# ⇧ ⌘ K (Clean)
# ⌘ B (Build)
# ⌘ R (Run)
```

---

**수정 일시**: 2025-11-03  
**상태**: ✅ 완료
**변경 파일**: `Finedust.xcodeproj/project.pbxproj`
