#!/bin/bash

PROJECT_DIR="/Users/joymin/Coding_proj/Finedust_proj/Globe_fd"

echo "========================================="
echo "🚀 AirLens Backend Server"
echo "========================================="
echo ""

# 1. 의존성 확인
echo "1️⃣  Checking dependencies..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found!"
    echo "   Install: brew install python3"
    exit 1
fi

# 2. 패키지 설치
echo "2️⃣  Installing packages..."
pip install -q fastapi uvicorn

# 3. 서버 시작
echo "3️⃣  Starting backend server..."
echo ""
echo "📍 Server: http://127.0.0.1:8000"
echo "📚 Docs:   http://127.0.0.1:8000/docs"
echo "✅ Health: http://127.0.0.1:8000/health"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd "$PROJECT_DIR"
python3 main.py
