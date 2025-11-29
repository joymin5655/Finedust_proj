# 🌍 AirLens - Global Air Quality Visualization

> **Making invisible air pollution visible through interactive 3D visualization**

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)
[![WAQI Data](https://github.com/joymin5655/Finedust_proj/actions/workflows/update-waqi-data.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)

**🔗 Live Demo:** [https://joymin5655.github.io/Finedust_proj/app/](https://joymin5655.github.io/Finedust_proj/app/)

---

## 🎯 Purpose

Air pollution kills **7 million people annually** (WHO), yet remains invisible to the naked eye. AirLens aims to:

1. **Visualize** real-time PM2.5 data on an interactive 3D globe
2. **Analyze** air quality policies across 66 countries and their effectiveness
3. **Predict** PM2.5 levels from sky photos using browser-based AI
4. **Raise awareness** about global air pollution through intuitive data visualization

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌐 **3D Globe** | Interactive Three.js globe with real-time PM2.5 markers |
| 📊 **Policy Analysis** | 66 countries, 133 policies, PM2.5 trend charts |
| 📸 **Camera AI** | Predict PM2.5 from sky photos (browser-based ML) |
| 🔄 **Auto Update** | Daily WAQI data refresh via GitHub Actions |

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj

# Run local server
python3 -m http.server 8000
# or: npx serve app

# Open browser
open http://localhost:8000/app/
```

---

## 📁 Project Structure

```
Finedust_proj/
├── app/
│   ├── index.html          # Home
│   ├── globe.html          # 3D Globe
│   ├── camera.html         # Camera AI
│   ├── js/
│   │   ├── globe.js        # Main globe logic
│   │   ├── camera.js       # Camera AI
│   │   └── services/       # Data service modules
│   └── data/
│       ├── policy-impact/  # 66 countries policy data
│       └── waqi/           # 53 cities real-time data
├── scripts/
│   └── fetch-waqi-data.js  # WAQI data collector
└── .github/workflows/
    ├── deploy.yml          # GitHub Pages deployment
    └── update-waqi-data.yml # Daily data update
```

---

## 📊 Data Sources

| Source | Data | API Key |
|--------|------|---------|
| **EU Copernicus CAMS** | Real-time PM2.5 (via Open-Meteo) | ❌ Not required |
| **WAQI** | 53 cities detailed data | ✅ GitHub Secrets |
| **Policy Data** | 66 countries, 133 policies | ❌ Local JSON |

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JS (ES6+), Tailwind CSS
- **3D**: Three.js, WebGL
- **Charts**: Chart.js
- **CI/CD**: GitHub Actions, GitHub Pages

---

## 📄 License

MIT License

---

**Made with ❤️ for cleaner air by [@joymin5655](https://github.com/joymin5655)**
