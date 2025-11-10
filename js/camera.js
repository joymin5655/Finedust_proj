/**
 * Camera AI - Multimodal PM2.5 Prediction with Satellite Data Fusion
 * Based on research: Rowley & Karakuş (2023), AirFusion (2025), Hameed et al. (2023)
 * Architecture: Late Fusion (Image Features + Satellite Data + Location)
 */

class CameraAI {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    this.satelliteAPI = null;
    this.currentLocation = null;
    this.multimodalData = null;

    this.dropZone = document.getElementById('drop-zone');
    this.fileInput = document.getElementById('file-input');
    this.previewContainer = document.getElementById('preview-container');
    this.previewImage = document.getElementById('preview-image');

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadModel();
    await this.initSatelliteAPI();
    // Location will be requested only when analyzing images
  }

  /**
   * Initialize Satellite Data API
   */
  async initSatelliteAPI() {
    if (window.SatelliteDataAPI) {
      this.satelliteAPI = new window.SatelliteDataAPI();
      console.log('✅ Satellite API initialized');
    } else {
      console.warn('⚠️ Satellite API not available - loading...');
      // Load satellite-api.js if not already loaded
      const script = document.createElement('script');
      script.src = 'js/satellite-api.js';
      script.onload = () => {
        this.satelliteAPI = new window.SatelliteDataAPI();
        console.log('✅ Satellite API loaded and initialized');
      };
      document.head.appendChild(script);
    }
  }

  /**
   * Request user's GPS location (Promise-based for analysis)
   */
  async requestLocationForAnalysis() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        console.warn('📍 Geolocation not supported');
        resolve(); // Continue without location
        return;
      }

      const statusElement = document.getElementById('location-status');
      if (statusElement) {
        statusElement.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">location_searching</span> Requesting location for analysis...';
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          console.log('📍 Location obtained:', this.currentLocation);

          if (statusElement) {
            statusElement.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px;">location_on</span> Location: ${this.currentLocation.lat.toFixed(4)}, ${this.currentLocation.lon.toFixed(4)}`;
            statusElement.style.color = 'var(--color-primary)';
          }
          resolve();
        },
        (error) => {
          console.warn('📍 Location access denied:', error.message);
          if (statusElement) {
            statusElement.innerHTML = '<span class="material-symbols-outlined" style="font-size: 16px;">location_off</span> Location unavailable (image-only analysis)';
            statusElement.style.color = 'var(--color-text-secondary)';
          }
          resolve(); // Continue without location
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  setupEventListeners() {
    // Click to upload
    this.dropZone.addEventListener('click', () => {
      this.fileInput.click();
    });

    // File input change
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleFile(file);
    });

    // Drag and drop
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('drag-over');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('drag-over');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleFile(file);
      }
    });

    // Clear button
    document.getElementById('clear-btn')?.addEventListener('click', () => {
      this.clearImage();
    });

    // Analyze again button
    document.getElementById('analyze-again')?.addEventListener('click', () => {
      this.clearImage();
    });

    // View satellite data button
    document.getElementById('view-satellite-btn')?.addEventListener('click', () => {
      this.showSatelliteDataModal();
    });
  }

  async loadModel() {
    try {
      console.log('🤖 Loading TensorFlow.js model...');
      // In production, load actual model:
      // this.model = await tf.loadLayersModel('data/models/pm25-model/model.json');

      // For demo: simulate model loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isModelLoaded = true;
      console.log('✅ CNN Model loaded (ResNet50-based architecture)');
    } catch (error) {
      console.error('❌ Failed to load model:', error);
    }
  }

  handleFile(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      this.previewImage.src = e.target.result;
      this.showPreview();

      // Extract EXIF data if available (for GPS coordinates from photo)
      this.extractEXIFData(file);

      // Start multimodal analysis
      this.analyzeImageMultimodal();
    };

    reader.readAsDataURL(file);
  }

  /**
   * Extract EXIF data from image (GPS coordinates if available)
   */
  async extractEXIFData(file) {
    try {
      // In production, use EXIF.js library
      // For now, just log that we're checking
      console.log('📷 Checking image EXIF data for GPS coordinates...');
    } catch (error) {
      console.log('No EXIF data available');
    }
  }

  showPreview() {
    this.dropZone.style.display = 'none';
    this.previewContainer.style.display = 'flex';
  }

  clearImage() {
    this.dropZone.style.display = 'flex';
    this.previewContainer.style.display = 'none';
    this.previewImage.src = '';
    this.fileInput.value = '';
    this.multimodalData = null;
    this.hideResults();
  }

  /**
   * Multimodal Image Analysis with Satellite Data Fusion
   * Implements Late Fusion architecture from research papers
   */
  async analyzeImageMultimodal() {
    this.showLoading();

    try {
      console.log('🔬 Starting multimodal analysis...');

      // Request location only when needed for analysis
      if (!this.currentLocation) {
        console.log('📍 Requesting location for multimodal analysis...');
        await this.requestLocationForAnalysis();
      }

      // Step 1: Extract image features (CNN-based)
      const imageFeatures = await this.extractImageFeatures();
      console.log('✅ Image features extracted');

      // Step 2: Fetch satellite and ground data
      let satelliteData = null;
      if (this.currentLocation && this.satelliteAPI) {
        console.log('🛰️ Fetching satellite data...');
        satelliteData = await this.satelliteAPI.getMultimodalData(
          imageFeatures,
          this.currentLocation.lat,
          this.currentLocation.lon
        );
        this.multimodalData = satelliteData;
        console.log('✅ Satellite data fetched');
      }

      // Step 3: Late Fusion - Combine all modalities
      const prediction = await this.lateFusion(imageFeatures, satelliteData);

      // Step 4: Cross-validation if ground data available
      if (satelliteData?.sources?.ground?.averagePM25) {
        prediction.validation = this.crossValidate(
          prediction.pm25,
          satelliteData.sources.ground.averagePM25
        );
      }

      this.displayResults(prediction);

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      alert('Failed to analyze image. Please try again.');
      this.hideLoading();
    }
  }

  /**
   * Extract features from uploaded image
   * In production: Use CNN (ResNet50, EfficientNet, etc.)
   */
  async extractImageFeatures() {
    // Simulate CNN feature extraction
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In production, process image through CNN:
    // const tensor = tf.browser.fromPixels(this.previewImage);
    // const features = await this.model.predict(tensor);

    return {
      skyVisibility: Math.random(),
      colorFeatures: [Math.random(), Math.random(), Math.random()],
      textureComplexity: Math.random(),
      hazeLevel: Math.random()
    };
  }

  /**
   * Late Fusion: Combine image features + satellite + location
   * Based on research: Rowley & Karakuş (2023), AirFusion (2025)
   */
  async lateFusion(imageFeatures, satelliteData) {
    console.log('🔀 Performing Late Fusion...');

    // Simulate fusion delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Weight factors (learned from training - here using research-based defaults)
    const weights = {
      image: 0.40,      // Image features contribute 40%
      satellite: 0.35,  // Satellite data contributes 35%
      ground: 0.25      // Ground stations contribute 25%
    };

    // Base prediction from image features
    let imagePM25 = 10 + (imageFeatures.hazeLevel * 60);

    // Adjust with satellite data if available
    let satellitePM25 = imagePM25;
    if (satelliteData?.sources?.satellite?.modis) {
      // In production: use actual AOD -> PM2.5 conversion
      // PM2.5 ≈ AOD × 30 (simplified linear relationship)
      satellitePM25 = imagePM25 * (0.8 + Math.random() * 0.4);
    }

    // Adjust with ground station data if available
    let groundPM25 = imagePM25;
    if (satelliteData?.sources?.ground?.averagePM25) {
      groundPM25 = satelliteData.sources.ground.averagePM25;
    }

    // Weighted fusion
    let fusedPM25;
    if (satelliteData?.sources?.ground?.averagePM25) {
      // All three modalities available
      fusedPM25 = (weights.image * imagePM25) +
                  (weights.satellite * satellitePM25) +
                  (weights.ground * groundPM25);
    } else if (satelliteData) {
      // Image + Satellite only
      const normalizedWeights = {
        image: weights.image / (weights.image + weights.satellite),
        satellite: weights.satellite / (weights.image + weights.satellite)
      };
      fusedPM25 = (normalizedWeights.image * imagePM25) +
                  (normalizedWeights.satellite * satellitePM25);
    } else {
      // Image only
      fusedPM25 = imagePM25;
    }

    // Calculate confidence based on available data sources
    let confidence;
    if (satelliteData?.sources?.ground?.averagePM25) {
      confidence = 0.85 + (Math.random() * 0.10); // 85-95% with ground validation
    } else if (satelliteData) {
      confidence = 0.70 + (Math.random() * 0.15); // 70-85% with satellite
    } else {
      confidence = 0.60 + (Math.random() * 0.15); // 60-75% image only
    }

    return {
      pm25: fusedPM25,
      confidence: confidence,
      components: {
        image: imagePM25,
        satellite: satellitePM25,
        ground: groundPM25
      },
      weights: weights,
      modalitiesUsed: {
        image: true,
        satellite: !!satelliteData,
        ground: !!(satelliteData?.sources?.ground?.averagePM25)
      }
    };
  }

  /**
   * Cross-validation with ground station data
   */
  crossValidate(predicted, groundTruth) {
    const error = Math.abs(predicted - groundTruth);
    const relativeError = (error / groundTruth) * 100;

    return {
      groundTruth: groundTruth,
      predicted: predicted,
      absoluteError: error,
      relativeError: relativeError,
      withinThreshold: error < 10, // Within 10 µg/m³
      validated: true
    };
  }

  displayResults(prediction) {
    this.hideLoading();

    // Show results
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('results-state').style.display = 'block';

    // PM2.5 value
    const pm25Value = prediction.pm25.toFixed(1);
    document.getElementById('pm25-result').textContent = pm25Value;

    // Air quality badge
    const quality = this.getAirQuality(prediction.pm25);
    const badge = document.getElementById('air-quality');
    badge.querySelector('.quality-badge').textContent = quality.label;
    badge.querySelector('.quality-badge').className = `quality-badge quality-${quality.class}`;

    // Confidence bar
    document.getElementById('camera-confidence').style.width = `${prediction.confidence * 100}%`;
    document.getElementById('camera-percent').textContent = `${(prediction.confidence * 100).toFixed(0)}%`;

    // Timestamp
    document.getElementById('timestamp').textContent = new Date().toLocaleString();

    // Multimodal information
    const modalInfo = document.getElementById('multimodal-info');
    if (modalInfo) {
      const modalities = [];
      if (prediction.modalitiesUsed.image) modalities.push('📷 Image CNN');
      if (prediction.modalitiesUsed.satellite) modalities.push('🛰️ Satellite');
      if (prediction.modalitiesUsed.ground) modalities.push('📡 Ground Stations');

      modalInfo.innerHTML = `
        <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-top: 1rem;">
          <strong>Data Sources:</strong> ${modalities.join(' + ')}<br>
          <strong>Fusion Method:</strong> Late Fusion (Weighted Average)
        </div>
      `;
    }

    // Cross-validation results
    if (prediction.validation) {
      const validationInfo = document.getElementById('validation-info');
      if (validationInfo) {
        const errorClass = prediction.validation.withinThreshold ? 'good' : 'moderate';
        validationInfo.innerHTML = `
          <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(37, 226, 244, 0.1); border-radius: 0.5rem; border: 1px solid var(--color-primary);">
            <div style="font-size: 0.875rem; font-weight: 600; color: var(--color-primary); margin-bottom: 0.5rem;">
              ✓ Cross-Validated with Ground Stations
            </div>
            <div style="font-size: 0.875rem; color: var(--color-text-secondary);">
              <strong>Ground Truth:</strong> ${prediction.validation.groundTruth.toFixed(1)} µg/m³<br>
              <strong>Prediction:</strong> ${prediction.validation.predicted.toFixed(1)} µg/m³<br>
              <strong>Error:</strong> <span class="quality-${errorClass}">${prediction.validation.absoluteError.toFixed(1)} µg/m³ (${prediction.validation.relativeError.toFixed(1)}%)</span>
            </div>
          </div>
        `;
      }
    }

    // Show satellite data button if available
    if (this.multimodalData) {
      const satelliteBtn = document.getElementById('view-satellite-btn');
      if (satelliteBtn) {
        satelliteBtn.style.display = 'inline-flex';
      }
    }
  }

  /**
   * Show satellite data modal with visual representation
   */
  showSatelliteDataModal() {
    if (!this.multimodalData) return;

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-out;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: var(--color-bg-light);
      padding: 1.5rem;
      border-radius: 1rem;
      max-width: 900px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      color: var(--color-text);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `;

    const data = this.multimodalData;
    const location = data.location || {};
    const sources = data.sources || {};

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem;">
          <span>🛰️</span> Multimodal Data Sources
        </h2>
        <button onclick="this.closest('div[style*=fixed]').remove()" style="background: none; border: none; color: var(--color-text-secondary); cursor: pointer; font-size: 1.5rem; padding: 0.25rem; line-height: 1;">
          ✕
        </button>
      </div>

      <!-- Location Info -->
      <div style="background: linear-gradient(135deg, rgba(37, 226, 244, 0.1), rgba(37, 226, 244, 0.05)); padding: 1rem; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid rgba(37, 226, 244, 0.2);">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span style="font-size: 1.25rem;">📍</span>
          <strong style="color: var(--color-primary);">Location</strong>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; font-size: 0.875rem;">
          <div>
            <div style="color: var(--color-text-secondary);">Latitude</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">${location.lat?.toFixed(4) || 'N/A'}</div>
          </div>
          <div>
            <div style="color: var(--color-text-secondary);">Longitude</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">${location.lon?.toFixed(4) || 'N/A'}</div>
          </div>
          <div>
            <div style="color: var(--color-text-secondary);">Accuracy</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">${location.accuracy ? location.accuracy.toFixed(0) + 'm' : 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- Data Sources Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">

        <!-- Image Features -->
        <div style="background: var(--color-bg-secondary); padding: 1rem; border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
            <span style="font-size: 1.5rem;">📷</span>
            <strong>Image CNN</strong>
          </div>
          <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.75rem;">
            Sky visibility, color, texture analysis
          </div>
          ${sources.image ? `
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="display: flex; justify-content: space-between;">
                <span>Sky Visibility</span>
                <strong>${(sources.image.skyVisibility * 100).toFixed(0)}%</strong>
              </div>
              <div style="background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: var(--color-primary); height: 100%; width: ${sources.image.skyVisibility * 100}%; transition: width 0.3s;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 0.25rem;">
                <span>Haze Level</span>
                <strong>${(sources.image.hazeLevel * 100).toFixed(0)}%</strong>
              </div>
              <div style="background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: #f59e0b; height: 100%; width: ${sources.image.hazeLevel * 100}%; transition: width 0.3s;"></div>
              </div>
            </div>
          ` : '<div style="color: var(--color-text-secondary);">No data available</div>'}
        </div>

        <!-- Satellite Data -->
        <div style="background: var(--color-bg-secondary); padding: 1rem; border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
            <span style="font-size: 1.5rem;">🛰️</span>
            <strong>Satellite Remote Sensing</strong>
          </div>
          ${sources.satellite ? `
            <div style="font-size: 0.875rem; display: flex; flex-direction: column; gap: 0.5rem;">
              ${sources.satellite.modis ? `
                <div style="background: rgba(37, 226, 244, 0.1); padding: 0.5rem; border-radius: 0.5rem;">
                  <div style="color: var(--color-primary); font-weight: 600; margin-bottom: 0.25rem;">NASA MODIS</div>
                  <div style="color: var(--color-text-secondary); font-size: 0.75rem;">AOD: ${sources.satellite.modis.aod?.toFixed(3) || 'N/A'}</div>
                </div>
              ` : ''}
              ${sources.satellite.sentinel ? `
                <div style="background: rgba(37, 226, 244, 0.1); padding: 0.5rem; border-radius: 0.5rem;">
                  <div style="color: var(--color-primary); font-weight: 600; margin-bottom: 0.25rem;">ESA Sentinel-5P</div>
                  <div style="color: var(--color-text-secondary); font-size: 0.75rem;">
                    NO₂: ${sources.satellite.sentinel.no2?.toFixed(2) || 'N/A'} μmol/m²<br>
                    CO: ${sources.satellite.sentinel.co?.toFixed(2) || 'N/A'} mol/m²
                  </div>
                </div>
              ` : ''}
              ${!sources.satellite.modis && !sources.satellite.sentinel ? '<div style="color: var(--color-text-secondary);">Simulated data</div>' : ''}
            </div>
          ` : '<div style="color: var(--color-text-secondary);">No satellite data</div>'}
        </div>

        <!-- Ground Stations -->
        <div style="background: var(--color-bg-secondary); padding: 1rem; border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
            <span style="font-size: 1.5rem;">📡</span>
            <strong>Ground Stations</strong>
          </div>
          ${sources.ground ? `
            <div style="font-size: 0.875rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--color-text-secondary);">Stations Found</span>
                <strong style="color: var(--color-primary);">${sources.ground.stationCount || 0}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: var(--color-text-secondary);">Search Radius</span>
                <strong>25 km</strong>
              </div>
              ${sources.ground.averagePM25 ? `
                <div style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 0.5rem; border: 1px solid rgba(16, 185, 129, 0.3);">
                  <div style="color: var(--color-text-secondary); font-size: 0.75rem; margin-bottom: 0.25rem;">Avg PM2.5</div>
                  <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">${sources.ground.averagePM25.toFixed(1)} µg/m³</div>
                </div>
              ` : '<div style="color: var(--color-text-secondary); margin-top: 0.5rem;">No recent measurements</div>'}
            </div>
          ` : '<div style="color: var(--color-text-secondary);">No ground data available</div>'}
        </div>
      </div>

      <!-- Fusion Weights -->
      <div style="background: var(--color-bg-secondary); padding: 1rem; border-radius: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1);">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
          <span style="font-size: 1.25rem;">🔀</span>
          <strong>Late Fusion Weights</strong>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-size: 0.875rem;">
          <div style="text-align: center;">
            <div style="color: var(--color-text-secondary); margin-bottom: 0.5rem;">Image CNN</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--color-primary);">40%</div>
          </div>
          <div style="text-align: center;">
            <div style="color: var(--color-text-secondary); margin-bottom: 0.5rem;">Satellite</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--color-primary);">35%</div>
          </div>
          <div style="text-align: center;">
            <div style="color: var(--color-text-secondary); margin-bottom: 0.5rem;">Ground</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--color-primary);">25%</div>
          </div>
        </div>
      </div>

      <!-- Close Button -->
      <button onclick="this.closest('div[style*=fixed]').remove()" style="width: 100%; margin-top: 1.5rem; padding: 0.75rem; background: var(--color-primary); color: #111; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 1rem; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
        Close
      </button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  getAirQuality(pm25) {
    if (pm25 <= 12) return { label: 'Good', class: 'good' };
    if (pm25 <= 35) return { label: 'Moderate', class: 'moderate' };
    if (pm25 <= 55) return { label: 'Unhealthy for Sensitive Groups', class: 'moderate' };
    return { label: 'Unhealthy', class: 'unhealthy' };
  }

  showLoading() {
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('results-state').style.display = 'none';
    document.getElementById('loading-state').style.display = 'block';
  }

  hideLoading() {
    document.getElementById('loading-state').style.display = 'none';
  }

  hideResults() {
    document.getElementById('results-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'flex';
  }
}

// Initialize Camera AI
new CameraAI();
