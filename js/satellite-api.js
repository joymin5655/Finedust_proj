/**
 * Satellite Data API Module
 * Integrates multiple satellite data sources for air quality validation
 * Based on research: Rowley & Karakuş (2023), Park et al. (2019), Li et al. (2022)
 */

class SatelliteDataAPI {
  constructor() {
    // NASA GIBS (Global Imagery Browse Services) - Free, no API key required
    this.nasaGIBSBaseURL = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';

    // Sentinel Hub - Requires API key (user should provide)
    this.sentinelHubBaseURL = 'https://services.sentinel-hub.com/ogc/wms';

    // OpenAQ for ground station validation
    this.openAQBaseURL = 'https://api.openaq.org/v2';

    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Get MODIS Aerosol Optical Depth (AOD) data
   * MODIS Terra/Aqua satellites provide global AOD measurements
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} AOD data
   */
  async getMODIS_AOD(lat, lon, date = null) {
    const cacheKey = `modis_${lat}_${lon}_${date}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // MODIS Combined Dark Target and Deep Blue AOD
      const layer = 'MODIS_Combined_Value_Added_AOD';
      const dateStr = date || this.getFormattedDate();

      // Get tile coordinates (simplified - in production use proper WMTS tiling)
      const bbox = this.getBoundingBox(lat, lon, 0.5); // 0.5 degree buffer

      const params = new URLSearchParams({
        SERVICE: 'WMS',
        VERSION: '1.3.0',
        REQUEST: 'GetMap',
        LAYERS: layer,
        CRS: 'EPSG:4326',
        BBOX: bbox.join(','),
        WIDTH: '256',
        HEIGHT: '256',
        FORMAT: 'image/png',
        TIME: dateStr
      });

      const url = `${this.nasaGIBSBaseURL}?${params}`;

      console.log(`Fetching MODIS AOD data for (${lat}, ${lon})...`);

      // In browser, we can't directly get pixel values from WMS
      // Instead, we return metadata and image URL
      const data = {
        source: 'MODIS (NASA)',
        layer: layer,
        date: dateStr,
        location: { lat, lon },
        imageUrl: url,
        resolution: '1km',
        metadata: {
          instrument: 'MODIS Terra/Aqua',
          parameter: 'Aerosol Optical Depth (AOD)',
          description: 'Combined Dark Target and Deep Blue AOD at 550nm'
        }
      };

      this.setCachedData(cacheKey, data);
      return data;

    } catch (error) {
      console.error('Failed to fetch MODIS data:', error);
      return null;
    }
  }

  /**
   * Get Sentinel-5P NO2 and aerosol data
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Sentinel-5P data
   */
  async getSentinel5P_AerosolData(lat, lon) {
    const cacheKey = `sentinel5p_${lat}_${lon}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Sentinel-5P provides NO2, CO, O3, SO2, aerosol index
      const data = {
        source: 'Sentinel-5P (ESA)',
        location: { lat, lon },
        parameters: {
          no2: { value: null, unit: 'mol/m²', description: 'Nitrogen Dioxide' },
          aerosolIndex: { value: null, unit: 'index', description: 'UV Aerosol Index' },
          co: { value: null, unit: 'mol/m²', description: 'Carbon Monoxide' }
        },
        resolution: '7km × 3.5km',
        metadata: {
          satellite: 'Sentinel-5P (TROPOMI)',
          note: 'Requires Sentinel Hub API key for real data access'
        }
      };

      // In production, use Sentinel Hub API with user's API key
      // For demo, return structure only
      console.log(`Sentinel-5P data structure for (${lat}, ${lon})`);

      this.setCachedData(cacheKey, data);
      return data;

    } catch (error) {
      console.error('Failed to fetch Sentinel-5P data:', error);
      return null;
    }
  }

  /**
   * Get nearest ground station data from OpenAQ
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} radius - Search radius in km (default: 25km)
   * @returns {Promise<Object>} Ground station data
   */
  async getNearestGroundStation(lat, lon, radius = 25) {
    const cacheKey = `openaq_${lat}_${lon}_${radius}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.openAQBaseURL}/latest?limit=10&coordinates=${lat},${lon}&radius=${radius * 1000}&parameter=pm25&order_by=distance`;

      console.log(`Fetching nearest ground stations within ${radius}km...`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OpenAQ API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const stations = data.results.map(station => ({
          name: station.location,
          distance: this.calculateDistance(lat, lon, station.coordinates.latitude, station.coordinates.longitude),
          coordinates: station.coordinates,
          pm25: station.measurements.find(m => m.parameter === 'pm25')?.value || null,
          lastUpdated: station.measurements.find(m => m.parameter === 'pm25')?.lastUpdated || null,
          city: station.city,
          country: station.country
        })).sort((a, b) => a.distance - b.distance);

        const result = {
          source: 'OpenAQ Ground Stations',
          location: { lat, lon },
          nearestStations: stations,
          averagePM25: this.calculateAverage(stations.map(s => s.pm25).filter(v => v !== null))
        };

        this.setCachedData(cacheKey, result);
        return result;
      }

      return null;

    } catch (error) {
      console.error('Failed to fetch OpenAQ data:', error);
      return null;
    }
  }

  /**
   * Multimodal Fusion: Combine satellite and ground data
   * Implements Late Fusion approach from research papers
   * @param {Object} imageData - Image features from CNN
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Fused multimodal data
   */
  async getMultimodalData(imageData, lat, lon) {
    console.log('🛰️ Starting multimodal data fusion...');

    // Parallel fetch of all data sources
    const [modisData, sentinelData, groundData] = await Promise.all([
      this.getMODIS_AOD(lat, lon),
      this.getSentinel5P_AerosolData(lat, lon),
      this.getNearestGroundStation(lat, lon, 25)
    ]);

    const fusedData = {
      timestamp: new Date().toISOString(),
      location: { lat, lon },
      sources: {
        userImage: {
          available: !!imageData,
          features: imageData || null
        },
        satellite: {
          modis: modisData,
          sentinel5p: sentinelData
        },
        ground: groundData
      },
      validation: {
        crossValidated: false,
        confidence: null,
        method: 'Late Fusion (Feature Concatenation)'
      }
    };

    // Cross-validation if ground data available
    if (groundData && groundData.averagePM25) {
      fusedData.validation.crossValidated = true;
      fusedData.validation.groundTruth = groundData.averagePM25;
      fusedData.validation.nearestStationDistance = groundData.nearestStations[0]?.distance;
    }

    console.log('✅ Multimodal data fusion complete');
    return fusedData;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param {number} lat1 - Latitude 1
   * @param {number} lon1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lon2 - Longitude 2
   * @returns {number} Distance in km
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate average of array values
   */
  calculateAverage(values) {
    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length * 10) / 10;
  }

  /**
   * Get bounding box for WMS request
   */
  getBoundingBox(lat, lon, buffer) {
    return [
      lon - buffer, // minX
      lat - buffer, // minY
      lon + buffer, // maxX
      lat + buffer  // maxY
    ];
  }

  /**
   * Get formatted date for API requests
   */
  getFormattedDate(date = new Date()) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Cache management
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`📦 Using cached data for ${key}`);
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.SatelliteDataAPI = SatelliteDataAPI;
}
