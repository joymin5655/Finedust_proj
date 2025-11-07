# 🌍 AirLens - See the Air

> **Interactive global air quality visualization powered by real data**  
> Real-time PM2.5 monitoring • Historical trends • Advanced 3D visualization

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Data Source](https://img.shields.io/badge/Data-Our_World_In_Data-blue)](https://ourworldindata.org)

**Live Demo:** [https://joymin5655.github.io/Finedust_proj](https://joymin5655.github.io/Finedust_proj)

---

## 🎯 What is AirLens?

AirLens transforms complex air quality data into an intuitive, beautiful 3D visualization. Explore global PM2.5 levels from 1990 to present day, understand pollution trends, and discover how air quality varies across different regions - all on an interactive Earth globe.

### 🌟 Key Highlights

- **🌍 Enhanced 3D Globe**: Earth.Nullschool-inspired design with smooth interactions
- **📊 Real Data**: Powered by Our World In Data - trusted, verified sources
- **📈 Historical Timeline**: Track PM2.5 trends from 1990 to 2021
- **🎨 Beautiful Visualization**: Atmospheric particles, color-coded markers, real-time rendering
- **🔍 Deep Analysis**: Click any country to see detailed air quality information
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

- **Realistic 3D Earth** with atmospheric glow and dynamic lighting
- **Color-coded PM2.5 markers** for 100+ countries
- **Atmospheric particle effects** simulating air currents
- **Smooth camera controls** with zoom, pan, and auto-rotate
- **60 FPS rendering** using Three.js and WebGL
- **Detailed country information** on click

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

### Our World In Data
Primary data source for PM2.5 concentrations and historical trends.

**APIs Used:**
- **PM2.5 Concentrations:** `https://ourworldindata.org/grapher/pm25-air-pollution.csv`
- **Long-run Air Pollution:** `https://ourworldindata.org/grapher/long-run-air-pollution.csv`

**Coverage:**
- 100+ countries
- Historical data from 1990-2021
- Regularly updated with latest research

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

Then navigate to: `http://localhost:8000/globe-enhanced.html`

---

## 🛠️ Technology Stack

- **Three.js** - 3D graphics and WebGL rendering
- **Vanilla JavaScript** - Fast and efficient
- **CSS3** - Modern styling with glassmorphism
- **Our World In Data API** - Verified global data

---

## 📁 Project Structure

```
Finedust_proj/
├── index.html               # Main landing page
├── globe-enhanced.html      # Enhanced 3D globe visualization
├── camera.html              # Camera AI PM2.5 predictor
├── research.html            # Air quality research & policies
├── about.html               # About page
│
├── js/
│   ├── theme-toggle.js      # Dark/light mode management
│   ├── main.js              # Common utilities & animations
│   ├── hero-animation.js    # Landing page animations
│   ├── globe-enhanced.js    # Enhanced globe logic
│   ├── camera.js            # Camera AI functionality
│   └── data-service.js      # OWID API integration
│
├── css/
│   ├── main.css             # Global styles & theme system
│   ├── globe-enhanced.css   # Globe-specific styles
│   └── camera.css           # Camera AI styles
│
└── data/
    ├── pm25-data.json       # PM2.5 historical data
    ├── stations.json        # Monitoring stations data
    └── policies.json        # Air quality policies data
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

MIT License - see [LICENSE](LICENSE) for details.

### Data Attribution

- **Our World In Data**: PM2.5 data (CC BY 4.0)

---

## 🙏 Acknowledgments

- **Our World In Data** for air quality data
- **Earth.Nullschool** for design inspiration
- **Three.js** team for 3D library

---

**Made with ❤️ for cleaner air**
