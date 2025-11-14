# GitHub Actions 자동 데이터 업데이트 설정 가이드

**목표**: 매일 자동으로 WAQI 데이터를 GitHub에 업데이트  
**현재 상태**: 🔴 실패 (WAQI_TOKEN 시크릿 미설정)  
**소요 시간**: 5분

---

## 📊 현재 문제

```
GitHub Actions 워크플로우 실패:
- Run ID: 19351573877
- Status: ❌ Process completed with exit code 1
- Error: WAQI_TOKEN 시크릿 없음 또는 잘못된 토큰

해결 필요: ✅ WAQI_TOKEN 시크릿 설정
```

---

## 🔑 Step 1: WAQI API 토큰 얻기

### 옵션 A: 공식 WAQI 토큰 (권장)

1. https://aqicn.org/api/ 방문
2. "Sign up for free API key" 클릭
3. 이메일 입력 및 가입
4. 이메일 확인 후 API 토큰 받음
5. 토큰 복사 (예: `a1b2c3d4e5f6g7h8`)

### 옵션 B: 데모 토큰 (제한됨)

```
토큰: demo
제한: 1000 requests/day
테스트용 가능
```

---

## 🔐 Step 2: GitHub Secrets에 토큰 추가

### 방법 1: GitHub 웹 UI (권장)

```
1️⃣ GitHub 저장소 접속
   URL: https://github.com/joymin5655/Finedust_proj

2️⃣ Settings 탭 클릭
   (우측 상단 메뉴)

3️⃣ "Secrets and variables" → "Actions" 클릭
   (좌측 메뉴 → Security 섹션)

4️⃣ "New repository secret" 버튼 클릭

5️⃣ 입력
   Name: WAQI_TOKEN
   Secret: [복사한 API 토큰 붙여넣기]
   
   예: a1b2c3d4e5f6g7h8

6️⃣ "Add secret" 버튼 클릭

✅ 완료! Secrets 목록에 WAQI_TOKEN 표시됨
```

### 방법 2: GitHub CLI (빠름)

```bash
# GitHub CLI 설치 확인
gh --version

# 토큰 설정
gh secret set WAQI_TOKEN --body "a1b2c3d4e5f6g7h8" -R joymin5655/Finedust_proj

# 확인
gh secret list -R joymin5655/Finedust_proj
```

---

## ✅ Step 3: GitHub Actions 워크플로우 테스트

### 수동 실행

```
1️⃣ GitHub 저장소 → Actions 탭

2️⃣ "Update WAQI Data" 워크플로우 선택

3️⃣ "Run workflow" 클릭

4️⃣ "Run workflow" 버튼 (드롭다운에서 main 선택)

⏳ 대기 (1-2분)

✅ 성공 표시:
   - 녹색 체크마크
   - "Update WAQI data - [timestamp]" 커밋 표시
   - app/data/waqi/ 폴더에 최신 데이터
```

### 자동 실행 확인

```
워크플로우는 매일 자정(UTC)에 자동 실행

확인 방법:
1. Actions 탭에서 스케줄 확인
2. "Update WAQI Data" 클릭
3. 최근 실행 이력 확보

일정:
- 매일: 00:00 UTC
- 한국시간: 09:00 KST
```

---

## 📊 데이터 파일 확인

### 생성되는 파일들

```
성공 시 다음 파일들이 생성/업데이트:

app/data/waqi/
├── latest.json              # 최신 데이터 (모든 도시)
├── global-stations.json     # 전 세계 측정소
├── stats.json               # 통계 정보
└── history/
    ├── 2025-11-14.json     # 날짜별 히스토리
    ├── 2025-11-13.json
    └── ...
```

### 파일 내용 예시

```json
// latest.json
{
  "updated_at": "2025-11-14T09:00:00Z",
  "count": 47,
  "cities": [
    {
      "city": "seoul",
      "aqi": 57,
      "pm25": 28.5,
      "location": {
        "name": "Seoul",
        "geo": [37.5665, 126.9780]
      }
    },
    ...
  ]
}
```

---

## 🔍 문제 해결

### 문제 1: "WAQI_TOKEN not found"

```
원인: 시크릿이 설정되지 않음

해결:
1. GitHub Settings → Secrets 확인
2. WAQI_TOKEN이 보이는지 확인
3. 없으면 다시 추가
```

### 문제 2: "HTTP 401 Unauthorized"

```
원인: 잘못된 또는 만료된 토큰

해결:
1. WAQI 웹사이트에서 토큰 확인
2. 새 토큰 생성
3. GitHub Secrets 업데이트
```

### 문제 3: "HTTP 403 Forbidden"

```
원인: API 요청 제한 초과

해결:
1. 유료 API 플랜 업그레이드
2. 데모 토큰 사용 제한 확인
3. 요청 횟수 감소
```

