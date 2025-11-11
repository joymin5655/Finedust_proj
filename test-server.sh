#!/bin/bash
echo "🚀 Starting AirLens Local Test Server..."
echo "📍 URL: http://localhost:8000"
echo "📄 Main page: http://localhost:8000/index.html"
echo "🌍 Globe: http://localhost:8000/globe.html"
echo "📸 Camera AI: http://localhost:8000/camera.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
python3 -m http.server 8000
