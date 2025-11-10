/**
 * API Configuration
 *
 * To enable ground station data validation, you need to configure your OpenAQ API key.
 *
 * How to get a FREE OpenAQ API key:
 * 1. Visit https://explore.openaq.org/register
 * 2. Create a free account
 * 3. Generate your API key from your account dashboard
 * 4. Copy your API key below
 *
 * Note: OpenAQ provides free access to air quality data from 30,000+ monitoring stations worldwide
 */

const API_CONFIG = {
  // OpenAQ API Key (required for ground station data)
  // Get your free API key at: https://explore.openaq.org/register
  openaq: {
    apiKey: null, // Replace null with your API key: 'your-api-key-here'
    enabled: false // Set to true after adding your API key
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}
