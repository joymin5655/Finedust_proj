# 🔧 Info.plist 중복 에러 해결 완료

## ✅ 수정 완료!

**에러**: Multiple commands produce Info.plist
**원인**: Xcode가 자동으로 Info.plist를 생성하려고 하는데, 우리가 만든 Info.plist와 충돌
**해결**: GENERATE_INFOPLIST_FILE = NO로 변경

---

## 🔍 수정된 내용

```
GENERATE_INFOPLIST_FILE = YES → NO
INFOPLIST_FILE = Finedust/Info.plist (추가)
```

이제 Xcode가 자동으로 Info.plist를 생성하지 않고, 우리가 만든 `/Finedust/Info.plist`를 사용합니다.

---

## 🚀 빌드 다시 시도

### 1. Clean Build
```
⇧ ⌘ K (Shift + Command + K)
```

### 2. 빌드
```
⌘ B (Command + B)
```

### 3. 실행
```
⌘ R (Command + R)
```

---

## 🐛 여전히 에러가 발생하면?

### 추가 해결 방법 1: Copy Bundle Resources 확인

Xcode에서:
1. 프로젝트 선택 (파란색 Finedust)
2. TARGETS → Finedust
3. **Build Phases** 탭
4. **Copy Bundle Resources** 확장
5. `Info.plist`가 있으면 **"-" 버튼**으로 제거
6. Clean Build 후 다시 빌드

### 추가 해결 방법 2: 파생 데이터 삭제

터미널에서:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

그 다음:
1. Xcode 재시작
2. ⇧ ⌘ K (Clean)
3. ⌘ B (Build)

### 추가 해결 방법 3: Info.plist 파일 위치 확인

파일이 정확한 위치에 있는지 확인:
```
/Users/joymin/Coding_proj/Finedust_proj/Finedust/Finedust/Info.plist
```

파일이 있으면:
```bash
ls -la /Users/joymin/Coding_proj/Finedust_proj/Finedust/Finedust/Info.plist
```

---

## 📱 빌드 성공 시 확인사항

빌드가 성공하면:
- ✅ "Build Succeeded" 메시지
- ✅ 에러 0개
- ✅ 시뮬레이터에서 앱 실행

---

## 🎯 최종 체크리스트

- [x] GENERATE_INFOPLIST_FILE = NO
- [x] INFOPLIST_FILE = Finedust/Info.plist 설정
- [ ] Clean Build (⇧ ⌘ K)
- [ ] 빌드 (⌘ B)
- [ ] 실행 (⌘ R)

---

**수정 일시**: 2025-11-03  
**상태**: ✅ 설정 완료  
**다음 단계**: Clean Build 후 재빌드
