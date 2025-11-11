# 🌍 AirLens - See the Air

> **Interactive global air quality visualization powered by real data**
> Real-time PM2.5 monitoring • AI-powered predictions • Advanced 3D visualization

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Data Source](https://img.shields.io/badge/Data-EU_Copernicus_CAMS-blue)](https://atmosphere.copernicus.eu/)
[![No Token](https://img.shields.io/badge/API_Keys-NOT_REQUIRED-brightgreen)](https://github.com/joymin5655/Finedust_proj)

**✅ NO API KEYS NEEDED - Works immediately!**

**Live Demo:** [https://joymin5655.github.io/Finedust_proj](https://joymin5655.github.io/Finedust_proj)

---

## 🎯 What is AirLens?

AirLens transforms complex air quality data into an intuitive, beautiful 3D visualization. Using **official EU Copernicus CAMS data** (no API keys required), explore global PM2.5 levels in real-time, predict air quality from sky photos using AI, and discover pollution patterns across the globe - all on an interactive Earth globe.

### 🌟 Key Highlights

- **✅ NO TOKEN REQUIRED**: Works immediately - no API keys, no registration needed!
- **🇪🇺 Official EU Data**: Real-time data from EU Copernicus CAMS (ECMWF)
- **🌍 3D Globe Visualization**: 174+ cities worldwide with live PM2.5 data (11,000+ with optional WAQI)
- **📸 Camera AI**: Upload sky photos to predict PM2.5 using multimodal AI
- **🎨 Beautiful Interface**: Atmospheric particles, color-coded markers, smooth animations
- **🔍 Real-time Analysis**: Satellite + ground station data fusion
- **📱 Fully Responsive**: Works seamlessly on desktop, tablet, and mobile

---

## ✨ Features

### 🌙 Dark/Light Mode Toggle

**Beautiful Animated Theme Switcher**

- **Sparkle-animated toggle button** with smooth transitions
- **Persistent theme preference** using localStorage
- **Dynamic UI adaptation** - all elements adjust automatically
- **Optimized performance** - no flash on page load
- **Mobile-responsive** - scales beautifully on all devices

### 🌐 Interactive Enhanced Globe

**Design Inspiration:** Earth.Nullschool + Google Earth

- **Realistic 3D Earth** with NASA Blue Marble texture and atmospheric glow
- **Color-coded PM2.5 markers** for 174+ cities across 50+ countries
- **Country policy visualization** with historical PM2.5 trends (8 major countries)
- **Atmospheric particle effects** simulating air currents
- **Smooth camera controls** with zoom, pan, and auto-rotate
- **60 FPS rendering** using Three.js and WebGL
- **Detailed country information** on click with interactive charts

### 📸 Camera AI - PM2.5 Predictor

**Sky Image Analysis with Machine Learning**

- **Upload sky photos** to estimate PM2.5 levels
- **CNN-LSTM architecture** for accurate predictions
- **Browser-based processing** with TensorFlow.js
- **No server uploads** - all processing happens locally
- **MAE < 8.5 µg/m³** accuracy on validation data

### 📊 Data Analysis Tools

- **Global Statistics Dashboard**
  - Average PM2.5 levels worldwide
  - Most/least polluted regions
  - Historical trends visualization

- **Historical Timeline**
  - Explore data from 1990 to 2021
  - Animated timeline playback
  - Year-by-year comparison

- **WHO Air Quality Guidelines**
  - Color-coded AQI scale
  - Health impact descriptions
  - Interactive legend

---

## 📊 Data Sources

**✅ ALL DATA FROM OFFICIAL INTERNATIONAL AGENCIES**

### 🇪🇺 EU Copernicus CAMS (Primary - NO TOKEN REQUIRED)
Real-time atmospheric monitoring data via Open-Meteo API.

**Provider:** ECMWF (European Centre for Medium-Range Weather Forecasts)
**Data:** PM2.5, PM10, NO₂, SO₂, O₃, CO, AOD, Dust
**Coverage:** Worldwide
**Cost:** ✅ FREE - No API key needed
**Used in:** Globe, Camera AI, All real-time features

### 🌍 Optional Enhancement APIs (All FREE)

**WAQI (World Air Quality Index):**
- 11,000+ government monitoring stations worldwide
- Real-time PM2.5, AQI data
- Free token: https://aqicn.org/data-platform/token

**OpenWeather Air Pollution API:**
- Global coordinate-based data
- 1M free calls/month
- Sign up: https://home.openweathermap.org/users/sign_up

**OpenAQ API v3:**
- Government official monitoring stations
- Free API key
- Register: https://explore.openaq.org/register

### 📈 Historical PM2.5 Trends (8 Countries)

**Sources:**
- WHO Global Air Quality Database
- OECD Air Quality Statistics
- World Bank Air Pollution Data
- National environmental agencies (Korea EPA, China MEE, US EPA, etc.)

**Countries with trends:** South Korea, China, Japan, India, Bangladesh, USA, UK, Germany

---

## 🚀 Quick Start

### View Live

Visit: **[https://joymin5655.github.io/Finedust_proj](https://joymin5655.github.io/Finedust_proj)**

### Run Locally

```bash
# Clone the repository
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj

# Serve with any HTTP server
python -m http.server 8000

# Or use Node.js
npx http-server -p 8000
```

Then navigate to: `http://localhost:8000/globe.html`

---

## 🛠️ Technology Stack

- **Three.js** - 3D graphics and WebGL rendering
- **Vanilla JavaScript** - Fast and efficient
- **CSS3** - Modern styling with glassmorphism
- **EU Copernicus CAMS** - Official atmospheric data (via Open-Meteo API)

---

## 📁 Project Structure

```
Finedust_proj/
├── index.html               # Main landing page
├── globe.html               # Interactive 3D globe visualization
├── camera.html              # Camera AI PM2.5 predictor
├── research.html            # Air quality research & policies
├── settings.html            # Settings page
├── about.html               # About page
│
├── js/
│   ├── theme-toggle.js      # Dark/light mode management
│   ├── main.js              # Common utilities & animations
│   ├── hero-animation.js    # Landing page animations
│   ├── globe.js             # Globe visualization logic
│   ├── camera.js            # Camera AI functionality
│   ├── air-quality-api.js   # Air quality API integration
│   ├── satellite-api.js     # Satellite data integration
│   └── config.js            # API configuration
│
├── css/
│   ├── main.css             # Global styles & theme system
│   └── settings.css         # Settings page styles
│
└── data/
    ├── pm25-data.json       # PM2.5 historical data
    ├── stations.json        # Monitoring stations data
    ├── air-pollution-deaths.json  # Death statistics
    └── policy-impact/       # Country-specific policy data
        └── *.json           # 86 country files
```

### 🎨 Code Organization

**Modular & Maintainable**

- **Separated concerns** - Each feature in its own module
- **Reusable components** - Theme system works across all pages
- **Clear documentation** - JSDoc comments throughout
- **Performance optimized** - Lazy loading and efficient rendering

---

## 🤝 Contributing

Contributions welcome! Fork the repo and submit a PR.

---

## 📄 License

MIT License - see [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT) for details.

### Data Attribution

- **EU Copernicus CAMS (ECMWF)**: Real-time atmospheric data via Open-Meteo API
- **WHO, OECD, World Bank**: Historical PM2.5 trends and statistics
- **National Environmental Agencies**: Country-specific policy impact data

---

## 🙏 Acknowledgments

- **EU Copernicus CAMS (ECMWF)** for real-time atmospheric data
- **Earth.Nullschool** for design inspiration
- **Three.js** team for 3D library
- **Open-Meteo** for free API access

---

**Made with ❤️ for cleaner air**
