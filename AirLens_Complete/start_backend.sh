#!/bin/bash

# AirLens Backend Start Script
# Created on 2025-11-06

echo "🚀 Starting AirLens Backend Server..."
echo "=================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3.9 or later"
    exit 1
fi

# Navigate to Backend directory
cd "$(dirname "$0")/Backend" || exit 1

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install/Update dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt --quiet

# Start the server
echo "✅ Starting FastAPI server..."
echo "=================================="
echo "🌐 Server URL: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/health"
echo "=================================="
echo "Press Ctrl+C to stop the server"
echo ""

# Run the server
python main.py