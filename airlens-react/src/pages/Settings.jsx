import { useState } from 'react'
import './Settings.css'

function Settings() {
  const [config, setConfig] = useState({
    waqi: { enabled: false, token: '' },
    openweather: { enabled: false, apiKey: '' },
    openaq: { enabled: false, apiKey: '' }
  })

  const handleToggle = (api) => {
    setConfig(prev => ({
      ...prev,
      [api]: { ...prev[api], enabled: !prev[api].enabled }
    }))
  }

  const handleChange = (api, field, value) => {
    setConfig(prev => ({
      ...prev,
      [api]: { ...prev[api], [field]: value }
    }))
  }

  const handleSave = () => {
    localStorage.setItem('apiConfig', JSON.stringify(config))
    alert('Settings saved successfully!')
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">
          Configure optional API sources for enhanced data coverage
        </p>

        <div className="settings-info">
          <p>
            ✅ <strong>Default:</strong> EU Copernicus CAMS data (NO API key required)
          </p>
          <p>
            The application works perfectly without any API keys. Configure additional sources below
            for more comprehensive global coverage.
          </p>
        </div>

        <div className="api-section">
          <div className="api-card">
            <div className="api-header">
              <div>
                <h3>🌍 WAQI (World Air Quality Index)</h3>
                <p className="api-description">
                  11,000+ government monitoring stations worldwide
                </p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.waqi.enabled}
                  onChange={() => handleToggle('waqi')}
                />
                <span className="slider"></span>
              </label>
            </div>

            {config.waqi.enabled && (
              <div className="api-config">
                <label>
                  API Token:
                  <input
                    type="text"
                    placeholder="Enter WAQI token"
                    value={config.waqi.token}
                    onChange={(e) => handleChange('waqi', 'token', e.target.value)}
                  />
                </label>
                <a
                  href="https://aqicn.org/data-platform/token"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-link"
                >
                  Get free token →
                </a>
              </div>
            )}
          </div>

          <div className="api-card">
            <div className="api-header">
              <div>
                <h3>☁️ OpenWeather Air Pollution API</h3>
                <p className="api-description">
                  Global coordinate-based data - 1M free calls/month
                </p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.openweather.enabled}
                  onChange={() => handleToggle('openweather')}
                />
                <span className="slider"></span>
              </label>
            </div>

            {config.openweather.enabled && (
              <div className="api-config">
                <label>
                  API Key:
                  <input
                    type="text"
                    placeholder="Enter OpenWeather API key"
                    value={config.openweather.apiKey}
                    onChange={(e) => handleChange('openweather', 'apiKey', e.target.value)}
                  />
                </label>
                <a
                  href="https://home.openweathermap.org/users/sign_up"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-link"
                >
                  Sign up for free →
                </a>
              </div>
            )}
          </div>

          <div className="api-card">
            <div className="api-header">
              <div>
                <h3>🏭 OpenAQ API v3</h3>
                <p className="api-description">
                  Government official monitoring stations
                </p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={config.openaq.enabled}
                  onChange={() => handleToggle('openaq')}
                />
                <span className="slider"></span>
              </label>
            </div>

            {config.openaq.enabled && (
              <div className="api-config">
                <label>
                  API Key:
                  <input
                    type="text"
                    placeholder="Enter OpenAQ API key"
                    value={config.openaq.apiKey}
                    onChange={(e) => handleChange('openaq', 'apiKey', e.target.value)}
                  />
                </label>
                <a
                  href="https://explore.openaq.org/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-link"
                >
                  Register for free →
                </a>
              </div>
            )}
          </div>
        </div>

        <button onClick={handleSave} className="save-button">
          💾 Save Settings
        </button>
      </div>
    </div>
  )
}

export default Settings
