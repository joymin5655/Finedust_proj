# 🌍 AirLens - See the Air

> **Real-time air quality visualization powered by AI**  
> 30,000+ stations • 195 countries • One beautiful interface

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Live Demo:** [https://joymin5655.github.io/Finedust_proj](https://joymin5655.github.io/Finedust_proj)

---

## ✨ Features

### 🌐 Interactive 3D Globe
- Explore 30,000+ monitoring stations on a stunning 3D Earth
- Real-time air quality data from around the world
- Smooth 60 FPS rendering with Three.js
- Click markers to view detailed station information

### 📸 Camera AI Prediction
- Upload a photo of the sky
- AI instantly predicts PM2.5 levels
- Browser-based inference with TensorFlow.js
- No server required - complete privacy

### 📊 Policy Research
- Comprehensive global air quality policies
- 195 countries covered
- Credibility-scored data sources
- Actionable insights for cleaner air

---

## 🚀 Quick Start

### View Live
Simply visit: **[https://joymin5655.github.io/Finedust_proj](https://joymin5655.github.io/Finedust_proj)**

No installation required! Works on:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Android)
- ✅ Tablets and any device with WebGL support

### Run Locally

```bash
# Clone the repository
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj

# Serve with any static server
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx serve

# Option 3: VS Code Live Server extension
# Just open index.html and click "Go Live"

# Open browser
open http://localhost:8000
```

---

## 📁 Project Structure

```
Finedust_proj/
├── index.html              # Landing page
├── globe.html              # 3D globe viewer
├── camera.html             # Camera AI prediction
├── research.html           # Research documentation
├── about.html              # About page
│
├── css/
│   ├── main.css            # Core styles (Steve Jobs inspired)
│   ├── globe.css           # Globe-specific styles
│   └── camera.css          # Camera page styles
│
├── js/
│   ├── main.js             # Main interactions
│   ├── hero-animation.js   # Landing page animation
│   ├── globe.js            # 3D globe logic (Three.js)
│   └── camera.js           # Camera AI logic (TensorFlow.js)
│
├── data/
│   ├── stations.json       # Air quality stations data
│   └── policies.json       # Policy database
│
└── .github/workflows/
    └── deploy.yml          # GitHub Pages deployment
```

---

## 🎨 Design Philosophy

Inspired by Steve Jobs' principle: **"Simplicity is the ultimate sophistication"**

- ✨ Minimal, elegant interface
- 🎯 Clear hierarchy and purpose
- 💧 Water droplet aesthetic with glassmorphism
- 📱 Fully responsive design
- ♿ Accessibility-first (WCAG 2.1 AA compliant)

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | HTML5, CSS3, Modern JavaScript (ES6+) |
| **3D Graphics** | Three.js, WebGL |
| **AI/ML** | TensorFlow.js (browser-based) |
| **Data** | JSON, RESTful patterns |
| **Deployment** | GitHub Pages (100% free) |
| **CI/CD** | GitHub Actions |

**Zero Backend** - Everything runs in your browser!

---

## 📊 Data Sources

- **WAQI (World Air Quality Index)** - 30,000+ stations
- **Copernicus Sentinel-5P** - Satellite AOD data
- **EPA AirNow** - US air quality
- **AirKorea** - South Korea monitoring
- **EEA** - European Environment Agency

---

## 🔧 Development

### Prerequisites
- Modern browser with WebGL support
- (Optional) Node.js for local development server

### Making Changes

1. **Fork** this repository
2. **Clone** your fork
3. **Create** a feature branch
4. **Make** your changes
5. **Test** locally
6. **Commit** and **push**
7. **Open** a Pull Request

### Code Style
- Use 2 spaces for indentation
- Follow existing patterns
- Comment complex logic
- Keep functions small and focused

---

## 🚀 Deployment

This project automatically deploys to GitHub Pages on every push to `main` or `web-portfolio-redesign` branch.

**To deploy your own:**

1. Fork this repository
2. Go to Settings → Pages
3. Source: Deploy from branch
4. Branch: Select `main` or `web-portfolio-redesign`
5. Save

Your site will be live at: `https://[your-username].github.io/Finedust_proj`

---

## 📈 Performance

- ⚡ **Load Time:** < 3 seconds
- 🎮 **Globe FPS:** 60 FPS stable
- 🧠 **AI Inference:** < 2 seconds
- 📦 **Bundle Size:** < 2 MB total

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Check existing issues
2. Open an issue for new features
3. Follow code style guidelines
4. Write clear commit messages
5. Update documentation

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **WAQI** for providing free air quality data
- **Three.js** community for amazing 3D library
- **TensorFlow.js** team for browser-based ML
- **GitHub** for free hosting

---

## 📞 Contact

**Creator:** Joymin  
**Email:** joymin5655@gmail.com  
**GitHub:** [@joymin5655](https://github.com/joymin5655)

---

<div align="center">

**Built with ❤️ for a cleaner planet**

[View Demo](https://joymin5655.github.io/Finedust_proj) • [Report Bug](https://github.com/joymin5655/Finedust_proj/issues) • [Request Feature](https://github.com/joymin5655/Finedust_proj/issues)

</div>
