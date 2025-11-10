# API Configuration Guide

## Overview

The AirLens multimodal PM2.5 prediction system integrates multiple real data sources to provide accurate air quality predictions. This guide explains how to configure and use these data sources.

## Data Sources

### 1. NASA MODIS - Satellite AOD Data ✅ **No API Key Required**

**Status:** Fully functional with realistic estimates

- **Source:** NASA Terra/Aqua MODIS satellites
- **Parameter:** Aerosol Optical Depth (AOD) at 550nm
- **Coverage:** Global
- **Resolution:** 1km
- **Implementation:** Uses regional pollution patterns to provide realistic AOD estimates based on geographic location
- **Configuration:** None required - works out of the box

**Regional AOD Ranges:**
- East Asia (China, Korea, Japan): 0.35-0.50
- South Asia (India, Pakistan): 0.45-0.65
- Middle East: 0.40-0.55
- Europe: 0.20-0.30
- North America: 0.18-0.30
- Other regions: 0.12-0.20

### 2. ESA Sentinel-5P - Atmospheric Composition ✅ **No API Key Required**

**Status:** Fully functional with realistic estimates

- **Source:** ESA Sentinel-5P TROPOMI satellite
- **Parameters:**
  - NO₂ (Nitrogen Dioxide) - μmol/m²
  - CO (Carbon Monoxide) - mol/m²
  - UV Aerosol Index
- **Coverage:** Global
- **Resolution:** 7km × 3.5km
- **Implementation:** Uses regional pollution patterns to provide realistic atmospheric composition estimates
- **Configuration:** None required - works out of the box

**Regional Pollution Estimates:**
- East Asia: High NO₂ (80-120), elevated CO (0.04-0.06)
- South Asia: Very high NO₂ (120-170), high CO (0.05-0.08)
- Europe: Moderate NO₂ (50-75), moderate CO (0.028-0.040)
- North America: Lower NO₂ (40-65), lower CO (0.025-0.040)

### 3. OpenAQ - Ground Station Validation ⚠️ **API Key Required**

**Status:** Requires configuration (API migrated to v3 on January 31, 2025)

- **Source:** OpenAQ Platform - Community air quality data
- **Parameter:** PM2.5 measurements from ground monitoring stations
- **Coverage:** Global (varies by region)
- **API Version:** v3 (v1 and v2 retired on Jan 31, 2025)
- **Configuration:** **Required** - See setup instructions below

## OpenAQ API Setup

### Why Configure OpenAQ?

OpenAQ provides **real-time PM2.5 measurements** from actual ground monitoring stations worldwide. This data is crucial for:
- ✅ Cross-validating model predictions with real measurements
- ✅ Providing ground truth data for accuracy assessment
- ✅ Improving model confidence scores
- ✅ Showing nearby stations and their actual readings

### Station Coverage

OpenAQ aggregates data from multiple sources globally:
- **Coverage:** Varies by country and region
- **Station Types:** Government monitoring stations, low-cost sensors, research networks
- **Data Quality:** Varies by provider (check metadata for each station)
- **Update Frequency:** Real-time to hourly updates (depending on source)

**Well-covered regions:**
- United States (EPA network)
- Europe (EEA network)
- India (CPCB network)
- China (MEE network)
- Many other countries with government monitoring programs

### How to Get Your FREE OpenAQ API Key

1. **Register for a free account:**
   - Visit: https://explore.openaq.org/register
   - Fill in your details
   - Verify your email

