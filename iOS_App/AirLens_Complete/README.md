# AirLens - Global Air Quality Monitoring iOS App

<div align="center">
  <img src="icon.png" width="120" height="120" alt="AirLens Logo">
  <h1>AirLens</h1>
  <p>Real-time global air quality monitoring with AI-powered PM2.5 prediction</p>
  
  [![Swift](https://img.shields.io/badge/Swift-5.9-orange.svg)](https://swift.org)
  [![iOS](https://img.shields.io/badge/iOS-15.0+-blue.svg)](https://developer.apple.com/ios/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

---

## 🌟 Features

- 🌍 **3D Globe Visualization** - Interactive 3D globe showing 30,000+ air quality stations worldwide
- 📸 **AI Camera Prediction** - Predict PM2.5 levels from photos using CNN-LSTM model
- 📋 **Policy Dashboard** - Track environmental policies from 150+ countries
- 📊 **Real-time Statistics** - Live air quality data and trends
- 📍 **Location-based Alerts** - Get notifications about air quality changes in your area
- 🔄 **Offline Support** - Cached data for offline viewing

## 📱 Screenshots

| Globe View | Camera Prediction | Policies | Statistics |
|------------|------------------|----------|------------|
| ![Globe](screenshots/globe.png) | ![Camera](screenshots/camera.png) | ![Policies](screenshots/policies.png) | ![Stats](screenshots/stats.png) |

## 🚀 Quick Start

### Prerequisites

- macOS 13.0+
- Xcode 15.0+
- iOS 15.0+ device or simulator
- Python 3.9+ (for backend)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/airlens.git
cd airlens/AirLens_Complete
```

2. **Install backend dependencies**
```bash
cd Backend
pip install -r requirements.txt
```

3. **Start the backend server**
```bash
python main.py
# Server runs on http://localhost:8000
```

4. **Open in Xcode**
```bash
cd ..
open AirLens.xcodeproj
```

5. **Build and Run**
- Select your target device/simulator
- Press `Cmd + R` to build and run

## 📁 Project Structure

```
AirLens_Complete/
├── App/                    # Main app files
│   ├── AirLensApp.swift   # App entry point
│   └── ContentView.swift   # Main tab view
├── Models/                 # Data models
│   ├── Station.swift       # Air quality station model
│   ├── AirPolicy.swift     # Policy model
│   └── PredictionResult.swift # AI prediction model
├── ViewModels/             # Business logic
│   ├── StationViewModel.swift
│   ├── PolicyViewModel.swift
│   ├── CameraViewModel.swift
│   └── GlobeViewModel.swift
├── Views/                  # UI Components
│   ├── GlobeView.swift     # 3D Globe
│   ├── CameraView.swift    # Camera/Prediction
│   ├── PoliciesView.swift  # Policy list
│   └── StatsView.swift     # Statistics
├── Services/               # Core services
│   ├── APIClient.swift     # Network layer
│   ├── LocationService.swift # Location tracking
│   └── StorageService.swift # Local storage
├── Utilities/              # Helper files
│   ├── Constants.swift     # App constants
│   └── Extensions.swift    # Swift extensions
├── Backend/                # Python FastAPI server
│   ├── main.py            # API endpoints
│   └── requirements.txt   # Python dependencies
└── Info.plist             # App permissions
```

## 🔧 Configuration

### API Configuration

Update the API endpoints in `Utilities/Constants.swift`:

```swift
enum API {
    static let baseURL = "https://your-api-url.com"
    static let waqiAPIKey = "YOUR_WAQI_API_KEY"
}
```

### Permissions

The app requires the following permissions (configured in Info.plist):
- Location (When In Use / Always)
- Camera
- Photo Library

## 🌐 Backend API

The FastAPI backend provides the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stations` | GET | Get air quality stations |
| `/api/stations/nearby` | GET | Get nearby stations |
| `/api/policies` | GET | Get environmental policies |
| `/api/predict` | POST | Predict PM2.5 from image |
| `/api/statistics` | GET | Get global statistics |
| `/health` | GET | Health check |

### Running the Backend

```bash
# Development
python main.py

# Production (with Uvicorn)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🧪 Testing

### Unit Tests
```bash
# In Xcode
Cmd + U
```

### UI Tests
```bash
# In Xcode
Cmd + Shift + U
```

## 📊 Data Sources

- **WAQI** - World Air Quality Index (30,000+ stations)
- **World Bank** - Environmental policies database
- **NASA FIRMS** - Satellite data for air quality
- **National EPAs** - Country-specific data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [WAQI](https://waqi.info) for air quality data
- [World Bank](https://worldbank.org) for policy data
- [SceneKit](https://developer.apple.com/scenekit/) for 3D visualization
- [FastAPI](https://fastapi.tiangolo.com) for backend framework

## 📧 Contact

- **Developer**: Your Name
- **Email**: your.email@example.com
- **Website**: [airlens.app](https://airlens.app)
- **Twitter**: [@airlensapp](https://twitter.com/airlensapp)

## 🚦 Status

- ✅ iOS App - Complete
- ✅ Backend API - Complete
- 🔄 ML Model Training - In Progress
- 📋 App Store Submission - Pending

---

<div align="center">
  Made with ❤️ for cleaner air worldwide
</div>