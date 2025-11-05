#!/bin/bash

# AirLens Backend & iOS Setup Script
# 백엔드 설치 및 iOS 앱 빌드

echo "================================"
echo "🌍 AirLens Setup Script"
echo "================================"
echo ""

# 1. Python 확인
echo "1️⃣  Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found!"
    echo "   Install: brew install python3"
    exit 1
fi
echo "✅ Python: $(python3 --version)"
echo ""

# 2. 의존성 설치
echo "2️⃣  Installing dependencies..."
pip install fastapi uvicorn -q
echo "✅ FastAPI & Uvicorn installed"
echo ""

# 3. 백엔드 시작
echo "3️⃣  Starting backend server..."
echo "   🚀 Server: http://127.0.0.1:8000"
echo "   📚 Docs: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py