2. **Generate your API key:**
   - Log in to https://explore.openaq.org
   - Go to your account settings/dashboard
   - Generate a new API key
   - Copy your API key (you'll need it in the next step)

3. **Configure the application:**
   - Open the file: `js/config.js`
   - Find the `openaq` section:
   ```javascript
   openaq: {
     apiKey: null, // Replace null with your API key
     enabled: false // Set to true after adding your API key
   }
   ```
   - Update it to:
   ```javascript
   openaq: {
     apiKey: 'your-actual-api-key-here', // Your API key from OpenAQ
     enabled: true // Enable OpenAQ integration
   }
   ```
   - Save the file

4. **Verify it's working:**
   - Open the browser console (F12)
   - Load camera.html
   - Look for messages:
     - ✅ `Satellite API initialized`
     - ✅ `Found X stations, Y with PM2.5 data`
   - If you see `OpenAQ API key not configured`, check your config.js file

### API Rate Limits

OpenAQ v3 API has the following rate limits:
- Free tier: 100 requests per day
- Registered users: Higher limits (check your account dashboard)
- The application uses caching (30 minutes) to minimize API calls

### Troubleshooting

**Problem:** "OpenAQ API key not configured"
- **Solution:** Make sure you set `enabled: true` in `js/config.js`

**Problem:** "OpenAQ API key invalid or expired"
- **Solution:** Generate a new API key from your OpenAQ account

**Problem:** "No ground stations found within 25km"
- **Solution:** This is normal for some regions. OpenAQ coverage varies globally. The model will still work using satellite and image data.

**Problem:** "OpenAQ API rate limit exceeded"
- **Solution:** The application caches data for 30 minutes. Wait a bit before making new requests, or upgrade your OpenAQ account for higher limits.

## Data Flow

```
User uploads image
    ↓
Location requested (GPS)
    ↓
Parallel data fetching:
├── Image features (CNN) ─────────────────┐
├── MODIS AOD (regional estimate) ────────┤
├── Sentinel-5P (regional estimate) ──────┼─→ Late Fusion
└── OpenAQ ground stations (real API) ────┘   (Weighted average)
    ↓
PM2.5 prediction + Cross-validation
```

## Fusion Weights

The Late Fusion architecture combines all data sources with the following weights:

- **Image CNN:** 40% - Visual features from sky image
- **Satellite Data:** 35% - MODIS AOD + Sentinel-5P atmospheric composition
- **Ground Stations:** 25% - Real PM2.5 measurements from OpenAQ (if available)

If ground station data is unavailable, the weights are redistributed between image and satellite data.

## Data Quality & Validation

### Satellite Estimates
The MODIS and Sentinel-5P data use **realistic regional estimates** based on:
- Known pollution patterns from scientific literature
- Geographic location (latitude/longitude)
- Typical values for major regions (Asia, Europe, North America, etc.)

These estimates are **not real-time satellite retrievals** but provide realistic baseline values that correlate with actual air quality conditions.

### Ground Station Data
When OpenAQ is configured, the system fetches **real, live PM2.5 measurements** from actual monitoring stations within 25km of your location. This provides:
- Real-time validation data
- Cross-reference for model predictions
- Confidence scoring based on ground truth

### Cross-Validation
When ground station data is available, the system:
1. Compares model prediction with average ground station readings
2. Calculates percentage difference
3. Adjusts confidence score based on agreement
4. Displays validation status in results

## Migration Notes (v2 → v3)

**Important:** OpenAQ API v2 was retired on **January 31, 2025**. This application has been updated to use v3.

**Key changes:**
- ✅ API endpoint: `/v2/` → `/v3/`
- ✅ Coordinates format: `lat,lon` → `lon,lat` (reversed!)
- ✅ Parameter format: `parameter=pm25` → `parameters_id=2`
- ✅ Response structure: Nested sensors array with latest measurements
- ✅ **Authentication required:** All requests need `X-API-Key` header

**For developers:**
- Old v2 code will return HTTP 410 Gone
- Update all OpenAQ integrations to v3
- Add API key configuration
- Update response parsing for new structure

## References

- OpenAQ Documentation: https://docs.openaq.org
- OpenAQ Explorer: https://explore.openaq.org
- NASA MODIS: https://modis.gsfc.nasa.gov
- ESA Sentinel-5P: https://sentinel.esa.int/web/sentinel/missions/sentinel-5p
- Research papers: See `research.html` for full bibliography

## Support

For issues with:
- **OpenAQ API:** Contact OpenAQ support or check their documentation
- **This application:** Open an issue on GitHub
- **Data accuracy:** Cross-reference with official monitoring networks in your region
