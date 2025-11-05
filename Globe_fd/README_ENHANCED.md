# 🌍 AirLens - Enhanced iOS Air Quality Monitor

## 📱 Modern UI Air Quality Monitoring App

An advanced iOS application that combines real-time global air quality data with AI-powered camera analysis for PM2.5 prediction. Built with SwiftUI and modern iOS design principles.

---

## ✨ Features

### 🏠 **Home Dashboard**
- Real-time air quality monitoring for your location
- Interactive charts and trends
- Health recommendations based on current conditions
- Quick access to nearby station data

### 🗺️ **Interactive Map**
- Global station visualization with color-coded markers
- Filter by air quality levels
- Real-time search and location tracking
- Detailed station information cards

### 📸 **AI Camera Analysis**
- Capture or select photos to predict PM2.5 levels
- Machine learning-powered analysis
- Confidence scoring and breakdown
- Analysis history tracking

### 📋 **Policy Tracker**
- Global air quality policies and regulations
- Credibility scoring system
- Country-based filtering
- Direct links to official sources

### 👤 **User Profile**
- Personal statistics and activity tracking
- Customizable settings and preferences
- Data export functionality
- About and help sections

---

## 🛠️ Enhanced UI Components

### **Design System**
- Dark mode optimized
- Gradient accents and modern shadows
- Smooth animations and transitions
- Accessibility-friendly color schemes

### **Interactive Elements**
- Pull-to-refresh functionality
- Swipe gestures for navigation
- Long press for quick actions
- Haptic feedback integration

### **Visual Indicators**
- Color-coded PM2.5 categories
- Animated loading states
- Progress indicators
- Visual data representations

---

## 📲 Setup Instructions

### Prerequisites

1. **Xcode 15.0+**
2. **iOS 15.0+**
3. **macOS Ventura or later**
4. **Python 3.9+** (for backend)
5. **Node.js** (optional, for additional tools)

### Installation Steps

#### 1. Clone/Setup Project

```bash
cd /Users/joymin/Coding_proj/Finedust_proj/Globe_fd
```

#### 2. Install Backend Dependencies

```bash
# Python dependencies
pip install fastapi uvicorn pandas numpy

# Optional: Create virtual environment
python3 -m venv venv
source venv/bin/activate
```

#### 3. Start Backend Server

```bash
# In project root directory
python main.py

# Server runs on http://localhost:8000
# Test: http://localhost:8000/health
```

#### 4. Configure Xcode Project

1. Open `Globe_fd.xcodeproj` in Xcode
2. Select your development team in Signing & Capabilities
3. Update Bundle Identifier if needed
4. Select target device/simulator

#### 5. Update Info.plist

Ensure these permissions are present:

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is needed to analyze air quality from photos</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Photo library access is needed to select images for analysis</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Location access helps show air quality in your area</string>

<key>NSLocalNetworkUsageDescription</key>
<string>Network access is required for real-time data</string>

<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

---

## 🚀 Running the App

### Development Mode

1. **Start Backend:**
```bash
cd /Users/joymin/Coding_proj/Finedust_proj/Globe_fd
python main.py
```

2. **Run iOS App:**
```bash
# In Xcode:
# Cmd + R (Run)
# Or use the play button
```

3. **Alternative Script:**
```bash
# Use the provided script
./run_airlens.sh
```

### Production Mode

1. **Backend Deployment:**
```bash
# Deploy to cloud service (e.g., Render, Heroku)
# Update APIClient.swift baseURL
```

2. **iOS Build:**
```bash
# Archive in Xcode
# Product > Archive
# Distribute to App Store or TestFlight
```

---

## 📁 Project Structure

```
Globe_fd/
├── App/
│   ├── ContentView.swift       # Main tab view with enhanced UI
│   ├── Globe_fdApp.swift        # App entry point
│   └── ImagePickerView.swift    # Camera/Photo picker
│
├── Views/
│   ├── MapView.swift           # Interactive map with stations
│   ├── CameraView.swift        # AI camera analysis
│   ├── PoliciesView.swift      # Policy tracker
│   └── ProfileView.swift       # User profile & settings
│
├── ViewModels/
│   ├── StationViewModel.swift  # Station data management
│   ├── CameraViewModel.swift   # Camera analysis logic
│   ├── PolicyViewModel.swift   # Policy data management
│   └── ViewModelExtensions.swift # Helper extensions
│
├── Networking/
│   ├── APIClient.swift         # API communication
│   ├── Models.swift            # Data models
│   └── NetworkManager.swift    # Network utilities
│
├── Services/
│   ├── LocationService.swift   # Location tracking
│   ├── CameraService.swift     # Camera utilities
│   ├── MLService.swift         # ML predictions
│   └── StorageService.swift    # Data persistence
│
└── Resources/
    └── Assets.xcassets         # Images and colors
```

