# AirLens iOS Unified PRD (Claude-Ready)

Main takeaway: Build two iOS experiences (Globe, Camera) in one codebase with on-device CoreML + SceneKit + SwiftUI, resilient offline caching, and triple-source verification (station, camera, satellite). Optimize for accessibility and zero external server dependency where possible.

## 1. Goals & Scope
- Goals
  - Provide intuitive air-quality awareness (color, haptics, voice) including for low-vision users
  - Predict PM2.5 from live sky capture
  - Explore global stations and country policies on a 3D globe
- Scope
  - iOS 15+; optimized for iPhone 12+
  - Offline mode with cached data
  - Claude-led workflow (code generation, refactor, tests)
- Success Metrics
  - RMSE < 8.5 μg/m³; end-to-end prediction < 10s; location lock < 10s; Globe 60 FPS

## 2. User Scenarios
- General user: Check current AQI → camera prediction → policy summary + health guide with voice
- Research/policy user: Select city → view stations + policies → flow lines visualization → camera validation
- Accessibility user: high-contrast palette, VoiceOver, larger tap targets, haptic cues

## 3. Product Structure
- Monorepo with two targets or one app with two tabs
  - Tab 1: Globe (stations, policies, flow, heatmap)
  - Tab 2: Camera (capture, predict, triple-verify)
- Extensions: Widget (current AQI), Live Activity (alerts)

Recommended folders
- App, Models, Views(Globe/Camera/Policies), ViewModels, Services(API/ML/Location/Cache), Resources(Assets/CoreML), Tests

## 4. Functional Requirements
### 4.1 Common
- Onboarding permissions (location/camera/notifications)
- Local cache (stations/policies/recent predictions up to 50, TTL & eviction; 7-day retention)
- Accessibility (Dynamic Type, VoiceOver, color-blind palette)

### 4.2 Globe
- SceneKit/Metal globe, user gestures (drag, pinch, double-tap to current location)
- 30k+ station markers with AQI color scale; tap to show detail
- Atmospheric flow particles (wind-driven) and AQI heatmap with LOD
- Policy overlay per country with credibility badge and last-updated
- Search/filter: region, pollutant, AQI range
- Performance: 60 FPS; incremental updates; marker tiling; adaptive LOD

### 4.3 Camera
- Live capture (≈3s, ~30 frames) → quality scoring → top ~15 frames feature extraction (no persistent image storage)
- On-device CoreML (CNN-LSTM) inference (target < 2s)
- Triple verification
  - Tier1 Station: nearest K (e.g., 5) IDW interpolation + confidence
  - Tier2 Camera: model prediction + quality-derived confidence
  - Tier3 Satellite AOD: conversion with calibration + confidence
  - Bayesian weighted fusion → final PM2.5 ± uncertainty, confidence score
- Results view: per-source breakdown, final value, uncertainty band, history
- Offline: uses cached station/satellite + conservative fusion

### 4.4 Alerts & Widgets
- Local alerts for AQI spikes/policy updates within user’s area
- Widget shows current PM2.5 and trend

## 5. Non-Functional Requirements
- Performance: end-to-end < 10s; inference < 2s; memory < 200MB(Camera); Globe peak < 500MB
- Battery: < 2% per prediction; minimize background location updates
- Security/Privacy: no persistent image storage; feature vectors only; sensitive data encrypted
- Reliability: crash rate < 0.1%; robust fallback on cache
- Internationalization: ko/en first; units and AQI localized

## 6. Data & Integrations
- Stations: WAQI (10-min TTL, incremental refresh)
- Satellite: Sentinel-5P AOD (3-hour cadence) with local conversion table
- Policies: trusted authorities (EPA, AirKorea, EEA, etc.), deduped + credibility scoring
- Weather auxiliaries: temperature/humidity for model correction

Offline strategy
- Snapshot last-good responses (Codable + SQLite/Realm)
- Globe: last tiles/markers/policies
- Camera: cached Tier1/Tier3 + conservative fusion

## 7. Architecture & Services
- LocationService (CoreLocation): 100m/30s sampling; target <10m lock
- CameraService (AVFoundation): frame buffer; quality scoring
- MLService (CoreML): CNN-LSTM; 15×576 input; FP16 priority
- StationService: nearest search; IDW; confidence estimation
- SatelliteService: AOD→PM2.5 transform + confidence
- FusionService: Bayesian weighting + uncertainty + consistency bonus
- GlobeEngine (SceneKit/Metal): globe, markers, heatmap, particles with LOD
- PolicyEngine: ingest/merge/scoring, local search/filter

Data models (essential)
- Station(id, name, lat, lon, pm25, updatedAt)
- Policy(id, country, authority, category, title, url, effectiveDate, credibility)
- FrameFeature(id, ts, features[Float], quality, metadata)
- Prediction(pm25, confidence, uncertainty, breakdown{station,camera,satellite}, ts)

Storage
- NSCache → SQLite/Realm; optional iCloud sync
- Keychain for secrets

## 8. UX & Accessibility
- AQI palette with color-blind variants; strong contrast
- VoiceOver labels for all data; haptic feedback on completion/alerts
- Camera guidance: framing hints and brightness warnings
- Globe gestures: drag, pinch, double-tap to locate, long-press for details

## 9. Quality Metrics & Validation
- Accuracy: MAE/RMSE vs stations by region/time
- Performance: FPS, inference time, memory, power (Xcode Instruments)
- Stability: crash-free, exception coverage
- Freshness: station <10m, satellite <3h, policy monthly/quarterly

## 10. Development Plan (Claude-driven)
- W1-2: scaffold, Location/Camera pipelines, quality scorer
- W3-4: CoreML integration, Station API, base globe markers
- W5-6: Satellite conversion + Bayesian fusion, flow/heatmap, dashboard
- W7-8: Policy ingestion/display, accessibility/perf tuning, beta

Claude prompts (examples)
- “Generate SceneKit globe with 30k markers, tiled LOD, and 60 FPS target.”
- “AVFoundation 3s capture → quality top-15 features extractor with unit tests.”
- “CoreML CNN-LSTM (15×576) FP16 optimization and <2s inference refactor.”

## 11. Acceptance Criteria
- AC-1 Location lock <10s; fallback path on failure
- AC-2 Camera→Final prediction <10s; ML inference <2s
- AC-3 Triple verification UI with final value, uncertainty, confidence
- AC-4 Globe 60 FPS; renders ≥30k markers with LOD
- AC-5 Policies per-country with credibility badge and working links
- AC-6 Offline mode shows last-known data with clear limitation notices
- AC-7 No persistent image storage; explicit privacy consent flow

## 12. Release Checklist
- Permissions/privacy strings localized; App Privacy Details accurate
- Battery/memory/performance regression suite green
- Fallback/Errors UX validated
- Unit/Integration/UI/Accessibility tests ≥90% coverage
- TestFlight ≥100 users; feedback incorporated

## 13. Risks & Mitigations
- API limits/outage → cache, incremental fetch, backup sources, user notices
- Satellite conversion error → regional calibration tables + updates
- Performance bottlenecks → Metal particles, marker tiling, async pipelines
- Privacy concerns → on-device processing; strict no-image-retention policy

## 14. Key Code References
- LocationSessionManager, LivePhotoCameraManager, StationDataFetcher(IDW), CameraModelInference(CoreML), TripleVerificationFusion(Bayesian), AnimatedGlobeViewController(SceneKit)

—
This PRD consolidates the Camera PRD, Globe PRD, and Integrated System guide into an actionable, Claude-ready specification to build AirLens on iOS with on-device intelligence, offline resilience, and accessibility-first design.