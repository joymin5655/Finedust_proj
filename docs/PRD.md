# AirLens PRD — API-based Data Integration Edition
> Version 2.0 | 2025-02  
> **방향 전환**: 모델 학습 없이, 3개 API 키(WAQI / OpenAQ / Earthdata) + GitHub Actions 자동화로 고도화된 AirLens 구현

---

## 1. 배경 & 방향 전환 요약

### 이전 방향의 문제
- ONNX 모델 학습 → 브라우저 실행 구조는 학습 비용·데이터 파이프라인 복잡도가 너무 높았음.
- AOD-MLR 위성 모델 시뮬레이션도 실제 위성 데이터 없이는 신뢰도가 낮음.

### 새 방향
```
모델 학습 포기 → "3-API 데이터 통합형" 제품으로 전환
```
| 역할 | 담당 API | 업데이트 주기 |
|------|----------|-------------|
| 실시간 AQI (Today/Globe) | WAQI | 6시간 (GitHub Actions) |
| 공공 연/일 평균 PM2.5 (Policy/추세) | OpenAQ v3 | 주 1회 |
| 위성 AOD 시각화 맥락 (Globe/Policy) | NASA Earthdata | 월 1회 |

**핵심 원칙**: 모든 API 호출은 Actions + Python 스크립트에서 처리 → JSON/PNG를 `app/data/`에 커밋 → 프론트는 정적 파일만 fetch.

---

## 2. 데이터 소스별 역할

### 2.1 WAQI (`WAQI_TOKEN`)
- **역할**: 전 세계 60+ 도시 실시간 AQI, PM2.5, PM10, 기상 데이터
- **인증**: URL 쿼리 파라미터 `?token=...` (Actions에서만 사용)
- **엔드포인트**:
  - 도시별: `https://api.waqi.info/feed/{city}/?token=...`
  - 좌표 기반: `https://api.waqi.info/feed/geo:{lat};{lon}/?token=...`
  - bbox 전체: `https://api.waqi.info/v2/map/bounds?latlng=...&token=...`
- **결과물**:
  - `app/data/waqi/latest.json` — 도시별 AQI + 오염물질 + 날씨
  - `app/data/waqi/global-stations.json` — 전 세계 측정소 마커
  - `app/data/waqi/history/YYYY-MM-DD.json` — 일별 히스토리

### 2.2 OpenAQ (`OPENAQ_API_KEY`)
- **역할**: 국가/도시별 PM2.5 연평균·일평균 시계열 (Policy 추세 분석 핵심)
- **인증**: 헤더 `X-API-Key: ...` (Actions에서만 사용)
- **엔드포인트**:
  - `/v3/locations` → 도시+국가 기반 PM2.5 센서 검색
  - `/v3/sensors/{id}/years` → 연평균 시계열
  - `/v3/sensors/{id}/days` → 일평균 시계열 (최근 90일)
- **결과물**:
  - `app/data/openaq/pm25_years.json` — 27개 도시 연간 추세
  - `app/data/openaq/pm25_days.json` — 최근 90일 일간 추세
  - `app/data/openaq/stations.json` — 측정소 메타 정보

### 2.3 NASA Earthdata (`EARTHDATA_TOKEN`)
- **역할**: MODIS AOD(550nm) 위성 데이터로 대기 입자 시각화 배경 제공
- **인증**: Bearer 토큰 (AppEEARS API, Actions에서만 사용)
- **엔드포인트**: AppEEARS Point Sampling API
  - 태스크 제출 → 폴링 → CSV 다운로드 → JSON 변환
- **결과물**:
  - `app/data/earthdata/aod_samples.json` — 15개 도시 AOD + 트렌드
  - `app/data/earthdata/aod_trend.json` — Globe 마커용 요약

---

## 3. 시스템 아키텍처

