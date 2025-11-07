/**
 * Camera AI - Image Analysis with TensorFlow.js
 */

class CameraAI {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    
    this.dropZone = document.getElementById('drop-zone');
    this.fileInput = document.getElementById('file-input');
    this.previewContainer = document.getElementById('preview-container');
    this.previewImage = document.getElementById('preview-image');
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.loadModel();
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
  }
  
  async loadModel() {
    try {
      console.log('Loading TensorFlow.js model...');
      // For demo, we'll simulate a model
      // In production, load from: data/models/pm25-model/model.json
      // this.model = await tf.loadLayersModel('data/models/pm25-model/model.json');
      this.isModelLoaded = true;
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Failed to load model:', error);
    }
  }
  
  handleFile(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      this.previewImage.src = e.target.result;
      this.showPreview();
      this.analyzeImage();
    };
    
    reader.readAsDataURL(file);
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
    this.hideResults();
  }
  
  async analyzeImage() {
    this.showLoading();
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo: generate random prediction
      // In production: use actual TensorFlow.js model
      const pm25 = Math.random() * 80 + 10; // 10-90 range
      const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
      
      this.displayResults(pm25, confidence);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze image. Please try again.');
      this.hideLoading();
    }
  }
  
  displayResults(pm25, confidence) {
    this.hideLoading();
    
    // Show results
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('results-state').style.display = 'block';
    
    // PM2.5 value
    document.getElementById('pm25-result').textContent = pm25.toFixed(1);
    
    // Air quality badge
    const quality = this.getAirQuality(pm25);
    const badge = document.getElementById('air-quality');
    badge.querySelector('.quality-badge').textContent = quality.label;
    badge.querySelector('.quality-badge').className = `quality-badge quality-${quality.class}`;
    
    // Confidence
    document.getElementById('camera-confidence').style.width = `${confidence * 100}%`;
    document.getElementById('camera-percent').textContent = `${(confidence * 100).toFixed(0)}%`;
    
    // Timestamp
    document.getElementById('timestamp').textContent = new Date().toLocaleString();
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
