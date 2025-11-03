# 🚀 Finedust 앱 빠른 시작 가이드

## ✅ 통합 완료!

모든 코드 파일이 성공적으로 복사되었습니다. 이제 Xcode에서 프로젝트를 설정하면 바로 실행할 수 있습니다!

---

## 📱 Step 1: Xcode에서 프로젝트 열기

```bash
open /Users/joymin/Coding_proj/Finedust_proj/Finedust/Finedust.xcodeproj
```

또는 Finder에서:
1. `/Users/joymin/Coding_proj/Finedust_proj/Finedust/` 폴더 열기
2. `Finedust.xcodeproj` 더블클릭

---

## 📁 Step 2: 파일을 Xcode 프로젝트에 추가

**중요:** 파일들이 폴더에 복사되었지만, Xcode 프로젝트에는 아직 참조가 추가되지 않았습니다.

### 방법 A: 한 번에 모두 추가 (권장) 🌟

1. **Xcode 열기**

2. **Project Navigator에서 `Finedust` 폴더 찾기**
   - 왼쪽 사이드바 최상단의 파란색 Finedust 아이콘

3. **우클릭 → "Add Files to Finedust..."**

4. **다음 폴더들을 선택 (⌘ 키 눌러서 다중 선택)**
   - `Models/`
   - `Views/`
   - `ViewModels/`
   - `Services/`
   - `Utilities/`
   - `Resources/`

5. **옵션 확인**
   - ✅ "Copy items if needed" (체크 해제)
   - ✅ "Create groups" (선택)
   - ✅ "Finedust" 타겟 체크

6. **"Add" 클릭**

### 방법 B: 개별로 추가

각 폴더를 하나씩 드래그 앤 드롭:
1. Finder에서 `/Users/joymin/Coding_proj/Finedust_proj/Finedust/Finedust/Models` 폴더 열기
2. `Models` 폴더를 Xcode Project Navigator의 `Finedust` 폴더로 드래그
3. "Create groups" 선택
4. "Finish" 클릭
5. 다른 폴더들도 반복 (Views, ViewModels, Services, Utilities, Resources)

---

## ⚙️ Step 3: Info.plist 설정

1. **프로젝트 선택** (왼쪽 상단 파란색 Finedust 아이콘)

2. **Finedust 타겟 선택** (TARGETS 아래)

3. **"Build Settings" 탭**

4. **검색창에 "info" 입력**

5. **"Info.plist File" 찾기**

6. **값을 다음으로 설정:**
   ```
   Finedust/Info.plist
   ```

7. **⌘ S (저장)**

---

## 🔨 Step 4: 빌드 및 실행

### 빌드 테스트
```
⌘ B (Build)
```

**예상 결과:** "Build Succeeded" ✅

### 시뮬레이터 실행
```
⌘ R (Run)
```

**예상 결과:** 앱이 시뮬레이터에서 실행됨 🎉

---

## 🐛 문제 해결

### ❌ 에러: "No such file or directory"

**증상:** 빌드 시 파일을 찾을 수 없다는 에러

**해결:**
1. 해당 파일이 Project Navigator에 빨간색으로 표시되는지 확인
2. 파일 우클릭 → "Delete" → "Remove Reference"
3. Step 2로 돌아가서 파일 다시 추가

### ❌ 에러: "Multiple commands produce..."

**증상:** Info.plist 관련 빌드 에러

**해결:**
1. Project Settings → Build Phases
2. "Copy Bundle Resources" 확장
3. Info.plist가 있으면 "-" 버튼으로 제거
4. 다시 빌드

### ❌ 경고: "Info.plist not found"

**증상:** Info.plist 찾을 수 없음

**해결:**
- Step 3 다시 확인
- Build Settings에서 Info.plist 경로가 정확한지 확인

### ⚠️ 카메라가 시뮬레이터에서 작동 안 함

**원인:** 시뮬레이터는 실제 카메라가 없음

**해결:**
- "Upload" 버튼 사용해서 갤러리에서 이미지 선택
- 또는 실제 iPhone에서 테스트

---

