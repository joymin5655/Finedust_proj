/**
 * Air Quality Analysis Service
 * Simulates air quality analysis without external API dependencies
 */

interface ImageAnalysisResult {
  pm25: number;
  confidence: number;
  analysis: string;
}

interface LocationInfo {
  city: string;
  country: string;
  countryCode: string;
}

/**
 * Analyze image data to estimate PM2.5 levels
 * Uses image brightness and color analysis for estimation
 */
export async function analyzeImageForAirQuality(imageFile: File): Promise<ImageAnalysisResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback to random if canvas fails
          resolve(generateRandomAirQuality());
          return;
        }

        ctx.drawImage(img, 0, 0);

        try {
          // Sample pixels from the image
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;

          let totalBrightness = 0;
          let totalSaturation = 0;
          let blueChannel = 0;
          let sampleCount = 0;

          // Sample every 100th pixel to improve performance
          for (let i = 0; i < pixels.length; i += 400) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // Calculate brightness (0-255)
            const brightness = (r + g + b) / 3;
            totalBrightness += brightness;

            // Calculate saturation
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            totalSaturation += saturation;

            // Blue channel analysis (clear sky = more blue)
            blueChannel += b;

            sampleCount++;
          }

          const avgBrightness = totalBrightness / sampleCount;
          const avgSaturation = totalSaturation / sampleCount;
          const avgBlue = blueChannel / sampleCount;

          // Estimate PM2.5 based on image characteristics
          // Darker, less saturated images = higher pollution
          // Less blue = more haze/pollution

          let estimatedPM25 = 0;

          // Brightness factor (darker = more pollution)
          const brightnessFactor = 1 - (avgBrightness / 255);
          estimatedPM25 += brightnessFactor * 40;

          // Saturation factor (less saturated = more haze)
          const saturationFactor = 1 - avgSaturation;
          estimatedPM25 += saturationFactor * 30;

          // Blue channel factor (less blue = more pollution)
          const blueFactor = 1 - (avgBlue / 255);
          estimatedPM25 += blueFactor * 30;

          // Add some randomness for realism
          estimatedPM25 += (Math.random() - 0.5) * 10;

          // Clamp between reasonable values
          estimatedPM25 = Math.max(5, Math.min(150, estimatedPM25));

          // Calculate confidence based on image quality
          const confidence = Math.min(0.95, 0.6 + (avgSaturation * 0.3));

          // Generate analysis text
          const analysis = generateAnalysisText(estimatedPM25, avgBrightness, avgSaturation);

          resolve({
            pm25: Math.round(estimatedPM25 * 10) / 10,
            confidence: Math.round(confidence * 100) / 100,
            analysis
          });
        } catch (error) {
          // If image analysis fails, return random data
          console.warn('Image analysis failed, using random data:', error);
          resolve(generateRandomAirQuality());
        }
      };

      img.onerror = () => {
        resolve(generateRandomAirQuality());
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve(generateRandomAirQuality());
    };

    reader.readAsDataURL(imageFile);
  });
}

/**
 * Generate random but realistic air quality data
 */
function generateRandomAirQuality(): ImageAnalysisResult {
  // Generate realistic PM2.5 values (most common range: 10-50)
  const pm25 = Math.round((10 + Math.random() * 40 + Math.random() * 30) * 10) / 10;
  const confidence = Math.round((0.7 + Math.random() * 0.25) * 100) / 100;
  const analysis = generateAnalysisText(pm25, 150, 0.5);

  return { pm25, confidence, analysis };
}

/**
 * Generate human-readable analysis text
 */
function generateAnalysisText(pm25: number, brightness: number, saturation: number): string {
  const conditions = [];

  // Sky clarity
  if (brightness > 200) {
    conditions.push('bright sky');
  } else if (brightness > 150) {
    conditions.push('moderately clear sky');
  } else if (brightness > 100) {
    conditions.push('overcast conditions');
  } else {
    conditions.push('dark or heavily overcast sky');
  }

  // Haze/visibility
  if (saturation > 0.6) {
    conditions.push('good visibility');
  } else if (saturation > 0.4) {
    conditions.push('some haze visible');
  } else {
    conditions.push('significant haze present');
  }

  // Air quality assessment
  if (pm25 <= 12) {
    conditions.push('excellent air quality');
  } else if (pm25 <= 35) {
    conditions.push('moderate air quality');
  } else if (pm25 <= 55) {
    conditions.push('reduced air quality');
  } else {
    conditions.push('poor air quality');
  }

  return conditions.join(', ').charAt(0).toUpperCase() + conditions.join(', ').slice(1) + '.';
}

/**
 * Get location information using free reverse geocoding API
 */
export async function getLocationInfo(latitude: number, longitude: number): Promise<LocationInfo> {
  try {
    // Use Nominatim (OpenStreetMap) free reverse geocoding API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
      {
        headers: {
          'User-Agent': 'AirLens-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding API request failed');
    }

    const data = await response.json();

    const address = data.address || {};
    const city = address.city || address.town || address.village || address.county || 'Unknown';
    const country = address.country || 'Unknown';
    const countryCode = (address.country_code || 'un').toUpperCase();

    return { city, country, countryCode };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);

    // Fallback: Use approximate location based on coordinates
    return getApproximateLocation(latitude, longitude);
  }
}

/**
 * Get approximate location based on coordinates
 * Fallback when API is unavailable
 */
function getApproximateLocation(lat: number, lon: number): LocationInfo {
  // Simple continent/region detection based on coordinates
  let region = 'Unknown Region';
  let country = 'Unknown Country';
  let countryCode = 'UN';

  // Very rough geographic regions
  if (lat > 23.5 && lat < 53.5 && lon > -10 && lon < 40) {
    country = 'Europe';
    countryCode = 'EU';
    region = 'Central Europe';
  } else if (lat > 24 && lat < 50 && lon > -125 && lon < -66) {
    country = 'United States';
    countryCode = 'US';
    region = 'USA';
  } else if (lat > 20 && lat < 45 && lon > 100 && lon < 145) {
    country = 'East Asia';
    countryCode = 'EA';
    region = 'East Asia';
  } else if (lat > -35 && lat < 35 && lon > 95 && lon < 155) {
    country = 'Southeast Asia';
    countryCode = 'SEA';
    region = 'Southeast Asia';
  } else if (lat > 33 && lat < 43 && lon > 124 && lon < 132) {
    country = 'South Korea';
    countryCode = 'KR';
    region = 'Seoul Area';
  }

  return {
    city: region,
    country: country,
    countryCode: countryCode
  };
}

/**
 * Simulate station data retrieval
 * Generates realistic PM2.5 values based on typical patterns
 */
export function getStationData(): number {
  const hour = new Date().getHours();

  // Simulate daily patterns: higher pollution in morning and evening
  let basePM25 = 20;

  if (hour >= 7 && hour <= 9) {
    // Morning rush hour
    basePM25 = 30 + Math.random() * 20;
  } else if (hour >= 17 && hour <= 19) {
    // Evening rush hour
    basePM25 = 35 + Math.random() * 25;
  } else if (hour >= 0 && hour <= 5) {
    // Night time - cleaner
    basePM25 = 10 + Math.random() * 15;
  } else {
    // Daytime
    basePM25 = 15 + Math.random() * 25;
  }

  return Math.round(basePM25 * 10) / 10;
}
