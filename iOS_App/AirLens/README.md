# AirLens iOS App

<div align="center">
  <img src="https://img.shields.io/badge/Swift-5.9-orange.svg" alt="Swift 5.9">
  <img src="https://img.shields.io/badge/iOS-15.0+-blue.svg" alt="iOS 15.0+">
  <img src="https://img.shields.io/badge/SwiftUI-3.0-green.svg" alt="SwiftUI 3.0">
</div>

## Overview

**AirLens** is an AI-powered iOS application that monitors air quality using computer vision and machine learning. The app analyzes sky images to predict PM2.5 levels and provides access to global air quality monitoring stations and environmental policies.

## Features

### 🌍 Global Coverage
- Track air quality from thousands of monitoring stations worldwide
- Interactive globe view with station markers
- Real-time PM2.5 and PM10 measurements
- AQI (Air Quality Index) calculations

### 📸 AI-Powered Prediction
- Capture sky images using your iPhone camera
- Advanced machine learning models predict PM2.5 levels
- Multi-source methodology combining:
  - Image analysis
  - Weather data
  - Historical trends
  - Satellite data

### 📋 Policy Tracking
- Browse environmental policies by country
- Categorized by type (emissions, health, transportation, etc.)
- Credibility scoring for policy sources
- Direct links to official documentation

### 📊 Statistics & Analytics
- View global air quality statistics
- Model performance metrics
- Data source information
- Historical trends and patterns

## Architecture

The app follows the MVVM (Model-View-ViewModel) architecture pattern with SwiftUI:

```
AirLens/
├── App/                    # App entry point and main views
│   ├── AirLensApp.swift
│   └── ContentView.swift
├── Models/                 # Data models
│   ├── Station.swift
│   ├── Policy.swift
│   ├── Prediction.swift
│   └── Statistics.swift
├── ViewModels/            # Business logic
│   ├── StationViewModel.swift
│   ├── PolicyViewModel.swift
│   ├── CameraViewModel.swift
│   └── GlobeViewModel.swift
├── Views/                 # UI components
│   ├── Camera/
│   ├── Globe/
│   ├── Settings/
│   └── Components/
├── Services/              # Network and device services
│   ├── APIService.swift
│   ├── LocationService.swift
│   └── CameraService.swift
└── Utilities/             # Helper functions and extensions
    ├── Extensions.swift
    └── Constants.swift
```

## Requirements

- iOS 15.0 or later
- Xcode 14.0 or later
- Swift 5.9 or later
- iPhone with camera (for image analysis features)
- Location services (optional, for nearby stations)

## Installation

### Using Xcode

1. Clone the repository:
```bash
git clone https://github.com/joymin5655/joymin.git
cd joymin
```

2. Open the project in Xcode:
```bash
open AirLens.xcodeproj
```

3. Select your development team in the project settings

4. Build and run on your device or simulator

### Configuration

The app requires a backend API for full functionality. Update the API base URL in `Services/APIService.swift`:

```swift
private let baseURL = "YOUR_API_BASE_URL"
```

## Backend API

The app connects to a FastAPI backend that provides:

- `/api/stations` - Air quality monitoring stations
- `/api/stations/nearby` - Nearby stations based on location
- `/api/policies` - Environmental policies
- `/api/predict` - PM2.5 prediction from images
- `/api/statistics` - Global statistics

See the original [Finedust_proj](https://github.com/joymin5655/Finedust_proj) repository for backend setup.

## Features in Detail

### Camera View
- Take photos of the sky using your iPhone camera
- Upload existing photos from your library
- Real-time AI analysis with confidence scoring
- Beautiful results display with air quality indicators
- Confetti animation for good air quality! 🎉

### Globe View
- Interactive map showing global monitoring stations
- Color-coded markers based on PM2.5 levels
- Tap stations to view detailed information
- Browse environmental policies by country

### Stations List
- Comprehensive list of all monitoring stations
- Search and filter functionality
- Find nearby stations based on your location
- Detailed view with metrics and information

### Settings
- Dark mode toggle
- Language selection (English/Korean)
- Model performance charts
- Data sources information
- App version and about information

## Data Sources

AirLens aggregates data from multiple trusted sources:

- **WAQI (World Air Quality Index)** - Real-time global air quality data
- **IQAir** - Air quality information and forecasts
- **NOAA GFS** - Weather forecasting data
- **NASA FIRMS** - Fire detection and tracking
- **Sentinel-5P** - Satellite atmospheric monitoring

## Privacy

AirLens respects your privacy:

- Location data is only used when you explicitly request nearby stations
- Camera access is only requested when you want to capture images
- No personal data is collected or stored
- All image analysis is performed securely through the API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original web version: [Finedust_proj](https://github.com/joymin5655/Finedust_proj)
- Data sources: WAQI, IQAir, NOAA, NASA, ESA
- Icons: SF Symbols

## Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ for cleaner air