---

## 🎨 UI Features

### **Color Scheme**
- Primary: Green (#00FF00)
- Secondary: Cyan (#00FFFF)
- Accent: Blue (#007AFF)
- Background: Dark/Light adaptive
- PM2.5 Categories: Green → Yellow → Orange → Red → Purple

### **Typography**
- Headers: SF Pro Display Bold
- Body: SF Pro Text Regular
- Captions: SF Pro Text Light
- Monospace: SF Mono (for data)

### **Animations**
- Tab transitions: Slide with fade
- Card appearances: Scale with spring
- Loading states: Pulse animation
- Map markers: Bounce effect

---

## 🔧 Configuration

### API Endpoints

```swift
// In APIClient.swift
#if DEBUG
baseURL = "http://localhost:8000"
#else
baseURL = "https://your-api.com"
#endif
```

### Environment Variables

```swift
// Add to scheme environment variables
API_KEY = "your_api_key"
ML_MODEL_URL = "model_endpoint"
```

---

## 📊 Testing

### Unit Tests
```bash
# In Xcode
Cmd + U
# Or
Product > Test
```

### UI Tests
```bash
# Run UI test suite
Cmd + U (with UI test target selected)
```

### Manual Testing Checklist

- [ ] App launches without crashes
- [ ] All tabs load correctly
- [ ] Map displays station markers
- [ ] Camera capture works
- [ ] Photo selection works
- [ ] Policies load and filter
- [ ] Profile settings persist
- [ ] Network errors handled gracefully
- [ ] Location permission handled
- [ ] Pull-to-refresh works

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot connect to server"
```bash
# Check backend is running
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

#### 2. "No stations showing"
```bash
# Check API endpoint
curl http://localhost:8000/api/stations
```

#### 3. "Camera not working"
- Check Info.plist permissions
- Test on real device (simulator has limited camera)

#### 4. Build errors
```bash
# Clean build folder
Shift + Cmd + K

# Delete derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

---

## 📝 API Documentation

### Stations Endpoint
```
GET /api/stations
Parameters:
  - country: string (optional)
  - limit: integer (default: 100)
```

### Policies Endpoint
```
GET /api/policies
Parameters:
  - country: string (optional)
```

### Prediction Endpoint
```
POST /api/predict
Body: multipart/form-data
  - file: image file
```

---

## 🚀 Performance Optimizations

- **Lazy Loading**: Views load data only when needed
- **Image Caching**: Analyzed images cached locally
- **Pagination**: Large datasets loaded incrementally
- **Debouncing**: Search queries optimized
- **Background Updates**: Data refreshed in background

---

## 🔐 Security

- API keys stored in Keychain
- HTTPS enforced in production
- Input validation on all forms
- Image data sanitized before upload
- User data encrypted locally

---

## 📱 Device Support

- **iPhone**: 12 and newer recommended
- **iPad**: All models with iOS 15+
- **Orientation**: Portrait and landscape
- **Dynamic Type**: Supports all text sizes
- **VoiceOver**: Fully accessible

---

## 🎯 Future Enhancements

- [ ] Apple Watch companion app
- [ ] Widget for home screen
- [ ] AR visualization of air quality
- [ ] Social sharing features
- [ ] Offline mode with cached data
- [ ] Multiple language support
- [ ] Apple Health integration
- [ ] Siri Shortcuts

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Contributors

- JOYMIN - Lead Developer
- AirLens Team

---

## 📞 Support

For issues or questions:
- GitHub Issues: [Report here]
- Email: support@airlens.app

---

## 🎉 Acknowledgments

- WAQI for air quality data
- Apple for SwiftUI framework
- Open source community

---

**Last Updated**: November 5, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
