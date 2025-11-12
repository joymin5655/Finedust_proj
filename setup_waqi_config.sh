#!/bin/bash

# WAQI Config Generator for Local Development
# This creates config.js for testing before GitHub Actions runs

echo "🔑 WAQI Config Generator"
echo "========================"
echo ""
echo "⚠️  WARNING: This will create a config file with your WAQI API token."
echo "   DO NOT commit this file to Git if it contains a real token!"
echo ""
echo "Your WAQI token: (paste and press Enter)"
read -r WAQI_TOKEN

if [ -z "$WAQI_TOKEN" ]; then
  echo "❌ No token provided. Exiting."
  exit 1
fi

# Create config.js
cat > app/js/config.js << EOF
// WAQI API Configuration
// ⚠️ WARNING: DO NOT COMMIT THIS FILE TO GIT
// This is auto-generated for local development only

const WAQI_CONFIG = {
  token: '${WAQI_TOKEN}',
  baseURL: 'https://api.waqi.info',
  cacheTimeout: 30 * 60 * 1000  // 30 minutes
};

// Log configuration loaded (without exposing token)
if (typeof window !== 'undefined') {
  console.log('✅ WAQI configuration loaded');
  console.log('   Base URL:', WAQI_CONFIG.baseURL);
  console.log('   Cache timeout:', WAQI_CONFIG.cacheTimeout / 1000, 'seconds');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WAQI_CONFIG;
}
EOF

echo ""
echo "✅ config.js created successfully!"
echo ""
echo "📍 Location: app/js/config.js"
echo ""
echo "🚀 Next steps:"
echo "   1. Test your globe page locally"
echo "   2. If it works, run GitHub Actions to generate production config"
echo "   3. Remove this local config.js before committing"
echo ""
echo "🛡️  Security reminder:"
echo "   - config.js is added to .gitignore"
echo "   - GitHub Actions will generate a clean version"
echo "   - Never commit real API tokens to public repositories"
echo ""
