# 🚨 Info.plist 오류 빠른 해결

## 현재 오류
```
Cannot code sign because the target does not have an Info.plist file
```

---

## ⚡ 즉시 해결 방법 (2분)

### 🎯 방법 1: Build Settings에서 경로 설정 (가장 빠름!)

**Xcode에서 다음 단계를 따라하세요:**

```
1. 좌측 Project Navigator에서 프로젝트 이름 클릭 (파란 아이콘)

2. TARGETS → iOS_App_fd (또는 AirLens) 선택

3. "Build Settings" 탭 클릭

4. 검색창에 "info.plist file" 입력

5. "Packaging" 섹션 → "Info.plist File" 찾기

6. 값을 다음으로 변경:
   iOS_App_fd/Info.plist

   또는 절대 경로:
   $(SRCROOT)/Info.plist

7. Clean Build: ⌘⇧K

8. Build: ⌘B

✅ 완료!
```

---

### 🎯 방법 2: 자동 생성 활성화 (현대적 방법)

```
1. TARGETS → Build Settings

2. 검색: "generate info"

3. "Generate Info.plist File" 찾기

4. 값을 "YES"로 변경

5. ⌘⇧K (Clean Build)

6. ⌘B (Build)

✅ 완료!
```

**이 방법을 선택하면:**
- Xcode가 자동으로 Info.plist 생성
- TARGETS → Info 탭에서 권한 추가 가능

---

### 🎯 방법 3: 파일 다시 추가

```
1. Project Navigator에서 Info.plist 우클릭 → Delete
   → "Remove Reference" 선택 (파일 삭제 아님!)

2. 메뉴: File → Add Files to "iOS_App_fd"

3. Info.plist 파일 선택

4. 옵션 체크:
   ✅ Copy items if needed
   ✅ Add to targets: iOS_App_fd

5. Add 클릭

6. ⌘⇧K (Clean Build)

7. ⌘B (Build)

✅ 완료!
```

---

## 🔍 올바른 설정 확인

### Build Settings에서 확인할 내용:

```
Info.plist File: iOS_App_fd/Info.plist
또는: $(SRCROOT)/Info.plist

Product Bundle Identifier: com.yourname.airlens
Display Name: AirLens
```

### Info.plist 파일 경로 확인:

```bash
# 터미널에서
cd /Users/joymin/Coding_proj/Finedust_proj
ls -la iOS_App_fd/Info.plist

# 결과가 나와야 함:
# -rw-r--r-- ... Info.plist
```

---

## 📸 스크린샷으로 보는 단계

### Build Settings 화면:

```
[프로젝트 이름]
  ├── TARGETS
  │   └── iOS_App_fd
  │       ├── General
  │       ├── Build Settings  ← 여기 클릭!
  │       ├── Signing & Capabilities
  │       └── Info
```

### Info.plist File 설정:

```
Packaging
  └── Info.plist File: iOS_App_fd/Info.plist
```

---

## ⚠️ 여전히 안 된다면?

### 체크리스트:

- [ ] Xcode 프로젝트 파일(.xcodeproj)이 존재하나?
- [ ] Info.plist 파일이 존재하나?
- [ ] Build Settings에서 경로가 올바른가?
- [ ] Clean Build를 했나? (⌘⇧K)
- [ ] 프로젝트를 재시작했나?

### 최후의 방법: Derived Data 삭제

```
1. Xcode → Preferences (⌘,)

2. Locations 탭

3. Derived Data 경로 확인
   (보통: ~/Library/Developer/Xcode/DerivedData)

4. Finder로 열기

5. 프로젝트 관련 폴더 삭제

6. Xcode 재시작

7. ⌘⇧K, ⌘B
```

---

## 🎉 성공 확인

다음이 가능하면 성공:

```
⌘B  → Build 성공
⌘R  → Simulator 실행 성공
```

---

## 💡 추가 팁

### 프로젝트가 없다면?

먼저 Xcode 프로젝트를 생성해야 합니다:

```
1. Xcode → File → New → Project
2. iOS → App 선택
3. Product Name: AirLens
4. Interface: SwiftUI
5. Language: Swift
6. 저장 위치: /Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd
```

자세한 내용은 `PROJECT_SETUP.md` 참조!

---

## 🆘 도움이 필요하면?

1. `FIX_INFO_PLIST.md` - 상세한 해결 방법
2. `PROJECT_SETUP.md` - 프로젝트 생성 가이드
3. `XCODE_GUIDE.md` - Xcode 사용법

---

**가장 빠른 해결: 방법 1 → Clean Build → Build!** 🚀
