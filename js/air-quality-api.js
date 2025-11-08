/**
 * Air Quality API Module
 * Fetches real-time PM2.5 data from various sources
 */

class AirQualityAPI {
  constructor() {
    this.openAQBaseURL = 'https://api.openaq.org/v2';
    this.waqiBaseURL = 'https://api.waqi.info/feed';
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Get cached data if available and not expired
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Using cached data for ${key}`);
      return cached.data;
    }
    return null;
  }

  /**
   * Cache data with timestamp
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Fetch latest measurements from OpenAQ for a specific country
   * @param {string} countryCode - ISO 3166-1 alpha-2 country code
   * @returns {Promise<Object>} Air quality data
   */
  async fetchOpenAQCountryData(countryCode) {
    const cacheKey = `openaq_${countryCode}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.openAQBaseURL}/latest?limit=100&country=${countryCode}&parameter=pm25&order_by=datetime`;

      console.log(`Fetching OpenAQ data for ${countryCode}...`);
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenAQ API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const processedData = this.processOpenAQData(data.results, countryCode);
        this.setCachedData(cacheKey, processedData);
        return processedData;
      }

      return null;
    } catch (error) {
      console.warn(`Failed to fetch OpenAQ data for ${countryCode}:`, error.message);
      return null;
    }
  }

  /**
   * Process OpenAQ raw data into usable format
   */
  processOpenAQData(results, countryCode) {
    const pm25Values = results
      .filter(r => r.parameter === 'pm25' && r.value != null)
      .map(r => r.value);

    if (pm25Values.length === 0) return null;

    const avgPM25 = pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length;
    const maxPM25 = Math.max(...pm25Values);
    const minPM25 = Math.min(...pm25Values);

    // Group by city
    const citiesData = {};
    results.forEach(result => {
      if (result.parameter === 'pm25' && result.value != null) {
        const cityName = result.city || result.location;
        if (!citiesData[cityName]) {
          citiesData[cityName] = [];
        }
        citiesData[cityName].push(result.value);
      }
    });

    const topCities = Object.entries(citiesData)
      .map(([city, values]) => ({
        name: city,
        pm25: values.reduce((a, b) => a + b, 0) / values.length,
        aqi: this.calculateAQI(values.reduce((a, b) => a + b, 0) / values.length)
      }))
      .sort((a, b) => b.pm25 - a.pm25)
      .slice(0, 5);

    return {
      countryCode,
      avgPM25: parseFloat(avgPM25.toFixed(1)),
      maxPM25: parseFloat(maxPM25.toFixed(1)),
      minPM25: parseFloat(minPM25.toFixed(1)),
      aqi: this.calculateAQI(avgPM25),
      aqiLevel: this.getAQILevel(this.calculateAQI(avgPM25)),
      stationCount: results.length,
      cities: topCities,
      lastUpdated: new Date().toISOString(),
      source: 'OpenAQ'
    };
  }

  /**
   * Calculate AQI from PM2.5 value (US EPA standard)
   * @param {number} pm25 - PM2.5 concentration in µg/m³
   * @returns {number} AQI value
   */
  calculateAQI(pm25) {
    if (pm25 < 0) return 0;

    // PM2.5 breakpoints and AQI ranges (US EPA)
    const breakpoints = [
      { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
      { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
      { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
      { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
      { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
      { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 }
    ];

    let bp = breakpoints.find(b => pm25 >= b.cLow && pm25 <= b.cHigh);

    // If PM2.5 is higher than max breakpoint, use last breakpoint
    if (!bp && pm25 > 500.4) {
      return 500;
    }
    if (!bp) {
      bp = breakpoints[breakpoints.length - 1];
    }

    // AQI formula: I = ((IHi - ILo) / (CHi - CLo)) * (C - CLo) + ILo
    const aqi = Math.round(
      ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow
    );

    return aqi;
  }

  /**
   * Get AQI level description
   */
  getAQILevel(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  /**
   * Get AQI color
   */
  getAQIColor(aqi) {
    if (aqi <= 50) return '#00e400'; // Green
    if (aqi <= 100) return '#ffff00'; // Yellow
    if (aqi <= 150) return '#ff7e00'; // Orange
    if (aqi <= 200) return '#ff0000'; // Red
    if (aqi <= 300) return '#8f3f97'; // Purple
    return '#7e0023'; // Maroon
  }

  /**
   * Fetch data for multiple countries
   * @param {Array<string>} countryCodes - Array of country codes
   * @returns {Promise<Object>} Map of country codes to air quality data
   */
  async fetchMultipleCountries(countryCodes) {
    const results = {};

    // Fetch in parallel with delay to avoid rate limiting
    for (let i = 0; i < countryCodes.length; i++) {
      const code = countryCodes[i];
      try {
        const data = await this.fetchOpenAQCountryData(code);
        if (data) {
          results[code] = data;
        }

        // Add small delay between requests to respect rate limits
        if (i < countryCodes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.warn(`Failed to fetch data for ${code}:`, error);
      }
    }

    return results;
  }

  /**
   * Update real-time data in policy impact data
   * @param {Object} policyData - Policy impact data object
   * @param {Object} realTimeData - Real-time data from API
   */
  updatePolicyDataWithRealTime(policyData, realTimeData) {
    if (!realTimeData) return policyData;

    // Update real-time section
    if (policyData.realTimeData) {
      policyData.realTimeData.currentPM25 = realTimeData.avgPM25;
      policyData.realTimeData.aqi = realTimeData.aqi;
      policyData.realTimeData.aqiLevel = realTimeData.aqiLevel;
      policyData.realTimeData.lastUpdated = realTimeData.lastUpdated;
      policyData.realTimeData.source = realTimeData.source;

      // Update major cities if available
      if (realTimeData.cities && realTimeData.cities.length > 0) {
        const citiesMap = new Map(
          realTimeData.cities.map(c => [c.name.toLowerCase(), c])
        );

        policyData.realTimeData.majorCities.forEach(city => {
          const match = citiesMap.get(city.name.toLowerCase());
          if (match) {
            city.pm25 = match.pm25;
            city.aqi = match.aqi;
            city.aqiLevel = this.getAQILevel(match.aqi);
          }
        });
      }
    }

    return policyData;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AirQualityAPI;
}
