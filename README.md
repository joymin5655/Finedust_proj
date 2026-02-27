# 🌍 AirLens — Global Air Quality Intelligence Platform

> An open-source platform for real-time PM2.5 visualization, policy impact analysis, and satellite-based air quality estimation.

[![Deploy to GitHub Pages](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml)
[![Update AirLens Data (Full Pipeline)](https://github.com/joymin5655/Finedust_proj/actions/workflows/update_airdata.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions/workflows/update_airdata.yml)

**🔗 Live:** [https://joymin5655.github.io/Finedust_proj/app/](https://joymin5655.github.io/Finedust_proj/app/)

---

## What is AirLens?

Air quality monitoring stations are concentrated in developed countries.
Billions of people in developing regions have no access to reliable air quality data.

AirLens bridges this gap with three approaches:

| Feature | Description |
|---------|-------------|
| 🌐 **3D Globe** | Interactive real-time PM2.5 visualization |
| 📊 **Policy Analysis** | Before/after analysis of air quality policies in 68 countries (DID-lite) |
| 📍 **Today** | GPS-based real-time PM2.5 + 7-day trend for your location |
| 📸 **Camera AI** | Estimate air quality grade from sky photos (experimental, browser-only) |

---

## Data Sources

| Source | Data | Update | API Key |
|--------|------|--------|---------|
| **WAQI** | Real-time PM2.5 / AQI (150+ cities) | Daily (GitHub Actions) | Required |
| **OpenAQ** | Official government PM2.5 measurements | Weekly (GitHub Actions) | Required |
| **NASA Earthdata** | AOD satellite data (MAIAC/MODIS) | Weekly (GitHub Actions) | Required |
| **Open-Meteo / Copernicus CAMS** | Weather + satellite PM2.5 | Real-time | Free |

> All API keys are stored as **GitHub Secrets** — never hardcoded.

---

## Automated Pipelines (GitHub Actions)

| Workflow | Schedule | Status |
|----------|----------|--------|
| `deploy.yml` | On push to main | Deploy to GitHub Pages |
| `update_airdata.yml` | Daily 00:00 UTC (WAQI) + Weekly Sun 02:00 UTC (OpenAQ + Earthdata) | Full data pipeline |

> ⚠️ `Update AirLens Data` currently requires `OPENAQ_API_KEY` and `EARTHDATA_TOKEN` to be set in GitHub Secrets → Settings → Secrets and variables → Actions.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JS (ES6+), Tailwind CSS CDN |
| 3D Globe | Three.js |
| Charts | Chart.js |
| Data Pipeline | Python (requests, pandas) + Node.js |
| CI/CD | GitHub Actions → GitHub Pages |

---

## Roadmap

- ✅ v1.0 — 3D Globe, 68-country policy analysis, WAQI + OpenAQ + Earthdata integration
- ✅ v2.0 — Service layer modularization, FusionService (DQSS-lite)
- 🔄 v2.5 — World Bank API, full DID regression, data pipeline unification
- 📋 v3.0 — AOD→PM2.5 ML model (RandomForest/XGBoost), quantile uncertainty, anomaly detection

---

<details>
<summary>🇰🇷 한국어 설명 보기</summary>

## AirLens란?

전 세계 대기질 관측소는 선진국에 집중되어 있습니다.
개발도상국의 수십억 인구는 자신이 마시는 공기의 질조차 알 수 없습니다.

AirLens는 이 격차를 세 가지 방식으로 해소합니다.

| 기능 | 설명 |
|------|------|
| 🌐 **3D Globe** | 실시간 PM2.5를 인터랙티브 3D 지구본에서 시각화 |
| 📊 **Policy Analysis** | 68개국 정책 시행 전후 대기질 변화를 DID 방법론으로 분석 |
| 📍 **Today** | GPS 기반 현재 위치 실시간 PM2.5 + 7일 트렌드 |
| 📸 **Camera AI** | 하늘 사진으로 대기질 등급 추정 (실험적, 브라우저 내 처리) |

## 데이터 소스

| 소스 | 데이터 | 갱신 주기 | 키 필요 |
|------|--------|----------|---------|
| **WAQI** | 실시간 PM2.5/AQI (150+ 도시) | 매일 자동 수집 | ✅ |
| **OpenAQ** | 정부 공식 PM2.5 관측값 | 매주 자동 수집 | ✅ |
| **NASA Earthdata** | AOD 위성 데이터 (MAIAC/MODIS) | 매주 자동 수집 | ✅ |
| **Open-Meteo / Copernicus CAMS** | 기상 + 위성 PM2.5 | 실시간 | ❌ 무료 |

> 모든 API 키는 **GitHub Secrets**에만 저장됩니다. 코드에 절대 포함되지 않습니다.

## 자동화 파이프라인

| 워크플로우 | 스케줄 | 역할 |
|-----------|--------|------|
| `deploy.yml` | main 브랜치 push 시 | GitHub Pages 자동 배포 |
| `update_airdata.yml` | 매일 00:00 UTC (WAQI) + 매주 일요일 02:00 UTC (OpenAQ + Earthdata) | 전체 데이터 파이프라인 |

> ⚠️ `Update AirLens Data` 워크플로우가 failing 상태일 경우, GitHub Secrets에 `OPENAQ_API_KEY`와 `EARTHDATA_TOKEN`이 설정되어 있는지 확인하세요. (Settings → Secrets and variables → Actions)

## 로드맵

- ✅ v1.0 — 3D Globe, 68개국 정책 분석, 멀티소스 데이터 통합
- ✅ v2.0 — 서비스 레이어 모듈화, FusionService (DQSS-lite)
- 🔄 v2.5 — World Bank API, 완전한 DID 회귀 분석, 데이터 파이프라인 통합
- 📋 v3.0 — AOD→PM2.5 ML 모델, Quantile 예측, 이상치 탐지

</details>

---

**Made with ❤️ for cleaner air · [@joymin5655](https://github.com/joymin5655)**
