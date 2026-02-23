#!/usr/bin/env python3
"""
fetch_weather_features.py — ML 학습용 기상 데이터 수집
────────────────────────────────────────────────────────
ML Spec §2.2 기반: Open-Meteo에서 AOD 모델 피처 수집

필수 피처:
  - temperature (°C)
  - relative_humidity (%)
  - wind_speed (m/s)
  - elevation (m, SRTM)
  - surface_pressure (hPa)

선택 피처:
  - boundary_layer_height (PBLH, m)

출력:
  app/data/predictions/weather_features.json

Usage:
  python3 scripts/python/ml/fetch_weather_features.py

의존성: requests (pip install requests)
"""

import json
import time
from pathlib import Path
from datetime import datetime

try:
    import requests
except ImportError:
    print("❌ requests 패키지 필요: pip install requests")
    exit(1)

ROOT = Path(__file__).resolve().parents[3]
OUT_DIR = ROOT / "app" / "data" / "predictions"
OUT_FILE = OUT_DIR / "weather_features.json"
CITIES_FILE = ROOT / "app" / "data" / "major-cities.json"

# Open-Meteo API (무료, 토큰 불필요)
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


def load_cities():
    """major-cities.json에서 도시 목록 로드"""
    if CITIES_FILE.exists():
        with open(CITIES_FILE) as f:
            return json.load(f)
    
    # 최소 fallback
    return [
        {"name": "Seoul", "lat": 37.5665, "lon": 126.978, "country": "South Korea"},
        {"name": "Beijing", "lat": 39.9042, "lon": 116.4074, "country": "China"},
        {"name": "Delhi", "lat": 28.6139, "lon": 77.209, "country": "India"},
        {"name": "Tokyo", "lat": 35.6762, "lon": 139.6503, "country": "Japan"},
        {"name": "New York", "lat": 40.7128, "lon": -74.006, "country": "United States"},
        {"name": "London", "lat": 51.5074, "lon": -0.1278, "country": "United Kingdom"},
        {"name": "Paris", "lat": 48.8566, "lon": 2.3522, "country": "France"},
        {"name": "Cairo", "lat": 30.0444, "lon": 31.2357, "country": "Egypt"},
        {"name": "São Paulo", "lat": -23.5505, "lon": -46.6333, "country": "Brazil"},
        {"name": "Sydney", "lat": -33.8688, "lon": 151.2093, "country": "Australia"},
    ]


def fetch_weather(lat, lon):
    """Open-Meteo에서 현재 기상 + AQ 데이터 가져오기"""
    # 1. 기상 데이터
    weather_params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure",
        "timezone": "auto",
    }
    
    try:
        r = requests.get(FORECAST_URL, params=weather_params, timeout=10)
        r.raise_for_status()
        weather = r.json().get("current", {})
    except Exception as e:
        print(f"  ⚠️ Weather fetch failed: {e}")
        weather = {}
    
    time.sleep(0.2)  # rate limit 방지
    
    # 2. 대기질 데이터
    aq_params = {
        "latitude": lat,
        "longitude": lon,
        "current": "pm2_5,pm10,us_aqi,european_aqi",
        "timezone": "auto",
    }
    
    try:
        r = requests.get(AIR_QUALITY_URL, params=aq_params, timeout=10)
        r.raise_for_status()
        aq = r.json().get("current", {})
    except Exception as e:
        print(f"  ⚠️ AQ fetch failed: {e}")
        aq = {}
    
    return {
        "temperature": weather.get("temperature_2m"),
        "relative_humidity": weather.get("relative_humidity_2m"),
        "wind_speed": weather.get("wind_speed_10m"),
        "surface_pressure": weather.get("surface_pressure"),
        "pm25": aq.get("pm2_5"),
        "pm10": aq.get("pm10"),
        "us_aqi": aq.get("us_aqi"),
    }


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    cities = load_cities()
    
    print(f"🌤️ Fetching weather features for {len(cities)} cities...")
    
    results = []
    success = 0
    
    for city in cities:
        name = city["name"]
        lat, lon = city["lat"], city["lon"]
        
        print(f"  📍 {name} ({lat:.2f}, {lon:.2f})...", end=" ")
        
        features = fetch_weather(lat, lon)
        
        if features.get("temperature") is not None:
            results.append({
                "city": name,
                "country": city.get("country", ""),
                "lat": lat,
                "lon": lon,
                "month": datetime.now().month,
                "features": features,
                "timestamp": datetime.now().isoformat(),
            })
            success += 1
            print(f"✅ T={features['temperature']}°C PM2.5={features.get('pm25', '?')}")
        else:
            print("❌")
        
        time.sleep(0.3)
    
    output = {
        "generated_at": datetime.now().isoformat(),
        "city_count": len(results),
        "source": "Open-Meteo (EU Copernicus)",
        "features_schema": {
            "temperature": "°C",
            "relative_humidity": "%",
            "wind_speed": "m/s",
            "surface_pressure": "hPa",
            "pm25": "µg/m³ (ground truth)",
            "pm10": "µg/m³",
            "us_aqi": "US EPA AQI",
        },
        "data": results,
    }
    
    with open(OUT_FILE, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Done! {success}/{len(cities)} cities saved to {OUT_FILE}")


if __name__ == "__main__":
    main()
