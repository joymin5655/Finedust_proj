# Finedust 빌드 오류 해결 가이드

## 🔥 문제
`Multiple commands produce Info.plist` 오류 발생

## 🎯 원인
- PBXFileSystemSynchronizedRootGroup이 Finedust 폴더의 모든 파일을 자동으로 Build Phase에 포함
- Info.plist가 Copy Bundle Resources와 Process Info.plist 두 곳에서 처리되어 충돌

## ✅ 해결 방법 (Xcode에서 수행)

### 1단계: Xcode 열기
```bash
open /Users/joymin/Coding_proj/Finedust_proj/Finedust/Finedust.xcodeproj
```

### 2단계: Build Phases 수정
1. 왼쪽 Project Navigator에서 **파란색 Finedust 프로젝트 아이콘** 클릭
2. **TARGETS** → **Finedust** 선택
3. **Build Phases** 탭 클릭
4. **Copy Bundle Resources** 섹션 확장
5. 목록에서 **Info.plist** 찾기
6. Info.plist 선택 후 **"-" 버튼** 클릭하여 제거

### 3단계: Clean Build
```
⇧ ⌘ K (Shift + Command + K)
```

또는 메뉴에서:
```
Product → Clean Build Folder
```

### 4단계: 빌드
```
⌘ B (Command + B)
```

### 5단계: 실행
```
⌘ R (Command + R)
```

## 🔧 대체 방법 (명령줄 - 고급 사용자)

만약 Xcode UI로 해결이 안 되면, 다음 명령어를 실행하세요:

```bash
cd /Users/joymin/Coding_proj/Finedust_proj/Finedust

# 백업 생성
cp Finedust.xcodeproj/project.pbxproj Finedust.xcodeproj/project.pbxproj.backup2

# Python 스크립트로 project.pbxproj 수정 (Info.plist 제외 설정 추가)
python3 << 'EOF'
import sys

# project.pbxproj 읽기
with open('Finedust.xcodeproj/project.pbxproj', 'r') as f:
    content = f.read()

# PBXFileSystemSynchronizedRootGroup에 exceptions 추가
# (이 방법은 복잡하므로 Xcode UI 사용을 권장합니다)

print("⚠️  명령줄 수정이 복잡합니다. Xcode UI를 사용하세요!")
EOF
```

## 📝 현재 상태
- ✅ Info.plist 파일 생성 완료 (`/Users/joymin/Coding_proj/Finedust_proj/Finedust/Finedust/Resources/Info.plist`)
- ✅ GENERATE_INFOPLIST_FILE = NO 설정 완료
- ✅ INFOPLIST_FILE 경로 설정 완료
- ⚠️  Copy Bundle Resources에서 Info.plist 제거 필요 (Xcode UI에서 수행)

## 🎓 왜 이런 문제가 발생하나요?

Xcode 15+는 **PBXFileSystemSynchronizedRootGroup**이라는 새로운 기능을 사용합니다:
- 폴더의 파일들을 자동으로 프로젝트에 동기화
- 장점: 파일 추가/삭제시 project.pbxproj 수정 불필요
- 단점: Info.plist 같은 특수 파일도 자동 포함되어 충돌 발생

**해결책**: Build Phases에서 수동으로 제외해야 함

## 📱 최종 확인

빌드가 성공하면:
```
** BUILD SUCCEEDED **
```

실행하면:
- iPhone 16 Pro 시뮬레이터에서 앱 실행
- 미세먼지 측정 기능 사용 가능

---

**작성일**: 2025-11-04
**문제**: Multiple commands produce Info.plist
**해결**: Xcode Build Phases에서 Info.plist 제거
