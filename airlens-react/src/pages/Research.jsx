import './Research.css'

function Research() {
  return (
    <div className="research-page">
      <div className="research-container">
        <h1 className="research-title">Research & Air Quality Policies</h1>

        <section className="research-section">
          <h2>Data Sources</h2>
          <div className="source-grid">
            <div className="source-card">
              <h3>🇪🇺 EU Copernicus CAMS</h3>
              <p>European Centre for Medium-Range Weather Forecasts (ECMWF)</p>
              <p className="source-detail">Real-time atmospheric monitoring via Open-Meteo API</p>
              <span className="badge">No API Key Required</span>
            </div>

            <div className="source-card">
              <h3>🌍 WAQI</h3>
              <p>World Air Quality Index</p>
              <p className="source-detail">11,000+ government monitoring stations worldwide</p>
              <span className="badge">Optional</span>
            </div>

            <div className="source-card">
              <h3>📊 WHO Database</h3>
              <p>World Health Organization</p>
              <p className="source-detail">Global air quality statistics and guidelines</p>
              <span className="badge">Public Data</span>
            </div>
          </div>
        </section>

        <section className="research-section">
          <h2>Key Research</h2>
          <div className="research-list">
            <div className="research-item">
              <h3>Multimodal PM2.5 Prediction</h3>
              <p>Rowley & Karakuş (2023) - Combining satellite data with ground observations for accurate PM2.5 estimation</p>
            </div>

            <div className="research-item">
              <h3>Deep Learning for Air Quality</h3>
              <p>Park et al. (2019) - CNN-LSTM architecture for PM2.5 prediction from sky images</p>
            </div>

            <div className="research-item">
              <h3>Policy Impact Analysis</h3>
              <p>WHO (2021) - Global assessment of air quality policies and their effectiveness in reducing PM2.5 levels</p>
            </div>
          </div>
        </section>

        <section className="research-section">
          <h2>WHO Air Quality Guidelines</h2>
          <div className="guideline-table">
            <div className="guideline-row header">
              <span>AQI Level</span>
              <span>PM2.5 (µg/m³)</span>
              <span>Health Impact</span>
            </div>
            <div className="guideline-row good">
              <span>Good</span>
              <span>0-15</span>
              <span>Little to no risk</span>
            </div>
            <div className="guideline-row moderate">
              <span>Moderate</span>
              <span>15-35</span>
              <span>Acceptable for most</span>
            </div>
            <div className="guideline-row unhealthy-sensitive">
              <span>Unhealthy for Sensitive</span>
              <span>35-55</span>
              <span>Sensitive groups affected</span>
            </div>
            <div className="guideline-row unhealthy">
              <span>Unhealthy</span>
              <span>55-150</span>
              <span>Everyone affected</span>
            </div>
            <div className="guideline-row hazardous">
              <span>Hazardous</span>
              <span>150+</span>
              <span>Health emergency</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Research
