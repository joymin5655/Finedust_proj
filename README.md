# 🌍 AirLens — Global Air Quality Intelligence

> **Making invisible air pollution visible through AI-powered multi-source fusion**

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml)
[![WAQI Data](https://github.com/joymin5655/Finedust_proj/actions/workflows/update-waqi-data.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions/workflows/update-waqi-data.yml)

**🔗 Live Demo:** [https://joymin5655.github.io/Finedust_proj/app/](https://joymin5655.github.io/Finedust_proj/app/)

---

## 🎯 Why I Built This

Air quality monitoring stations are severely lacking in many regions. People often have no way to know the air quality in their area — especially in developing countries and rural areas where stations are sparse or non-existent.

**AirLens addresses this gap through three approaches:**

| Approach | Description |
|----------|-------------|
| 📊 **Today (index)** | GPS + nearest WAQI station data → real-time PM2.5 at your location |
| 📸 **Camera AI** | Sky photo → browser-side image analysis → PM2.5 prediction (no server) |
| 🌿 **Policy Research** | 66 countries × historical PM2.5 trends × policy timeline analysis |

---

## 🏗️ Architecture

```
Frontend:   Static web app (HTML/JS/CSS) under app/
            Deployed via GitHub Pages
            No build step required — plain ES5/ES6 modules

Data:       WAQI + policy JSON files under app/data/
            Updated daily via GitHub Actions (no manual work)

AI:         Browser-side pixel analysis for camera prediction (no model download)
            OpenAI narrative reports via external serverless proxy
            ⚠️  API keys are NEVER stored in this repository

Automation: GitHub Actions
            - update-waqi-data.yml  → runs daily, commits fresh JSON
            - deploy.yml            → runs on push to main, deploys app/
```

### Data Flow Diagram

```
User opens index.html
        │
        ├─► GPS / city select
        │         │
        │         ▼
        │   StationService.findNearest(lat, lon)
        │         │
        │         ▼
        │   DataService.loadStations()  ← app/data/waqi/latest.json
        │         │                       (refreshed daily by GitHub Actions)
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
        │         │
        ▼         ▼
        Result card + Grade + Action guide
```

---

## 📁 Project Structure

```
Finedust_proj/
├── app/                         ← GitHub Pages root
│   ├── index.html               ← Today (main entry point)
│   ├── globe.html               ← 3D Globe
│   ├── camera.html              ← Camera AI (full page)
│   ├── policy.html              ← Policy Research
│   ├── about.html               ← About & Research methodology
│   ├── settings.html            ← Language / theme settings
│   ├── css/                     ← Stylesheets
│   ├── js/
│   │   ├── today.js             ← Today view entrypoint
│   │   ├── globe.js             ← Globe logic
│   │   ├── camera.js            ← Full camera AI page
│   │   ├── policy.js            ← Policy page entrypoint
│   │   ├── i18n.js              ← 6-language translation engine
│   │   └── services/
│   │       ├── dataService.js   ← Static JSON loader (cache + path resolution)
│   │       ├── stationService.js← WAQI station helpers (nearest, weighted PM2.5)
│   │       ├── cameraService.js ← Sky image pixel analysis + fusion
│   │       ├── openaiService.js ← Serverless proxy wrapper (NO API key inside)
│   │       ├── uiService.js     ← Grade colours, toast, loading overlay
│   │       ├── pmService.js     ← PM2.5 integration logic
│   │       └── locationService.js← GPS / geolocation helpers
│   └── data/
│       ├── waqi/
│       │   ├── latest.json      ← 53-city PM2.5 (updated daily ↓)
│       │   ├── global-stations.json
│       │   ├── stats.json
│       │   └── history/         ← Per-day snapshots
│       └── policy-impact/
│           ├── index.json       ← 66-country index
│           └── <country>.json   ← Per-country PM2.5 trend + policy detail
├── scripts/
│   └── fetch-waqi-data.js       ← Node.js data collector (runs in CI)
├── .github/
│   └── workflows/
│       ├── update-waqi-data.yml ← Cron: daily WAQI fetch + auto-commit
│       └── deploy.yml           ← Push to main → GitHub Pages deploy
├── index.html                   ← Root redirect → app/index.html
└── README.md
```

---

## 🔒 Security Principles

| Rule | Where enforced |
|------|---------------|
| No API keys in repository | `.gitignore` + code review |
| WAQI token in CI only | GitHub Actions Secret (`WAQI_TOKEN`) |
| OpenAI key in proxy only | Vercel / Cloudflare env var — never in repo |
| Client never calls OpenAI directly | `openaiService.js` only calls the proxy URL |

```javascript
// app/js/services/openaiService.js — no key, just the proxy URL
const API_BASE = 'https://airlens-api.vercel.app';

export async function todayReport(payload) {
  return fetch(`${API_BASE}/api/today-report`, { method: 'POST', ... });
}
```

---

## 📊 Data Sources

| Source | Data | Update cadence | Key required |
|--------|------|---------------|-------------|
| **WAQI API** | 53-city real-time PM2.5 | Daily (GitHub Actions) | ✅ `WAQI_TOKEN` in Secrets |
| **Our World in Data / IHME** | Historical PM2.5 by country | Manual (pre-processed) | ❌ |
| **Policy Index** | 66 countries, 133 policies | Manual (pre-processed) | ❌ |
| **EU Copernicus CAMS** | Satellite PM2.5 (camera fusion) | On demand via Open-Meteo | ❌ |

### Data JSON Schema (quick reference)

**`app/data/waqi/latest.json`**
```json
{
  "updated_at": "ISO-8601",
  "count": 53,
  "cities": [
    {
      "city": "seoul",
      "aqi": 42,
      "pollutants": { "pm25": 18, "pm10": 32 },
      "location": { "name": "Seoul", "geo": [37.56, 126.97] },
      "time": { "s": "2025-11-08 12:00:00" }
    }
  ]
}
```

**`app/data/policy-impact/index.json`**
```json
{
  "countries": [
    {
      "country": "South Korea", "countryCode": "KR",
      "region": "East Asia", "flag": "🇰🇷",
      "dataFile": "south-korea.json", "policyCount": 2
    }
  ]
}
```

---

## 🔄 Automation (GitHub Actions)

### `update-waqi-data.yml` — daily data refresh
```
Schedule: 0 0 * * *  (midnight UTC)
  1. Checkout repo
  2. node scripts/fetch-waqi-data.js   (uses WAQI_TOKEN secret)
  3. git add app/data/waqi/
  4. git commit & push if changed      (skips if no new data)
```

### `deploy.yml` — continuous deployment
```
Trigger: push to main
  1. Copy app/ + root index.html → _site/
  2. Upload GitHub Pages artifact
  3. Deploy
```

---

## 🚀 Quick Start (local development)

```bash
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj

# Serve locally (no build step needed)
python3 -m http.server 8000
# or: npx serve .

# Open the app
open http://localhost:8000/app/
```

To enable WAQI live data locally:
```bash
# Copy template and add your token
cp app/js/config.template.js app/js/config.js
# Edit config.js → set waqi.token and waqi.enabled = true
```

> ⚠️ Never commit `app/js/config.js` — it is in `.gitignore`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS (ES6+), Tailwind CSS CDN |
| 3D Globe | Three.js (r128), WebGL |
| Charts | Chart.js |
| Camera AI | Browser canvas pixel analysis (no TF.js weight download) |
| CI/CD | GitHub Actions, GitHub Pages |
| AI Reports | OpenAI via serverless proxy (Vercel) |

---

## 🌐 Pages

| URL | File | Description |
|-----|------|-------------|
| `/app/` | `index.html` | **Today** — GPS PM2.5 + Camera fusion |
| `/app/globe.html` | `globe.html` | 3D interactive globe with station markers |
| `/app/camera.html` | `camera.html` | Full Camera AI analysis page |
| `/app/policy.html` | `policy.html` | 66-country policy research |
| `/app/about.html` | `about.html` | Methodology & data sources |

---

**Made with ❤️ for cleaner air · [@joymin5655](https://github.com/joymin5655)**
