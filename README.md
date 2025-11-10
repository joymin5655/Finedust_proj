# 🌍 AirLens - See the Air

> **Interactive global air quality visualization powered by official international data**
> Historical PM2.5 analysis • AI-powered predictions • Advanced 3D visualization

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Data Source](https://img.shields.io/badge/Data-EU_Copernicus_CAMS-blue)](https://atmosphere.copernicus.eu/)
[![No Token](https://img.shields.io/badge/API_Keys-NOT_REQUIRED-brightgreen)](https://github.com/joymin5655/Finedust_proj)

**✅ NO API KEYS NEEDED - Works immediately!**

**Live Demo:** [https://joymin5655.github.io/Finedust_proj](https://joymin5655.github.io/Finedust_proj)

---

## 🎯 What is AirLens?

AirLens transforms complex air quality data into an intuitive, beautiful 3D visualization. Using **official international data sources** including EU Copernicus CAMS (no API keys required), explore global PM2.5 levels, predict air quality from sky photos using experimental AI, and discover pollution patterns across the globe - all on an interactive Earth.

### 🌟 Key Highlights

- **✅ NO TOKEN REQUIRED**: Works immediately - no API keys, no registration needed!
- **🇪🇺 Official EU Data**: Historical data from EU Copernicus CAMS (ECMWF)
- **📊 Verified Sources**: Our World in Data (IHME), WAQI, government agencies
- **🌍 3D Globe Visualization**: Interactive Earth with country-level air quality policies
- **📸 Camera AI**: Experimental multimodal AI combining sky photos + satellite data
- **🎨 Beautiful Interface**: Atmospheric particles, color-coded markers, smooth animations
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

### 🌐 Interactive Globe

**Design Inspiration:** Earth.Nullschool + Google Earth

- **Realistic 3D Earth** with NASA Blue Marble texture and atmospheric glow
- **Country policy visualization** with historical PM2.5 trends
- **Atmospheric particle effects** simulating air currents
- **Smooth camera controls** with zoom, pan, and auto-rotate
- **60 FPS rendering** using Three.js and WebGL
- **Detailed country information** on click with interactive charts

### 📸 Camera AI - Experimental PM2.5 Predictor

**Sky Image Analysis with Machine Learning**

- **Upload sky photos** to estimate PM2.5 levels
- **CNN-LSTM architecture** for experimental predictions
- **Multimodal data fusion**: Image + Satellite + Ground data
- **Browser-based processing** with TensorFlow.js
- **No server uploads** - all processing happens locally
- **Educational purposes** - experimental AI model

### 📊 Research & Data Analysis

- **Global air quality policies** from major countries
- **Historical PM2.5 trends** (1990-2021)
- **Policy impact analysis** with before/after statistics
- **WHO Air Quality Guidelines** with health impact descriptions
- **Data source transparency** - all sources clearly attributed

---

## 📊 Data Sources

All data from official international organizations and government agencies:

### 🇪🇺 EU Copernicus CAMS (Primary - No API Key Required)
European Union's official atmospheric monitoring service
- **Agency:** ECMWF (European Centre for Medium-Range Weather Forecasts)
- **Data:** PM2.5, PM10, NO₂, SO₂, O₃, CO, AOD, Dust
- **Coverage:** Worldwide
- **Access:** FREE via Open-Meteo API
- **URL:** https://atmosphere.copernicus.eu

### 📊 Our World in Data
Verified research data from IHME (Institute for Health Metrics and Evaluation)
- **Data:** Historical PM2.5 concentrations (1990-2021)
- **Coverage:** Global
- **License:** CC BY 4.0
- **URL:** https://ourworldindata.org

### 🌍 Optional Enhancement APIs

**WAQI (World Air Quality Index)**
- Global ground monitoring stations
- Access: FREE token (email only)
- URL: https://aqicn.org

**OpenWeather Air Pollution**
- Global meteorological and air quality data
- Access: FREE API key (1M calls/month)
- URL: https://openweathermap.org

**OpenAQ**
- Government official monitoring stations
- Access: FREE API key
- URL: https://openaq.org

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

Then navigate to: `http://localhost:8000`

---

## 🛠️ Technology Stack

- **Three.js** - 3D graphics and WebGL rendering
- **TensorFlow.js** - Browser-based machine learning
- **Vanilla JavaScript** - Fast and efficient
- **CSS3** - Modern styling with glassmorphism
- **Chart.js** - Data visualization
- **Official APIs** - EU Copernicus CAMS, Our World in Data

---

## 📁 Project Structure

```
Finedust_proj/
├── index.html               # Main landing page
├── globe.html               # 3D globe visualization
├── camera.html              # Camera AI PM2.5 predictor
├── research.html            # Research & methodology
├── about.html               # About page
├── settings.html            # Settings & information
│
├── js/
│   ├── theme-toggle.js      # Dark/light mode management
│   ├── main.js              # Common utilities & animations
│   ├── hero-animation.js    # Landing page animations
│   ├── globe.js             # Globe visualization logic
│   ├── camera.js            # Camera AI functionality
│   ├── satellite-api.js     # Satellite data integration
│   ├── air-quality-api.js   # Air quality data fetching
│   └── data-service.js      # Data management
│
├── css/
│   ├── main.css             # Global styles & theme system
│   ├── globe.css            # Globe-specific styles
│   ├── camera.css           # Camera AI styles
│   └── settings.css         # Settings page styles
│
└── data/
    ├── pm25-data.json       # PM2.5 historical data (Our World in Data)
    ├── policies.json        # Air quality policies
    ├── air-pollution-deaths.json  # Health impact data (IHME)
    └── policy-impact/       # Policy effectiveness data
        ├── south-korea.json
        ├── china.json
        ├── united-states.json
        └── european-union.json
```

### 🎨 Code Organization

**Modular & Maintainable**

- **Separated concerns** - Each feature in its own module
- **Reusable components** - Theme system works across all pages
- **Clear documentation** - JSDoc comments throughout
- **Performance optimized** - Lazy loading and efficient rendering

---

## 🔬 Research Foundations

Our multimodal PM2.5 prediction system is built upon cutting-edge research:

- **Rowley & Karakuş (2023)** - Multimodal fusion (satellite + ground sensors)
- **AirFusion (2025)** - Late Fusion architecture for air quality
- **Park et al. (2019)** - AOD to PM2.5 conversion models
- **Li et al. (2022)** - Multi-source data integration techniques
- **Hameed et al. (2023)** - Optimal weighting for fusion models

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

### Data Attribution

- **EU Copernicus CAMS**: Atmospheric data (Free, no registration)
- **Our World in Data**: PM2.5 historical data (CC BY 4.0)
- **IHME**: Health impact data (Free for research)
- **Government Agencies**: Official monitoring data

---

## ⚠️ Disclaimer

**Educational & Research Purposes Only**

This project is designed for educational and research purposes. The AI model for PM2.5 prediction is experimental and should not be used as the sole basis for health or safety decisions. Always refer to official air quality monitoring agencies for authoritative information.

---

## 🙏 Acknowledgments

- **EU Copernicus CAMS** for free atmospheric data
- **Our World in Data** for verified research data
- **IHME** for health impact statistics
- **Earth.Nullschool** for design inspiration
- **Three.js** team for 3D library
- **TensorFlow.js** team for machine learning framework

---

**Made with ❤️ for cleaner air**
