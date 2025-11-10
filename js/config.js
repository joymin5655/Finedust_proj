/**
 * API Configuration
 *
 * ✅ ALL DATA FROM OFFICIAL INTERNATIONAL AGENCIES ONLY
 * This application uses ONLY data from verified international organizations:
 *
 * 🇪🇺 EU Copernicus CAMS - European Union official atmospheric monitoring (NO API KEY NEEDED)
 * 🌍 WAQI - World Air Quality Index (11,000+ stations)
 * ☁️ OpenWeather - Global meteorological data
 * 🏛️ OpenAQ - Government official monitoring stations
 *
 * All APIs are completely FREE - just register to get your token/key.
 * RECOMMENDED: Configure at least ONE of the APIs below for ground station data.
 */

const API_CONFIG = {
  /**
   * WAQI (World Air Quality Index) - RECOMMENDED ✅
   * Coverage: 11,000+ stations worldwide
   * Data: Real-time PM2.5, PM10, O3, NO2, SO2, CO
   * Free: Yes (token required)
   *
   * How to get FREE token:
   * 1. Visit: https://aqicn.org/data-platform/token
   * 2. Enter your email
   * 3. Check email for token
   * 4. Paste token below
   */
  waqi: {
    token: null, // Replace with your token: 'your-token-here'
    enabled: false // Set to true after adding your token
  },

  /**
   * OpenWeather Air Pollution API - RECOMMENDED ✅
   * Coverage: Global coordinates-based data
   * Data: PM2.5, PM10, CO, NO, NO2, O3, SO2, NH3
   * Free: 1,000,000 calls/month
   *
   * How to get FREE API key:
   * 1. Visit: https://home.openweathermap.org/users/sign_up
   * 2. Create free account
   * 3. Generate API key from dashboard
   * 4. Paste API key below
   */
  openweather: {
    apiKey: null, // Replace with your API key: 'your-api-key-here'
    enabled: false // Set to true after adding your API key
  },

  /**
   * OpenAQ API v3 - OPTIONAL
   * Coverage: Varies by region (good in US, Europe, India, China)
   * Data: PM2.5 from government monitoring stations
   * Free: Yes (API key required)
   *
   * How to get FREE API key:
   * 1. Visit: https://explore.openaq.org/register
   * 2. Create account
   * 3. Generate API key
   * 4. Paste API key below
   */
  openaq: {
    apiKey: null, // Replace with your API key: 'your-api-key-here'
    enabled: false // Set to true after adding your API key
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}
