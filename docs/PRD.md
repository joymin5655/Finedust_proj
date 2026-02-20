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


---

## 11. 비즈니스 전략 & 요금제

### 11.1 제품 포지셔닝

| 구분 | AirLens Free | AirLens Pro (v2 이후) |
|------|-------------|----------------------|
| 타겟 | 개인 사용자·학생·환경 관심층 | 스타트업·지자체·ESG팀·연구자 |
| 호스팅 | GitHub Pages (무료) | 별도 도메인 + SaaS 백엔드 |
| 인프라 비용 | ~$0 (GitHub Actions 무료 쿼터) | Supabase/Postgres + 서버 |
| 결제 | 없음 | PayPal (PayPal.me/joymin5655) |

---

### 11.2 Free 버전 — 기능 범위 (현재 v1)

**데이터 범위**
- WAQI: 주요 도시 60개 (국가별 2~5개)
- OpenAQ: 동일 주요 도시 + 일부 국가 단위 시계열
- 갱신 주기: 하루 4회 배치 (GitHub Actions cron)

**사용자 기능 제약**
- 로그인/계정 없음 → 개인 Watchlist/알림/CSV 다운로드 없음
- 임베드 위젯·API 엔드포인트 없음 (웹 UI 전용)
- AI 리포트: 하루 1회 제한 (OpenAI 쿼터 보호)

**기술 전제**
- 전부 정적 사이트 + GitHub Actions → 인프라 비용 $0 목표
- 외부 API 호출은 무료/기본 쿼터 내에서 유지

---

### 11.3 Pro 버전 — 기능 컨셉 (v2 이후)

**결제 수단**: PayPal (PayPal.me 링크)

**추가 기능 목표**
- **계정/워크스페이스**: 이메일 로그인 + 팀 공유
- **Watchlist**: 10~N개 도시 즐겨찾기 + 통합 대시보드
- **고빈도 업데이트**: 10~15분 단위 WAQI/OpenAQ 동기화
- **알림**: AQI/PM2.5 임계값 초과 시 이메일·웹훅·슬랙
- **다운로드**: 과거 N년 PM 시계열 CSV/엑셀
- **AI 리포트**: 무제한 + 월간 건강 요약 PDF
- **API**: 내부 대시보드 연동용 read-only REST API
- **AOD 고급**: 계절·연도별 AOD 지도 + PM 상관 분석
- **Globe Pro**: 수천 개 측정소 레이어 + 시간 슬라이더 + 임베드

---

### 11.4 페이지별 Free ↔ Pro 경계

#### Today
| Free | Pro |
|------|-----|
| 현 위치 단일 AQI 카드 | Watchlist 멀티 카드 뷰 |
| 연도별 PM 차트 1개 | 여러 도시 비교 |
| AI 리포트 1회/일 | 무제한 AI 리포트 + 알림 설정 |

#### Globe
| Free | Pro |
|------|-----|
| 주요 도시 100~200개 마커 | 수천 개 측정소 레이어 + 필터 |
| AOD 텍스처 1~2개 | 시간 슬라이더 + 동적 AOD |
| - | Embeddable iframe 모드 |

#### Policy
| Free | Pro |
|------|-----|
| 연도별 PM 시계열 + 기본 효과 지표 | 정책 유형별 오버레이 + 커스텀 그룹 |
| - | CSV/엑셀/PDF 리포트 export |

---

### 11.5 v1 UI 처리 원칙

- **지금은 Pro 기능 노출하지 않음** — `Coming Soon` 배지 또는 잠금 아이콘으로만 표시
- **Settings 요금제 카드**: Free(현재 플랜) + Plus(PayPal 결제 버튼)
- **PayPal 버튼**: `https://www.paypal.me/{ID}` 링크로 연결 (v1에서는 "관심 표명" 레벨)
- 실제 구독 관리 시스템은 v2에서 구현

---

### 11.6 로드맵 (업데이트)

| Phase | 목표 |
|-------|------|
| **v1.0** (완료) | 3 API 통합 + Actions 파이프라인 + 샘플 데이터 |
| **v1.1** (진행중) | waqiService.js + 로컬 테스트 완성 + 커밋 |
| **v1.2** | Settings 요금제 카드 + PayPal 연결 |
| **v1.3** | WAQI bbox 호출 → 글로벌 스테이션 밀도 증가 |
| **v1.4** | Earthdata AppEEARS 실제 AOD 타일 |
| **v2.0** | Pro SaaS: 계정 + Watchlist + 알림 + API (Supabase 기반) |
| **v2.1** | 결제 자동화 (PayPal Subscription API) |