### 문제 4: 데이터 파일이 안 생성됨

```
원인: 워크플로우는 성공했지만 데이터 생성 실패

확인:
1. Actions 로그에서 에러 메시지 확인
2. API 응답 상태 확인
3. 네트워크 연결 확인
```

---

## 📋 워크플로우 파일 설명

### .github/workflows/update-waqi-data.yml

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 매일 자정 UTC
  workflow_dispatch:      # 수동 실행 가능

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      1. 저장소 체크아웃
      2. Node.js 설정
      3. WAQI 토큰 검증
      4. 의존성 설치 (axios)
      5. WAQI 데이터 수집 (scripts/fetch-waqi-data.js)
      6. 데이터 파일 저장
      7. Git 커밋 및 푸시
```

### scripts/fetch-waqi-data.js

```javascript
주요 기능:
✅ 47개 주요 도시의 공기질 데이터 수집
✅ PM2.5, PM10, AQI 값 추출
✅ 전 세계 측정소 데이터 (전역 맵)
✅ JSON 형식으로 저장
✅ 날짜별 히스토리 기록

실행:
npm install axios
WAQI_TOKEN=xxxxx node scripts/fetch-waqi-data.js
```

---

## 🎯 데이터 활용

### Globe 페이지에서 사용

```javascript
// app/js/air-quality-api.js
- WAQI API 통합
- 실시간 데이터 조회
- 캐싱 (30분)
- 오류 처리

// app/js/globe-improved.js
- stations.json 로드
- 마커 생성
- 좌표 변환
- 색상 표시 (AQI 기준)
```

### 데이터 연동 흐름

```
GitHub Actions (매일 09:00 KST)
    ↓
WAQI API에서 데이터 수집
    ↓
app/data/waqi/latest.json 저장
    ↓
GitHub에 자동 커밋 & 푸시
    ↓
사용자 → Globe 페이지 접속
    ↓
stations.json 로드
    ↓
지구본에 마커 표시
    ↓
클릭하면 최신 데이터 표시
```

---

## 📊 성공 지표

### ✅ 워크플로우 성공 체크리스트

```
□ GitHub Actions 로그에서 초록색 체크마크
□ "Process completed with exit code 0" 메시지
□ app/data/waqi/ 폴더에 JSON 파일 생성
□ Git 커밋 메시지: "📊 Update WAQI data - [timestamp]"
□ 데이터 시간: 자동 실행 시간 근처 (09:00 KST)
□ 파일 크기: 최소 10KB 이상
□ JSON 형식: 유효한 JSON (에러 없음)
```

### ⚠️ 실패 체크리스트

```
□ 빨간색 X 표시
□ "exit code 1" 에러
□ 파일이 생성되지 않음
□ 로그에 "WAQI_TOKEN not found"
□ 로그에 HTTP 에러 (401, 403, 404)
```

---

## 🔄 정기적인 모니터링

### 주간 체크리스트

```
□ Monday: 이전주 데이터 업데이트 확인
  → Actions 탭에서 모든 실행이 초록색인지 확인
  
□ Wednesday: 데이터 품질 확인
  → app/data/waqi/stats.json 확인
  → 측정소 개수가 감소했는지 확인
  
□ Friday: 종합 검토
  → 누적 데이터 포인트 확인
  → 글로브 페이지에서 마커 표시 확인
```

### 월별 메인턴스

```
□ 데이터 백업
  → history 폴더에 일일 데이터 보관

□ 토큰 갱신
  → WAQI 토큰 유효성 확인
  → 필요시 새 토큰 발급

□ 성능 분석
  → 데이터 수집 시간 확인
  → API 요청 횟수 모니터링
  → 요청 제한 여유도 확인
```

---

## 📞 지원 및 팁

### 유용한 GitHub Actions 명령어

```bash
# 최근 실행 확인
gh run list -R joymin5655/Finedust_proj --limit 10

# 특정 실행의 로그 보기
gh run view 19351573877 -R joymin5655/Finedust_proj --log

# 워크플로우 재실행
gh run rerun 19351573877 -R joymin5655/Finedust_proj
```

### 빠른 링크

```
GitHub Repository:
https://github.com/joymin5655/Finedust_proj

Actions 탭:
https://github.com/joymin5655/Finedust_proj/actions

Secrets 설정:
https://github.com/joymin5655/Finedust_proj/settings/secrets/actions

WAQI API:
https://aqicn.org/api/

Globe 페이지:
https://joymin5655.github.io/Finedust_proj/app/globe.html
```

---

## 🎉 완료!

모든 단계를 완료하면:

✅ 매일 자동 데이터 업데이트  
✅ GitHub에 히스토리 기록  
✅ Globe 페이지에 실시간 데이터 표시  
✅ 사용자에게 최신 정보 제공

**문제가 있으면 언제든 연락주세요! 📧**