## 📊 최종 확인 체크리스트

### 프로젝트 구조 확인
- [ ] Models 폴더와 DataModels.swift 보임
- [ ] Views 폴더와 5개 뷰 파일 보임
- [ ] ViewModels 폴더와 CameraViewModel.swift 보임
- [ ] Services 폴더와 2개 서비스 파일 보임
- [ ] Utilities 폴더와 3개 유틸리티 파일 보임
- [ ] Info.plist 파일 보임

### 빌드 테스트
- [ ] ⌘ B 실행 → "Build Succeeded" 확인
- [ ] 에러 0개
- [ ] 경고 최소화 (몇 개는 괜찮음)

### 실행 테스트
- [ ] ⌘ R 실행 → 시뮬레이터 열림
- [ ] 앱 실행됨
- [ ] 검은 배경에 "AirLens" (또는 "Finedust") 헤더 보임
- [ ] 3D 지구본 애니메이션 작동
- [ ] "Capture", "Upload" 버튼 보임

---

## 🎨 UI 미리보기 활성화

빠른 UI 개발을 위해 Xcode 미리보기 사용:

1. **뷰 파일 열기** (예: CameraView.swift)

2. **미리보기 열기**
   ```
   ⌥ ⌘ Enter (Option + Command + Enter)
   ```

3. **실시간 모드 켜기**
   ```
   ⌘ ⌥ ⌃ P (Command + Option + Control + P)
   ```

4. **코드 수정 → 즉시 미리보기 업데이트!** ✨

---

## 📱 주요 기능 테스트

### 1. 카메라 캡처
- "Capture" 버튼 클릭
- 시뮬레이터에서는 작동 안 함 (정상)

### 2. 이미지 업로드
- "Upload" 버튼 클릭
- 갤러리에서 하늘 사진 선택
- PM2.5 분석 결과 표시됨

### 3. 글로벌 맵
- 오른쪽 상단 지구본 아이콘 클릭
- 3D 지도 표시됨
- 측정소 위치 표시됨

### 4. 설정
- 오른쪽 상단 톱니바퀴 아이콘 클릭
- 다크 모드 토글 작동
- 언어 선택 작동

---

## 🎯 다음 단계

### 개발 계속하기
```bash
# Xcode 미리보기 가이드
open /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS/XCODE_PREVIEW_GUIDE.md

# 통합 리포트
open /Users/joymin/Coding_proj/Finedust_proj/Finedust/INTEGRATION_COMPLETE.md
```

### 커스터마이징
- 앱 이름 변경: `FinedustApp.swift`와 `Info.plist` 수정
- 색상 테마: `Utilities/Colors.swift` 수정
- UI 레이아웃: 각 View 파일 수정

### 실제 디바이스 테스트
1. iPhone을 Mac에 연결
2. Xcode 상단에서 디바이스 선택
3. ⌘ R 실행
4. 실제 카메라로 하늘 촬영 및 분석 테스트

---

## 💡 유용한 단축키

```
⌘ B          - 빌드
⌘ R          - 실행
⌘ .          - 빌드 중단
⌥ ⌘ Enter    - 미리보기 열기/닫기
⌘ ⌥ P        - 미리보기 새로고침
⇧ ⌘ K        - Clean Build Folder
```

---

## 🆘 도움이 필요하면

### 문서 참고
- `INTEGRATION_COMPLETE.md` - 전체 통합 리포트
- `../AirLens-iOS/PROJECT_INTEGRATION_REPORT.md` - 원본 프로젝트 분석
- `../AirLens-iOS/XCODE_PREVIEW_GUIDE.md` - 미리보기 가이드

### 에러 로그 확인
1. Xcode → View → Debug Area → Show Debug Area
2. 콘솔 메시지 확인
3. 빨간색 에러 메시지 읽기

---

## 🎉 성공!

**모든 단계를 완료하면 Finedust 앱이 완벽하게 작동합니다!**

축하합니다! 🎊

---

**작성일**: 2025-11-03  
**버전**: 1.0  
**프로젝트**: Finedust (from AirLens-iOS)
