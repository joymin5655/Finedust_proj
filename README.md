# 🌍 AirLens - See the Air

> **Interactive global air quality visualization powered by React**
> Real-time PM2.5 monitoring • AI-powered predictions • Advanced 3D visualization

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg)](https://vitejs.dev/)

**✅ NO API KEYS NEEDED - Works immediately!**

**Live Demo:** [https://joymin5655.github.io/Finedust_proj](https://joymin5655.github.io/Finedust_proj)

---

## 🎯 What is AirLens?

AirLens transforms complex air quality data into an intuitive, beautiful 3D visualization built with modern React. Using **official EU Copernicus CAMS data** (no API keys required), explore global PM2.5 levels in real-time, predict air quality from sky photos using AI, and discover pollution patterns across the globe - all on an interactive Earth globe.

### 🌟 Key Highlights

- **✅ NO TOKEN REQUIRED**: Works immediately - no API keys, no registration needed!
- **⚛️ React-Powered**: Modern React 19 with Vite for blazing fast performance
- **🇪🇺 Official EU Data**: Real-time data from EU Copernicus CAMS (ECMWF)
- **🌍 3D Globe Visualization**: 174+ cities worldwide with live PM2.5 data
- **📸 Camera AI**: Upload sky photos to predict PM2.5 using multimodal AI
- **🎨 Beautiful Interface**: Smooth animations, responsive design, dark mode
- **📱 Fully Responsive**: Works seamlessly on desktop, tablet, and mobile

---

## ✨ Features

### 🌙 Dark/Light Mode Toggle
- **Persistent theme preference** using localStorage
- **Dynamic UI adaptation** across all components
- **Smooth transitions** with React state management

### 🌐 Interactive 3D Globe
Built with **React Three Fiber** and **Three.js**:
- **Realistic 3D Earth** with NASA Blue Marble texture
- **Color-coded PM2.5 markers** for 174+ cities
- **Country policy visualization** with historical trends
- **Smooth OrbitControls** for intuitive navigation
- **60 FPS rendering** using WebGL

### 📸 Camera AI - PM2.5 Predictor
**Sky Image Analysis with Machine Learning**:
- Upload sky photos to estimate PM2.5 levels
- Browser-based processing (no server uploads)
- React-based UI with drag & drop support

### 📊 Data Analysis Tools
- **Global Statistics Dashboard**
- **Historical Timeline** (1990-2021)
- **WHO Air Quality Guidelines**
- **Interactive Charts** with Chart.js

---

## 🚀 Quick Start

### View Live
Visit: **[https://joymin5655.github.io/Finedust_proj](https://joymin5655.github.io/Finedust_proj)**

### Run Locally

```bash
# Clone the repository
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj/airlens-react

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

Then navigate to: `http://localhost:5173`

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Vite 7** - Next generation frontend tooling
- **React Router 7** - Client-side routing
- **React Three Fiber** - React renderer for Three.js
- **Three.js** - 3D graphics and WebGL rendering

### Visualization
- **@react-three/drei** - Useful helpers for R3F
- **@react-three/fiber** - React reconciler for Three.js
- **Chart.js** - Data visualization
- **react-chartjs-2** - React wrapper for Chart.js

### Build & Deploy
- **Vite** - Build tool and dev server
- **gh-pages** - GitHub Pages deployment
- **ESLint** - Code linting

---

## 📁 Project Structure

```
Finedust_proj/
├── airlens-react/                # React source code
│   ├── src/
│   │   ├── pages/               # Page components
│   │   │   ├── Home.jsx         # Landing page with hero animation
│   │   │   ├── Globe.jsx        # 3D Globe visualization
│   │   │   ├── Camera.jsx       # Camera AI PM2.5 predictor
│   │   │   ├── Research.jsx     # Research & policies
│   │   │   ├── About.jsx        # About page
│   │   │   └── Settings.jsx     # Settings & API configuration
│   │   │
│   │   ├── components/          # Reusable components
│   │   │   ├── Navbar.jsx       # Navigation bar
│   │   │   └── ThemeToggle.jsx  # Dark/light mode toggle
│   │   │
│   │   ├── styles/              # CSS modules
│   │   │   ├── main.css         # Global styles
│   │   │   ├── responsive.css   # Mobile responsive
│   │   │   └── ...              # Page-specific styles
│   │   │
│   │   ├── data/                # Data files
│   │   │   └── policy-impact/   # Country policy data (67 countries)
│   │   │
│   │   ├── App.jsx              # Root component with routing
│   │   └── main.jsx             # Application entry point
│   │
│   ├── public/                  # Static assets
│   ├── package.json             # Dependencies & scripts
│   └── vite.config.js           # Vite configuration
│
├── assets/                      # Built assets (CSS, JS bundles)
├── index.html                   # Entry HTML (built from React)
└── 404.html                     # GitHub Pages SPA fallback

```

### 🎨 Component Architecture

**React-Based Design:**
- **Component composition** - Small, focused, reusable components
- **Hooks** - useState, useEffect, useRef for state management
- **React Router** - Declarative routing with Routes and Route
- **CSS Modules** - Scoped styling per component

---

## 📊 Data Sources

**✅ ALL DATA FROM OFFICIAL INTERNATIONAL AGENCIES**

### 🇪🇺 EU Copernicus CAMS (Primary - NO TOKEN REQUIRED)
Real-time atmospheric monitoring data via Open-Meteo API.

**Provider:** ECMWF (European Centre for Medium-Range Weather Forecasts)
**Data:** PM2.5, PM10, NO₂, SO₂, O₃, CO, AOD, Dust
**Coverage:** Worldwide
**Cost:** ✅ FREE - No API key needed

### 🌍 Optional Enhancement APIs (All FREE)
Configure in Settings page for enhanced coverage:
- **WAQI** - 11,000+ government monitoring stations
- **OpenWeather** - Global coordinate-based data
- **OpenAQ** - Government official monitoring stations

---

## 🚀 Development

### Development Server
```bash
cd airlens-react
npm run dev
```
Runs at `http://localhost:5173` with hot module replacement.

<<<<<<< HEAD
Then navigate to: `http://localhost:8000/globe.html`
=======
### Build
```bash
npm run build
```
Creates optimized production build in `dist/` directory.

### Deploy
```bash
npm run deploy
```
Builds and deploys to GitHub Pages automatically.
>>>>>>> restore-vanilla-version

### 🔑 Optional: Configure API Keys (For Enhanced Data)

**⚠️ IMPORTANT SECURITY NOTICE**

The app **works perfectly without any API keys** using EU Copernicus CAMS data. API keys are only needed if you want additional ground station data.

**If you want to add optional APIs:**

```bash
# 1. Copy the template file to create your config
cp js/config.template.js js/config.js

# 2. Edit js/config.js and add your API keys
# (config.js is in .gitignore and will NOT be committed)

# 3. Get free API keys (optional):
# - WAQI: https://aqicn.org/data-platform/token
# - OpenWeather: https://home.openweathermap.org/users/sign_up
# - OpenAQ: https://explore.openaq.org/register
```

**🔒 Security Best Practices:**
- ✅ `js/config.js` is in `.gitignore` - your keys will NOT be committed
- ✅ Never commit API keys to GitHub
- ✅ Use `config.template.js` for sharing code
- ✅ Keep your actual keys only in `config.js` (local file only)

For detailed API setup instructions, see [docs/API_SETUP.md](docs/API_SETUP.md)

---

## 🎨 Code Organization

<<<<<<< HEAD
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
=======
**Modern React Patterns:**
- ✅ **Functional components** with Hooks
- ✅ **React Router** for navigation
- ✅ **Component-scoped CSS** for styling
- ✅ **Three.js integration** via React Three Fiber
- ✅ **Lazy loading** for optimized performance
>>>>>>> restore-vanilla-version

---

## 🤝 Contributing

Contributions welcome! Fork the repo and submit a PR.

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

MIT License - see [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT) for details.

### Data Attribution
<<<<<<< HEAD

- **EU Copernicus CAMS (ECMWF)**: Real-time atmospheric data via Open-Meteo API
- **WHO, OECD, World Bank**: Historical PM2.5 trends and statistics
- **National Environmental Agencies**: Country-specific policy impact data
=======
- **EU Copernicus CAMS** for atmospheric data
- **Our World In Data** for historical PM2.5 data (CC BY 4.0)
>>>>>>> restore-vanilla-version

---

## 🙏 Acknowledgments

<<<<<<< HEAD
- **EU Copernicus CAMS (ECMWF)** for real-time atmospheric data
- **Earth.Nullschool** for design inspiration
- **Three.js** team for 3D library
- **Open-Meteo** for free API access
=======
- **React Team** for the amazing framework
- **Vite Team** for blazing fast tooling
- **Three.js & R3F** for 3D visualization capabilities
- **EU Copernicus CAMS** for atmospheric data
- **Earth.Nullschool** for design inspiration
>>>>>>> restore-vanilla-version

---

**Made with ❤️ and React for cleaner air**
