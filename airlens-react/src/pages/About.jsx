import './About.css'

function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        <section className="hero-section">
          <h1 className="about-title">About AirLens</h1>
          <p className="about-lead">
            Interactive global air quality visualization powered by real data
          </p>
        </section>

        <section className="content-section">
          <h2>🌍 Our Mission</h2>
          <p>
            AirLens transforms complex air quality data into an intuitive, beautiful 3D visualization.
            Using official EU Copernicus CAMS data (no API keys required), explore global PM2.5 levels
            in real-time, predict air quality from sky photos using AI, and discover pollution patterns
            across the globe - all on an interactive Earth globe.
          </p>
        </section>

        <section className="content-section">
          <h2>✨ Key Features</h2>
          <div className="feature-grid">
            <div className="feature-item">
              <span className="feature-emoji">✅</span>
              <h3>NO TOKEN REQUIRED</h3>
              <p>Works immediately - no API keys, no registration needed!</p>
            </div>

            <div className="feature-item">
              <span className="feature-emoji">🇪🇺</span>
              <h3>Official EU Data</h3>
              <p>Real-time data from EU Copernicus CAMS (ECMWF)</p>
            </div>

            <div className="feature-item">
              <span className="feature-emoji">🌍</span>
              <h3>3D Globe Visualization</h3>
              <p>174+ cities worldwide with live PM2.5 data</p>
            </div>

            <div className="feature-item">
              <span className="feature-emoji">📸</span>
              <h3>Camera AI</h3>
              <p>Upload sky photos to predict PM2.5 using multimodal AI</p>
            </div>

            <div className="feature-item">
              <span className="feature-emoji">🎨</span>
              <h3>Beautiful Interface</h3>
              <p>Atmospheric particles, color-coded markers, smooth animations</p>
            </div>

            <div className="feature-item">
              <span className="feature-emoji">📱</span>
              <h3>Fully Responsive</h3>
              <p>Works seamlessly on desktop, tablet, and mobile</p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <h2>🛠️ Technology Stack</h2>
          <div className="tech-list">
            <span className="tech-badge">React</span>
            <span className="tech-badge">Three.js</span>
            <span className="tech-badge">React Three Fiber</span>
            <span className="tech-badge">Chart.js</span>
            <span className="tech-badge">Vite</span>
            <span className="tech-badge">React Router</span>
          </div>
        </section>

        <section className="content-section">
          <h2>📧 Contact</h2>
          <p>
            For questions, collaboration, or feedback:
          </p>
          <p className="contact-email">
            📮 joymin5655@gmail.com
          </p>
        </section>

        <section className="content-section">
          <h2>🙏 Acknowledgments</h2>
          <ul className="acknowledgment-list">
            <li><strong>Our World In Data</strong> for air quality data</li>
            <li><strong>Earth.Nullschool</strong> for design inspiration</li>
            <li><strong>Three.js team</strong> for 3D library</li>
            <li><strong>EU Copernicus CAMS</strong> for atmospheric data</li>
          </ul>
        </section>

        <footer className="about-footer">
          <p>Made with ❤️ for cleaner air</p>
          <p className="license">MIT License © 2025 AirLens</p>
        </footer>
      </div>
    </div>
  )
}

export default About
