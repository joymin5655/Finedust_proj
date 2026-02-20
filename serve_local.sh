#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# AirLens 로컬 테스트 서버 실행 스크립트
# Usage: bash serve_local.sh
# ═══════════════════════════════════════════════════════════════

PROJECT_DIR="/Volumes/WD_BLACK SN770M 2TB/My_proj/Finedust_proj"
APP_DIR="$PROJECT_DIR/app"
PORT=8000

echo "🌍 AirLens Local Development Server"
echo "======================================"
echo ""

# ── 데이터 파일 확인 ──────────────────────────────────────────────
echo "📂 Checking sample data files..."
files=(
  "data/waqi/latest.json"
  "data/waqi/global-stations.json"
  "data/openaq/pm25_years.json"
  "data/openaq/pm25_days.json"
  "data/earthdata/aod_samples.json"
  "data/earthdata/aod_trend.json"
  "data/policy-impact/policy_effect_basic.json"
)

all_ok=true
for f in "${files[@]}"; do
  if [ -f "$APP_DIR/$f" ]; then
    echo "  ✅ $f"
  else
    echo "  ❌ MISSING: $f"
    all_ok=false
  fi
done

echo ""

if [ "$all_ok" = false ]; then
  echo "⚠️  Some sample data files are missing."
  echo "   Run the fetch scripts or they will be created by GitHub Actions."
  echo ""
fi

# ── 서버 시작 ────────────────────────────────────────────────────
echo "🚀 Starting HTTP server on port $PORT..."
echo "📍 Serving from: $APP_DIR"
echo ""
echo "Open in browser:"
echo "  Today:  http://localhost:$PORT/index.html"
echo "  Globe:  http://localhost:$PORT/globe.html"
echo "  Policy: http://localhost:$PORT/policy.html"
echo ""
echo "Press Ctrl+C to stop."
echo "======================================"
echo ""

cd "$APP_DIR"
python3 -m http.server $PORT
