# 🌍 AirLens - Global Air Quality Visualization

> **Making invisible air pollution visible through interactive 3D visualization**

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)
[![WAQI Data](https://github.com/joymin5655/Finedust_proj/actions/workflows/update-waqi-data.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)

**🔗 Live Demo:** [https://joymin5655.github.io/Finedust_proj/app/](https://joymin5655.github.io/Finedust_proj/app/)

---

## 🎯 Why I Built This

**The Problem:**  
Air quality monitoring stations are severely lacking in many regions. People often have no way to know the air quality in their area, especially in developing countries and rural areas where stations are sparse or non-existent.

**The Solution:**  
AirLens addresses this gap through two approaches:

1. **📸 Camera-Based PM2.5 Prediction**  
   Use your smartphone camera to capture the sky and estimate PM2.5 levels — no expensive monitoring equipment needed.

2. **📊 Policy Impact Visualization**  
   Explore how air quality policies across 66 countries have actually changed PM2.5 levels over time. See which policies work and which don't.

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

**Made with ❤️ for cleaner air by [@joymin5655](https://github.com/joymin5655)**
