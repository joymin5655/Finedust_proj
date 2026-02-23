# 🌍 AirLens — Global Air Quality Intelligence Platform

> **센서 없는 지역에서도 신뢰 가능한 공기질 정보를 제공하고,  
> 공공정책의 효과를 데이터로 검증하는 오픈소스 플랫폼**

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml)
[![WAQI Data](https://github.com/joymin5655/Finedust_proj/actions/workflows/update-waqi-data.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions/workflows/update-waqi-data.yml)
[![OpenAQ/Earthdata](https://github.com/joymin5655/Finedust_proj/actions/workflows/update_airdata.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions/workflows/update_airdata.yml)

**🔗 Live:** [https://joymin5655.github.io/Finedust_proj/app/](https://joymin5655.github.io/Finedust_proj/app/)

---

## Why AirLens

전 세계 대기질 관측소는 선진국에 집중되어 있습니다.  
개발도상국과 농촌 지역의 수십억 인구는 자신이 마시는 공기의 질조차 알 수 없습니다.

AirLens는 이 격차를 세 가지 접근으로 해소합니다:

| 기능 | 설명 |
|------|------|
| 🌐 **3D Globe** | 실시간 PM2.5를 인터랙티브 3D 지구본에서 시각화 |
| 📊 **Policy Analysis** | 68개국 정책 시행 전후 대기질 변화를 DID 방법론으로 분석 |
| 📸 **Camera AI** | 하늘 사진으로 대기질 등급 추정 (브라우저 내 분석, 서버 전송 없음) |
| 📍 **Today** | GPS 기반 현재 위치 실시간 PM2.5 + 7일 트렌드 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    External APIs                         │
│  OpenAQ · WAQI · Open-Meteo · NASA Earthdata            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              scripts/ (GitHub Actions)                    │
│  fetch_openaq.py · fetch-waqi-data.js                    │
│  fetch_earthdata_aod.py · build_policy_effect.py         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            app/data/ (정적 JSON 저장)                     │
│  waqi/ · openaq/ · earthdata/ · policy-impact/           │
│  country-policies.json · major-cities.json               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           app/js/services/ (데이터 레이어)                 │
│  fusionService ← WAQI + OpenAQ + AOD 통합                │
│  dataService · stationService · locationService          │
│  policy/ (DID-lite 분석 엔진, 6 모듈)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              app/js/globe/ (3D 시각화)                    │
│  globe-core · globe-earth · globe-markers                │
│  globe-data · globe-ui · globe-charts                    │
│  today.js · policy.js · camera.js                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          app/*.html → GitHub Pages                       │
│  globe · today · policy · camera · about · settings      │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Finedust_proj/
├── app/                          ★ Frontend (GitHub Pages)
│   ├── index.html                Today (실시간 대기질)
│   ├── globe.html                3D Globe (핵심 뷰)
│   ├── policy.html               정책 분석 대시보드
│   ├── camera.html               Camera AI (실험)
│   ├── today.html / about.html / research.html / settings.html
│   │
│   ├── js/
│   │   ├── globe/                ★ 모듈화된 Globe (6 파일)
│   │   │   ├── globe-core.js     클래스/init/animate (227줄)
│   │   │   ├── globe-earth.js    지구/대기/구름/별 (361줄)
│   │   │   ├── globe-markers.js  PM2.5·정책 마커 (150줄)
│   │   │   ├── globe-data.js     데이터 로딩 (292줄)
│   │   │   ├── globe-ui.js       이벤트/UI/패널 (504줄)
│   │   │   └── globe-charts.js   차트 렌더링 (209줄)
│   │   │
│   │   ├── services/
│   │   │   ├── fusionService.js  ★ 통합 aggregator (DQSS-lite)
│   │   │   ├── dataService.js    소스별 데이터 로더
│   │   │   ├── waqiService.js    WAQI API 클라이언트
│   │   │   ├── openaqService.js  OpenAQ API 클라이언트
│   │   │   ├── earthdataService.js  NASA AOD
│   │   │   ├── stationService.js / locationService.js / pmService.js
│   │   │   └── policy/           정책 분석 서비스 (6 파일)
│   │   │
│   │   ├── utils/                constants · geo · color · security
│   │   └── globe.js              thin re-export → globe/globe-core.js
│   │
│   ├── data/
│   │   ├── waqi/                 WAQI 캐시 (daily auto-update)
│   │   ├── openaq/               OpenAQ 캐시
│   │   ├── earthdata/            NASA AOD 데이터
│   │   ├── policy-impact/        68개국 정책 효과 JSON
│   │   ├── country-policies.json 국가별 정책 메타데이터
│   │   └── major-cities.json     150+ 도시 좌표
│   │
│   └── css/ · assets/ · public/
│
├── scripts/                      데이터 수집 스크립트
│   ├── fetch-waqi-data.js        WAQI fetcher (Node.js)
│   └── python/
│       ├── fetch_openaq.py       OpenAQ 수집
│       ├── fetch_earthdata_aod.py  NASA AOD
│       └── build_policy_effect.py  정책 효과 산출
│
├── analysis/                     분석 노트북
│   └── policy_effect.ipynb       DID 정책 효과 분석
│
├── docs/                         프로젝트 문서
├── _archive/                     아카이브 (globe-monolith.js 등)
└── .github/workflows/            CI/CD (3 워크플로우)
```

---

## Data Sources

| 소스 | 데이터 | 갱신 주기 | 키 필요 |
|------|--------|----------|---------|
| **WAQI** | 실시간 PM2.5/AQI (150+ 도시) | 매일 (GH Actions) | ✅ `WAQI_TOKEN` |
| **OpenAQ** | 정부 공식 PM2.5 관측 | 매일 (GH Actions) | ✅ `OPENAQ_API_KEY` |
| **EU Copernicus CAMS** | 위성 기반 PM2.5 (Open-Meteo 경유) | 실시간 | ❌ 무료 |
| **NASA Earthdata** | AOD 위성 데이터 (MAIAC/MODIS) | 주간 | ✅ `EARTHDATA_TOKEN` |
| **Open-Meteo** | 기상 데이터 (온도, 습도, 풍속) | 실시간 | ❌ 무료 |
| **World Bank** | GDP, 인구, 도시화율 (예정) | 연간 | ❌ 무료 |

---

## Key Features

### 🌐 3D Globe Visualization
- Three.js 기반 실시간 PM2.5 지구본
- 68개국 정책 마커 + PM2.5 히트맵
- 대기 흐름 파티클 시각화
- 마커 클릭 → 국가 정책·트렌드 상세 패널

### 📊 Policy Impact Analysis (DID-lite)
- 68개국 대기질 정책 시행 전후 비교
- Pre/Post 3년 평균 변화 산출
- WHO 기준선 대비 표시
- 향후: 가중 DID 회귀, parallel trend 검정, event study

### 🔗 Multi-Source Data Fusion
- FusionService: WAQI + OpenAQ + AOD → 단일 통합 뷰
- 좌표 기반 중복 제거 + 교차 소스 검증
- DQSS-lite: 데이터 품질 점수 자동 부착 (freshness, completeness, consistency)
- 정적 API 시뮬레이션 (`getAirQuality`, `getCountrySummary`)

### 📸 Camera AI (실험)
- 하늘 사진 → 대기질 등급 추정
- 브라우저 내 분석 (서버 전송 없음, 프라이버시 보호)
- ONNX 모델 추론 (향후 도입 예정)

---

## Automation (GitHub Actions)

| 워크플로우 | 트리거 | 역할 |
|-----------|--------|------|
| `deploy.yml` | push to main | GitHub Pages 자동 배포 |
| `update-waqi-data.yml` | 매일 00:00 UTC | WAQI 데이터 수집 + 자동 커밋 |
| `update_airdata.yml` | 스케줄 | OpenAQ + Earthdata AOD 수집 |

---

## Security

| 규칙 | 적용 위치 |
|------|----------|
| API 키 저장소 커밋 금지 | `.gitignore` + `security.js` |
| 토큰은 GitHub Secrets만 사용 | `WAQI_TOKEN`, `OPENAQ_API_KEY`, `EARTHDATA_TOKEN` |
| XSS 방지 | `utils/security.js` (esc, safeUrl) |
| 사용자 사진 서버 전송 금지 | Camera AI 브라우저 내 처리 |

---

## Quick Start

```bash
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj

# 로컬 서버 (빌드 불필요)
python3 -m http.server 8000
# 또는: npx serve .

# 브라우저에서 열기
open http://localhost:8000/app/
```

---

## Tech Stack

| 레이어 | 기술 |
|--------|------|
| Frontend | Vanilla JS (ES6+), Tailwind CSS CDN |
| 3D Globe | Three.js + OrbitControls (모듈화 6파일) |
| Charts | Chart.js |
| Data Pipeline | Python (pandas, requests) + Node.js |
| CI/CD | GitHub Actions → GitHub Pages |
| Camera AI | Canvas 픽셀 분석 (향후 ONNX 추론) |

---

## Statistics

| 항목 | 수치 |
|------|------|
| JS 파일 | 46개 |
| JS 코드량 | ~11,700줄 |
| Globe 모듈 | 6개 (1,743줄, 원본 3,131줄에서 분할) |
| 정책 효과 데이터 | 68개국 |
| HTML 페이지 | 9개 |
| GH Actions | 3개 워크플로우 |
| 데이터 수집 스크립트 | 4개 (JS 1 + Python 3) |

---

## Roadmap

### ✅ v1.0 — Completed
- 3D Globe + PM2.5 실시간 시각화
- 68개국 정책 효과 분석 (Pre/Post)
- WAQI + OpenAQ + Earthdata 통합
- Today 카드 + 트렌드 차트
- Camera AI (실험)
- GitHub Actions 자동 데이터 수집

### ✅ v2.0 — Completed
- Globe.js 모듈화 (3,131줄 → 6개 파일)
- FusionService (통합 aggregator + DQSS-lite)
- 서비스 레이어 정리
- utils/ 모듈화 (constants, geo, color, security)

### 🔄 v2.5 — In Progress
- 데이터 파이프라인 통합 (`data_pipeline/`)
- `country_year_panel.parquet` 생성
- World Bank API 통합 (GDP, 인구, 도시화율)
- DID full version (가중 회귀, parallel trend 검정)

### 📋 v3.0 — Planned
- AOD → PM2.5 예측 모델 (RandomForest / XGBoost)
- Quantile 예측 (p10/p50/p90) + 불확실성 표시
- DQSS 고도화 (Bayesian Reliability Engine)
- Anomaly Detection (IsolationForest)
- iOS 앱 전환 (SwiftUI + CoreML)

---

## Pages

| URL | 설명 |
|-----|------|
| `/app/` | **Today** — GPS 기반 실시간 PM2.5 |
| `/app/globe.html` | **Globe** — 3D 인터랙티브 지구본 |
| `/app/policy.html` | **Policy** — 68개국 정책 분석 |
| `/app/camera.html` | **Camera** — 하늘 사진 AI 분석 |
| `/app/about.html` | **About** — 프로젝트 소개 · 방법론 |
| `/app/research.html` | **Research** — 연구 배경 |
| `/app/settings.html` | **Settings** — 언어 · 테마 설정 |

---

## Documentation

| 문서 | 내용 |
|------|------|
| `docs/refactoring_globe_fusion.md` | Globe 분할 + FusionService 구현 보고서 |
| `docs/project_organization.md` | 프로젝트 구조 정리 |
| `docs/PRD.md` | Product Requirements Document |
| `docs/refactoring_summary.md` | 리팩토링 이력 |

---

## Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit with clear messages
4. Push and create a Pull Request

**규칙:**
- API 키/토큰 절대 커밋 금지
- 정책 데이터 수정 시 `data/policies/` PR로 제출
- Globe 수정 시 해당 모듈 파일만 편집 (globe-core, globe-earth 등)

---

## License

MIT License — See [LICENSE](LICENSE) for details.

---

**Made with ❤️ for cleaner air · [@joymin5655](https://github.com/joymin5655)**
