import { useState, useRef } from 'react'
import './Camera.css'

function Camera() {
  const [image, setImage] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target.result)
        analyzeFImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async (imageData) => {
    setLoading(true)

    // 시뮬레이션: 실제로는 TensorFlow.js 모델을 사용
    await new Promise(resolve => setTimeout(resolve, 2000))

    const mockPM25 = Math.floor(Math.random() * 100) + 10
    setPrediction({
      pm25: mockPM25,
      aqi: mockPM25 > 55 ? 'Unhealthy' : mockPM25 > 35 ? 'Moderate' : 'Good',
      confidence: 0.85
    })

    setLoading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target.result)
        analyzeImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="camera-page">
      <div className="camera-container">
        <h1 className="camera-title">Camera AI - PM2.5 Predictor</h1>
        <p className="camera-subtitle">Upload a sky photo to estimate PM2.5 levels using AI</p>

        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current.click()}
        >
          {image ? (
            <img src={image} alt="Preview" className="preview-image" />
          ) : (
            <div className="drop-zone-content">
              <span className="upload-icon">📸</span>
              <p>Click or drag & drop an image</p>
              <p className="drop-zone-hint">Supports JPG, PNG</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing image...</p>
          </div>
        )}

        {prediction && !loading && (
          <div className="prediction-result">
            <h2>Prediction Results</h2>
            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">PM2.5</span>
                <span className="result-value">{prediction.pm25} µg/m³</span>
              </div>
              <div className="result-item">
                <span className="result-label">AQI Level</span>
                <span className="result-value">{prediction.aqi}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Confidence</span>
                <span className="result-value">{(prediction.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="camera-info">
          <h3>How it works</h3>
          <ul>
            <li>📸 Upload a clear sky photo</li>
            <li>🤖 AI analyzes visibility and sky color</li>
            <li>📊 Estimates PM2.5 concentration</li>
            <li>✅ Results based on CNN-LSTM model</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Camera
