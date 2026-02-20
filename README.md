# 🌍 AirLens — Global Air Quality Intelligence

> **Making invisible air pollution visible through AI-powered multi-source data fusion**

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml)
[![WAQI Data](https://github.com/joymin5655/Finedust_proj/actions/workflows/update-waqi-data.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions/workflows/update-waqi-data.yml)
![Version](https://img.shields.io/badge/version-1.1.0-25e2f4)
![License](https://img.shields.io/badge/license-MIT-green)

**🔗 Live Demo:** [https://joymin5655.github.io/Finedust_proj/app/](https://joymin5655.github.io/Finedust_proj/app/)

<details>
<summary>🇰🇷 한국어로 읽기 (Read in Korean)</summary>

## AirLens — 글로벌 공기질 인텔리전스

> AI 기반 다중 소스 데이터 퓨전으로 눈에 보이지 않는 대기오염을 시각화합니다

### 왜 만들었나요?

많은 지역에서 공기질 측정소가 부족합니다. 특히 개발도상국이나 농촌 지역 주민들은 자신이 마시는 공기의 질을 알 방법이 없어요. AirLens는 세 가지 접근법으로 이 문제를 해결합니다:

| 기능 | 설명 |
|------|------|
| 📊 **Today** | GPS + 가장 가까운 WAQI 측정소 → 현재 위치 실시간 PM2.5 |
| 📸 **Camera AI** | 하늘 사진 → 브라우저 픽셀 분석 → PM2.5 예측 (서버 불필요) |
| 🌐 **Globe** | 3D 지구본으로 전 세계 도시 공기질 한눈에 보기 |
| 🌿 **Policy** | 68개국 × 역사적 PM2.5 추세 × 정책 타임라인 분석 |

### 빠른 시작

```bash
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj
python3 -m http.server 8000
# http://localhost:8000/app/ 에서 확인
```

### 플랜

| | Free | Plus ($4.99/월) |
|-|------|-----------------|
| 실시간 PM2.5 | ✅ | ✅ |
| Camera AI | ✅ | ✅ (고급 CNN) |
| AI 리포트 | 1회/일 | 무제한 |
| Watchlist | ❌ | ✅ 최대 6개 도시 |
| CSV 내보내기 | ❌ | ✅ |
| Globe AOD 레이어 | ❌ | ✅ |
| PM2.5 알림 | ❌ | ✅ |

### 보안 원칙

- API 키는 저장소에 절대 없음 (`.gitignore` + CI Secrets)
- 샘플 데이터 (policy-impact, earthdata 등)는 git에서 제외
- 모든 AI 분석은 클라이언트 사이드 실행 (개인 정보 보호)

</details>

---

## 🎯 Why I Built This

Air quality monitoring stations are severely lacking in many regions. People often have no way to know the air quality in their area — especially in developing countries and rural areas where stations are sparse or non-existent.

**AirLens addresses this gap through four core features:**

| Feature | Description |
|---------|-------------|
| 📊 **Today** | GPS + nearest WAQI station → real-time PM2.5 at your location |
| 📸 **Camera AI** | Sky photo → browser-side pixel analysis → PM2.5 estimate (no server) |
| 🌐 **Globe** | 3D interactive globe — city markers, AOD layer, time slider |
| 🌿 **Policy** | 68 countries × historical PM2.5 trends × policy timeline analysis |

---

## ✨ Plans

| Feature | Free | Plus ($4.99/mo) |
|---------|------|-----------------|
| Real-time PM2.5 | ✅ | ✅ |
| Camera AI | ✅ Basic | ✅ Advanced CNN |
| AI Reports | 1×/day | Unlimited |
| Watchlist (multi-city) | ❌ | ✅ Up to 6 cities |
| CSV Export | ❌ | ✅ |
| Globe AOD Layer | ❌ | ✅ Satellite overlay |
| Globe Time Slider | ❌ | ✅ 24-hour playback |
| PM2.5 Alerts | ❌ | ✅ Custom threshold |
| Monthly AI Report | ❌ | ✅ |

> Payment via PayPal. Upgrade in [Settings](https://joymin5655.github.io/Finedust_proj/app/settings.html).

---

## 🏗️ Architecture

```
Frontend:   Static web app (HTML/JS/CSS) under app/
            Deployed via GitHub Pages — no build step required

Data:       WAQI live data updated daily via GitHub Actions
            Policy/historical data: pre-processed JSON (NOT tracked in git)
            ⚠️  Sample data files are gitignored — see app/data/ notes below

AI:         Browser-side pixel analysis for camera prediction (no model download)
            OpenAI narrative reports via serverless proxy
            ⚠️  API keys are NEVER stored in this repository

Pro:        Feature flags in config.js (IS_PRO = true/false)
            v2: PayPal webhook → backend plan verification
```

### Data Flow

```
User opens index.html
        │
        ├─► GPS / city select
        │         │
        │         ▼
        │   StationService.findNearest(lat, lon)
        │         │
        │         ▼
        │   WAQI latest.json  ← updated daily by GitHub Actions
        │         │
        │         ▼
        │   weighted PM2.5 (1/distance)
        │
        ├─► Camera photo (optional)
        │         │
        │         ▼
        │   CameraService.analyse(img)  ← browser pixel analysis
        │         │
        │         ▼
        │   CameraService.fuse(camera, station)
        │
        └─► AI Report button
                  │
                  ▼
            openaiService → proxy → OpenAI API
```

---

## 📁 Project Structure

```
Finedust_proj/
├── app/                          ← GitHub Pages root
│   ├── index.html                ← Today (main entry)
│   ├── globe.html                ← 3D Globe
│   ├── camera.html               ← Camera AI
│   ├── policy.html               ← Policy Research
│   ├── about.html                ← About & Methodology
│   ├── settings.html             ← Plan, Language, Theme
│   ├── css/
│   ├── js/
│   │   ├── config.js             ← ⚠️ gitignored (copy from config.template.js)
│   │   ├── config.template.js    ← Safe template (no keys)
│   │   ├── pro-features.js       ← Plus feature implementations
│   │   ├── today.js / globe.js / camera.js / policy.js
│   │   ├── i18n.js               ← Multi-language support
│   │   └── services/
│   │       ├── dataService.js
│   │       ├── stationService.js
│   │       ├── cameraService.js
│   │       ├── openaiService.js  ← Calls proxy only, no key inside
│   │       ├── uiService.js
│   │       └── locationService.js
│   └── data/
│       └── waqi/                 ← ✅ Live data, updated by GitHub Actions
│           ├── latest.json       ← 53-city real-time PM2.5
│           ├── stats.json
│           └── history/          ← Daily snapshots
│
│   ⚠️  The following data dirs are gitignored (generated locally / not sample):
│       app/data/earthdata/       ← AOD samples
│       app/data/openaq/          ← PM25 days/years/stations
│       app/data/pm25/            ← Latest PM25
│       app/data/policy-impact/   ← 68-country policy JSON
│       app/data/policies.json
│       app/data/policy-analytics.json
│
├── scripts/
│   └── fetch-waqi-data.js        ← Node.js data collector (runs in CI)
├── .github/
│   └── workflows/
│       ├── update-waqi-data.yml  ← Daily WAQI fetch + auto-commit
│       └── deploy.yml            ← Push to main → GitHub Pages
├── index.html                    ← Root redirect → app/index.html
└── README.md
```

---

## 🔒 Security

| Rule | Enforcement |
|------|-------------|
| No API keys in repo | `.gitignore` + code review |
| WAQI token | GitHub Actions Secret (`WAQI_TOKEN`) only |
| OpenAI key | Vercel/Cloudflare env var — never in repo |
| Sample data | Gitignored — not pushed to GitHub |
| Client ↔ OpenAI | Always via proxy URL, never direct |

```javascript
// app/js/services/openaiService.js — proxy only, zero keys
const API_BASE = 'https://airlens-api.vercel.app';

export async function todayReport(payload) {
  return fetch(`${API_BASE}/api/today-report`, { method: 'POST', body: ... });
}
```

---

## 📊 Data Sources

| Source | Data | Cadence | Key |
|--------|------|---------|-----|
| **WAQI API** | 53-city real-time PM2.5 | Daily (GitHub Actions) | `WAQI_TOKEN` in Secrets |
| **EU Copernicus CAMS** | Satellite PM2.5 / AOD | On demand via Open-Meteo | ❌ None |
| **OpenAQ** | Government station data | Pre-processed | ❌ None |
| **Policy Index** | 68 countries, 133+ policies | Pre-processed | ❌ None |

---

## 🔄 GitHub Actions

### `update-waqi-data.yml` — daily data refresh
```
Schedule: 0 0 * * * (midnight UTC)
  1. Checkout repo
  2. node scripts/fetch-waqi-data.js  (uses WAQI_TOKEN secret)
  3. git add app/data/waqi/
  4. git commit & push if data changed
```

### `deploy.yml` — continuous deployment
```
Trigger: push to main
  1. Copy app/ + root index.html → _site/
  2. Upload GitHub Pages artifact
  3. Deploy
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj

# Serve locally (no build step needed)
python3 -m http.server 8000
# or: npx serve .

# Open the app
open http://localhost:8000/app/
```

### Enable live WAQI data locally

```bash
# Copy template and add your free token from aqicn.org/api/
cp app/js/config.template.js app/js/config.js
# Edit config.js → set WAQI.token and WAQI.enabled = true
```

> ⚠️ Never commit `app/js/config.js` — it is in `.gitignore`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS (ES6+), Tailwind CSS CDN |
| 3D Globe | Three.js (r128), WebGL |
| Charts | Chart.js |
| Camera AI | Browser canvas pixel analysis |
| Internationalization | Custom i18n.js (6 languages) |
| CI/CD | GitHub Actions, GitHub Pages |
| AI Reports | OpenAI GPT-4o via serverless proxy (Vercel) |

---

## 🌐 Pages

| URL | File | Description |
|-----|------|-------------|
| `/app/` | `index.html` | **Today** — GPS PM2.5 + Camera fusion |
| `/app/globe.html` | `globe.html` | 3D interactive globe with AOD layer |
| `/app/camera.html` | `camera.html` | Full Camera AI analysis page |
| `/app/policy.html` | `policy.html` | 68-country policy research & trends |
| `/app/about.html` | `about.html` | Methodology, data sources & changelog |
| `/app/settings.html` | `settings.html` | Plan, language & theme |

---

## 🗂️ Changelog

### v1.1.0 — February 2026
- ✨ **Plus plan** — Watchlist, CSV export, Globe AOD layer, time slider, PM2.5 alerts
- 🔒 Sample data removed from git (policy-impact, earthdata, openaq)
- 🐛 Fixed globe.html config.js duplicate load
- 📝 README rewritten (English default + Korean toggle)

### v1.0.0 — November 2025
- 🚀 Initial release — Today, Globe, Camera AI, Policy, About, Settings
- 🤖 OpenAI report integration via serverless proxy
- 🔄 GitHub Actions daily WAQI data refresh

---

**Made with ❤️ for cleaner air · [@joymin5655](https://github.com/joymin5655)**