```
[GitHub Actions — 자동 실행]
    ├─ scripts/fetch-waqi-data.js         (6h 주기)
    ├─ scripts/python/fetch_openaq.py     (주 1회)
    ├─ scripts/python/fetch_earthdata_aod.py (월 1회)
    └─ scripts/python/build_policy_effect.py (OpenAQ 이후)
              ↓ (git commit & push)
[app/data/ — 정적 JSON 파일]
    ├─ waqi/latest.json
    ├─ waqi/global-stations.json
    ├─ openaq/pm25_years.json
    ├─ openaq/pm25_days.json
    ├─ earthdata/aod_samples.json
    └─ policy-impact/policy_effect_basic.json
              ↓ (fetch)
[GitHub Pages — 프론트엔드]
    ├─ index.html (Today)      ← waqiService + openaqService + earthdataService
    ├─ globe.html (Globe)      ← waqiService + earthdataService (AOD overlay)
    └─ policy.html (Policy)    ← openaqService + earthdataService + policy-enhanced.js
```

---

## 4. 레포 구조

```
Finedust_proj/
├─ app/
│   ├─ index.html              # Today 페이지
│   ├─ globe.html              # Globe 페이지
│   ├─ policy.html             # Policy 페이지
│   ├─ js/
│   │   ├─ today-enhanced.js   # Today 강화 모듈
│   │   ├─ globe-data-integration.js  # Globe 데이터 통합
│   │   ├─ policy-enhanced.js  # Policy 강화 모듈
│   │   └─ services/
│   │       ├─ waqiService.js        # ★ WAQI JSON 로더 (프론트)
│   │       ├─ openaqService.js      # OpenAQ JSON 로더
│   │       └─ earthdataService.js   # Earthdata AOD 로더
│   └─ data/                   # Actions가 생성하는 파일들
│       ├─ waqi/
│       │   ├─ latest.json
│       │   └─ global-stations.json
│       ├─ openaq/
│       │   ├─ pm25_years.json
│       │   └─ pm25_days.json
│       ├─ earthdata/
│       │   ├─ aod_samples.json
│       │   └─ aod_trend.json
│       └─ policy-impact/
│           ├─ policies.json
│           └─ policy_effect_basic.json
├─ scripts/
│   ├─ fetch-waqi-data.js      # WAQI Node.js 스크립트
│   └─ python/
│       ├─ fetch_openaq.py     # OpenAQ Python 스크립트
│       ├─ fetch_earthdata_aod.py    # Earthdata Python 스크립트
│       └─ build_policy_effect.py   # 정책 효과 계산
└─ .github/workflows/
    └─ update_airdata.yml       # 자동 업데이트 워크플로우
```

---

## 5. 페이지별 기능 명세

### 5.1 Today 페이지 (`index.html`)

**데이터 소스 우선순위**:
1. `waqi/latest.json` → 실시간 AQI, 가장 가까운 도시 찾기 (위도/경도 거리 계산)
2. `openaq/pm25_years.json` → 해당 도시 연간 PM2.5 트렌드 차트
3. `earthdata/aod_samples.json` → 도시 AOD 값 + 트렌드 방향

**UI 컴포넌트**:
- 위치 감지 (Geolocation API 또는 도시 선택 드롭다운)
- 메인 AQI 카드 (등급/색상/행동 가이드)
- WAQI 실시간 카드 (`#waqi-realtime-card`)
- OpenAQ 연간 트렌드 미니 차트 (`#openaq-trend-container`)
- NASA AOD 카드 (`#earthdata-aod-container`)

### 5.2 Globe 페이지 (`globe.html`)

**데이터 소스**:
- `waqi/latest.json` → 도시 AQI 포인트 마커
- `waqi/global-stations.json` → 전 세계 측정소 마커 (밀도 높음)
- `earthdata/aod_trend.json` → AOD 오버레이 포인트

**기능**:
- Three.js 3D 지구본 렌더링
- AQI → 색상 코드 마커 (good=파랑, moderate=노랑, unhealthy=빨강)
- 도시 클릭 → Today/Policy 딥링크
- 패널: 데이터 소스 카운트, 상위 PM2.5 감소 국가

### 5.3 Policy 페이지 (`policy.html`)

**데이터 소스**:
- 정적 `policies.json` (큐레이션된 133개 정책)
- `openaq/pm25_years.json` → 국가 선택 시 연간 트렌드 차트
- `policy-impact/policy_effect_basic.json` → Before/After 정책 효과
- `earthdata/aod_samples.json` → 국가 수도 AOD 값

