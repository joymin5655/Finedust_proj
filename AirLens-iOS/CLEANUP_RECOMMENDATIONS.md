# 🧹 프로젝트 정리 권장사항

## 📋 분석 결과

### ✅ 통합 상태: 완료
**모든 기능이 하나의 앱으로 완벽하게 통합되어 있습니다!**

---

## 🔍 발견된 미사용 파일

### GeminiAPIService.swift
- **위치**: `/AirLens/Services/GeminiAPIService.swift`
- **상태**: ⚠️ **코드베이스에서 사용되지 않음**
- **이유**: 프로젝트가 네이티브 ML로 전환되면서 더 이상 필요하지 않음

**현재 사용되는 서비스:**
- ✅ `PM25PredictionService` (네이티브 ML 기반)
- ✅ `LocationService` (CoreLocation 기반)

**GeminiAPIService는:**
- Gemini API를 사용한 이미지 분석 (구버전)
- Gemini API를 사용한 위치 조회 (구버전)
- Mock 데이터 모드 지원

---

## 💡 정리 옵션

### 옵션 1: 삭제 (권장) ✨
**장점:**
- 깔끔한 코드베이스
- 프로젝트 크기 감소
- 불필요한 파일 제거
- 혼란 방지

**삭제 방법:**
```bash
# 백업 생성 (안전을 위해)
cp /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS/AirLens/Services/GeminiAPIService.swift \
   /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS/GeminiAPIService.swift.backup

# 파일 삭제
rm /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS/AirLens/Services/GeminiAPIService.swift
```

### 옵션 2: 보관 (백업용)
**장점:**
- 향후 Gemini API 사용 시 참고 가능
- 이전 구현 방식 보존

**방법:**
```bash
# Archive 폴더 생성
mkdir -p /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS/Archive

# 파일 이동
mv /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS/AirLens/Services/GeminiAPIService.swift \
   /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS/Archive/
```

### 옵션 3: 유지 (현재 상태)
**상황:**
- 향후 Gemini API 재도입 계획이 있는 경우
- 하지만 Xcode 프로젝트에서 제외 필요

---

## 📝 권장 작업 순서

### 1단계: 백업 생성 ✅
```bash
cd /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS

# 백업 폴더 생성
mkdir -p Backup/$(date +%Y%m%d)

# GeminiAPIService 백업
cp AirLens/Services/GeminiAPIService.swift \
   Backup/$(date +%Y%m%d)/GeminiAPIService.swift
```

### 2단계: Xcode에서 파일 제거 🗑️
```
1. Xcode 열기
2. Project Navigator에서 GeminiAPIService.swift 찾기
3. 우클릭 → Delete
4. "Move to Trash" 선택 (또는 "Remove Reference" - 파일 보존)
```

### 3단계: 빌드 테스트 ✅
```bash
# Xcode에서:
⌘ B (Build)

# 에러가 없어야 함 (GeminiAPIService는 사용되지 않으므로)
```

### 4단계: Git 커밋 (선택사항) 📦
```bash
git add .
git commit -m "chore: Remove unused GeminiAPIService

- Replaced with native PM25PredictionService
- Replaced with native LocationService (CoreLocation)
- Backed up to Archive/ for future reference"
```

---

## 🎯 최종 권장사항

**✅ 추천: 옵션 2 (보관)**

이유:
1. 코드베이스 정리
2. 향후 참고를 위해 백업 보존
3. Xcode 프로젝트에서는 제거
4. 안전한 방법

**실행 명령:**
```bash
# 한 번에 실행
cd /Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS && \
mkdir -p Archive && \
cp AirLens/Services/GeminiAPIService.swift Archive/ && \
echo "✅ GeminiAPIService backed up to Archive/"
```

그 다음 Xcode에서 파일 참조만 제거하면 됩니다.

---

## 📊 정리 후 상태

### 정리 전 (현재)
```
Services/
├── PM25PredictionService.swift    ✅ 사용 중
├── LocationService.swift           ✅ 사용 중
└── GeminiAPIService.swift          ⚠️ 미사용
```

### 정리 후 (목표)
```
Services/
├── PM25PredictionService.swift    ✅ 사용 중
└── LocationService.swift           ✅ 사용 중

Archive/
└── GeminiAPIService.swift          📦 백업
```

---

## 💬 추가 확인 사항

### README.md 업데이트 필요
GeminiAPIService 언급 제거:
```markdown
# Before
├── Services/
│   ├── GeminiAPIService.swift
│   └── LocationService.swift

# After
├── Services/
│   ├── PM25PredictionService.swift
│   └── LocationService.swift
```

---

**작성일**: 2025-11-03  
**상태**: 정리 권장 사항 제공 완료  
**다음 단계**: 사용자 결정 대기