**기능**:
- 국가/지역 검색 & 필터
- 정책 카드 클릭 → 상세 패널
- OpenAQ 트렌드 차트 + Policy Effect 분석 (Before/After %)
- NASA AOD 패널

---

## 6. GitHub Actions 워크플로우 설계

### 실행 스케줄
```yaml
on:
  workflow_dispatch:           # 수동 실행
  schedule:
    - cron: '0 */6 * * *'    # WAQI: 6시간마다
    - cron: '0 2 * * 0'      # OpenAQ + Earthdata: 매주 일요일 02:00
```

### Secrets 설정
- `WAQI_TOKEN` → Node.js 스크립트
- `OPENAQ_API_KEY` → Python 스크립트 (헤더 인증)
- `EARTHDATA_TOKEN` → Python 스크립트 (Bearer 인증)

### Job 구조
| Job | 스크립트 | 결과물 |
|-----|----------|--------|
| update-waqi | fetch-waqi-data.js | waqi/latest.json, global-stations.json |
| update-openaq | fetch_openaq.py + build_policy_effect.py | openaq/*.json, policy-impact/*.json |
| update-earthdata | fetch_earthdata_aod.py | earthdata/aod_samples.json |

---

## 7. 프론트엔드 서비스 레이어

### 7.1 waqiService.js
```js
// 핵심 함수
loadWaqiLatest()          → { cities, updated_at, count }
loadGlobalStations()      → { stations, count }
findNearestCity(lat, lon) → { aqi, city, pollutants, weather }
getAqiInfo(aqi)           → { label, color, bg, guide }
```

### 7.2 openaqService.js
```js
loadPm25Years()                        → { data: [{city, country, data:[{year,avg}]}] }
getCityYearlyTrend(city, country)      → [{year, avg}]
getCityDailyTrend(city, days)          → [{date, avg}]
getCountryLatestPm25(countryCode)      → number
```

### 7.3 earthdataService.js
```js
loadAodSamples()     → { cities: [{city, aod_annual_avg, trend, timeseries}] }
getCityAod(city)     → { aod_annual_avg, trend, source }
getAllAodPoints()     → [{city, lat, lon, aod, trend}]
aodToColor(aod)      → '#rrggbb'
aodToLabel(aod)      → 'Low' | 'Moderate' | 'High' ...
```

---

## 8. 보안 규칙

| 규칙 | 이유 |
|------|------|
| 3개 토큰 모두 GitHub Secrets에만 보관 | 클라이언트 노출 시 쿼터 탈취 위험 |
| 프론트에서 외부 API 직접 호출 금지 | CORS 문제 + 토큰 노출 방지 |
| Actions → JSON 생성 → 프론트 fetch 패턴 유지 | Rate limit 절약 + 보안 |
| `app/data/` 파일만 public | 스크립트/토큰은 절대 노출 안 됨 |

---

## 9. 로컬 개발 워크플로우

```bash
# 1. 로컬 서버 실행 (app/ 기준)
cd /Volumes/WD_BLACK\ SN770M\ 2TB/My_proj/Finedust_proj
python3 -m http.server 8000 --directory app

# 2. 브라우저에서 확인
open http://localhost:8000

# 3. 샘플 데이터로 테스트 (Actions 실행 전)
# app/data/ 폴더에 sample JSON들이 포함되어 있음

# 4. 실제 Actions 실행 (GitHub에서 수동 실행)
# Settings → Secrets에 3개 키 등록 후
# Actions → "Update AirLens Data" → Run workflow
```

---

## 10. 향후 로드맵

| Phase | 목표 | 예상 시간 |
|-------|------|----------|
| v1.0 (현재) | 3 API 통합 + Actions 자동화 동작 확인 | 완료 |
| v1.1 | 로컬 샘플 데이터 생성 + 전 페이지 연동 | 1일 |
| v1.2 | WAQI bbox 호출로 글로벌 스테이션 밀도 증가 | 1일 |
| v1.3 | Earthdata AppEEARS 실제 AOD 타일 생성 | 2일 |
| v2.0 | 경량 ONNX 모델 (선택사항, 브라우저 내 PM 예측) | 추후 |
