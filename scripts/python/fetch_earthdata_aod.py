#!/usr/bin/env python3
"""
fetch_earthdata_aod.py — NASA Earthdata AOD sample collector
------------------------------------------------------------
AppEEARS API를 사용해 주요 도시의 MODIS AOD 값을 수집
결과물:
  app/data/earthdata/aod_samples.json  — 도시별 AOD 최근값
  app/data/earthdata/aod_trend.json    — 연도별 AOD 트렌드

Usage:
  EARTHDATA_TOKEN=xxx python3 scripts/python/fetch_earthdata_aod.py

Note: AppEEARS 토큰이 만료된 경우 basic auth로 새 토큰 발급 후 사용
"""

import os, json, time, sys, base64
from pathlib import Path
from datetime import datetime, timedelta

try:
    import requests
except ImportError:
    print("requests not installed. Run: pip install requests")
    sys.exit(1)

# ── 설정 ──────────────────────────────────────────────────────────────
EARTHDATA_TOKEN = os.environ.get("EARTHDATA_TOKEN", "").strip()
EARTHDATA_USER  = os.environ.get("EARTHDATA_USER", "").strip()
EARTHDATA_PASS  = os.environ.get("EARTHDATA_PASS", "").strip()

APPEEARS_BASE = "https://appeears.earthdatacloud.nasa.gov/api"
OUT_DIR = Path(__file__).resolve().parents[2] / "app" / "data" / "earthdata"

# ── 주요 도시 좌표 ─────────────────────────────────────────────────
SAMPLE_CITIES = [
    {"city": "Seoul",         "lat": 37.5665, "lon": 126.9780, "country": "KR"},
    {"city": "Beijing",       "lat": 39.9042, "lon": 116.4074, "country": "CN"},
    {"city": "Delhi",         "lat": 28.6139, "lon":  77.2090, "country": "IN"},
    {"city": "Tokyo",         "lat": 35.6762, "lon": 139.6503, "country": "JP"},
    {"city": "London",        "lat": 51.5074, "lon":  -0.1278, "country": "GB"},
    {"city": "Los Angeles",   "lat": 34.0522, "lon":-118.2437, "country": "US"},
    {"city": "New York",      "lat": 40.7128, "lon": -74.0060, "country": "US"},
    {"city": "Jakarta",       "lat": -6.2088, "lon": 106.8456, "country": "ID"},
    {"city": "Cairo",         "lat": 30.0444, "lon":  31.2357, "country": "EG"},
    {"city": "Sao Paulo",     "lat":-23.5505, "lon": -46.6333, "country": "BR"},
    {"city": "Paris",         "lat": 48.8566, "lon":   2.3522, "country": "FR"},
    {"city": "Berlin",        "lat": 52.5200, "lon":  13.4050, "country": "DE"},
    {"city": "Bangkok",       "lat": 13.7563, "lon": 100.5018, "country": "TH"},
    {"city": "Singapore",     "lat":  1.3521, "lon": 103.8198, "country": "SG"},
    {"city": "Sydney",        "lat":-33.8688, "lon": 151.2093, "country": "AU"},
]

# MODIS MOD08_D3: Optical_Depth_Land_And_Ocean (AOD at 550nm)
# Product + layer (AppEEARS format)
AOD_PRODUCT = "MOD08_D3.061"
AOD_LAYER   = "AOD_550_Dark_Target_Deep_Blue_Combined_Mean"


def get_appeears_token():
    """AppEEARS Bearer 토큰 획득"""
    # 1) 환경변수에서 토큰 직접 사용
    if EARTHDATA_TOKEN:
        return EARTHDATA_TOKEN

    # 2) user/pass로 새 토큰 발급
    if EARTHDATA_USER and EARTHDATA_PASS:
        creds = base64.b64encode(f"{EARTHDATA_USER}:{EARTHDATA_PASS}".encode()).decode()
        r = requests.post(
            f"{APPEEARS_BASE}/login",
            headers={"Authorization": f"Basic {creds}"},
            timeout=30
        )
        if r.status_code == 200:
            token = r.json().get("token")
            print(f"✅ AppEEARS token acquired")
            return token

    print("⚠️  No valid Earthdata credentials. Using static fallback data.")
    return None


def submit_point_task(token, city_name, lat, lon):
    """AppEEARS 포인트 샘플링 태스크 제출"""
    today = datetime.utcnow()
    start = (today - timedelta(days=365)).strftime("%m-%d-%Y")
    end   = today.strftime("%m-%d-%Y")

    payload = {
        "task_type": "point",
        "task_name": f"AirLens_{city_name}_{today.strftime('%Y%m%d')}",
        "params": {
            "dates": [{"startDate": start, "endDate": end}],
            "layers": [{"product": AOD_PRODUCT, "layer": AOD_LAYER}],
            "coordinates": [{"latitude": lat, "longitude": lon, "id": city_name, "category": "air_quality"}],
            "output": {"format": {"type": "geotiff"}, "projection": "native"}
        }
    }

    r = requests.post(
        f"{APPEEARS_BASE}/task",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=payload,
        timeout=30
    )
    if r.status_code == 202:
        return r.json().get("task_id")
    print(f"  ❌ Task submit failed: {r.status_code} {r.text[:100]}")
    return None


def wait_for_task(token, task_id, max_wait=300):
    """태스크 완료 대기 (최대 5분)"""
    start = time.time()
    while time.time() - start < max_wait:
        r = requests.get(
            f"{APPEEARS_BASE}/task/{task_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30
        )
        if r.status_code == 200:
            status = r.json().get("status")
            if status == "done":
                return True
            elif status in ("error", "expired"):
                return False
        time.sleep(10)
    return False


def get_task_result(token, task_id, city_name):
    """태스크 결과에서 CSV 다운로드 → AOD 값 파싱"""
    r = requests.get(
        f"{APPEEARS_BASE}/bundle/{task_id}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=30
    )
    if r.status_code != 200:
        return []

    files = r.json().get("files", [])
    csv_file = next((f for f in files if f["file_name"].endswith(".csv")), None)
    if not csv_file:
        return []

    csv_url = f"{APPEEARS_BASE}/bundle/{task_id}/{csv_file['file_id']}"
    csv_r = requests.get(
        csv_url,
        headers={"Authorization": f"Bearer {token}"},
        timeout=60
    )
    if csv_r.status_code != 200:
        return []

    import io, csv
    reader = csv.DictReader(io.StringIO(csv_r.text))
    results = []
    for row in reader:
        date_str = row.get("Date", "")
        aod_str  = row.get(AOD_LAYER, "")
        try:
            aod_val = float(aod_str)
            if aod_val > 0:
                results.append({"date": date_str, "aod": round(aod_val, 4)})
        except (ValueError, TypeError):
            pass
    return results


def generate_fallback_data():
    """
    AppEEARS 접근 불가 시 정적 참고값 반환
    (실제 MODIS 연구 논문 기반 대략적 AOD 값)
    """
    fallback = {
        "Seoul":        {"aod_annual_avg": 0.32, "trend": "decreasing", "source": "static"},
        "Beijing":      {"aod_annual_avg": 0.58, "trend": "decreasing", "source": "static"},
        "Delhi":        {"aod_annual_avg": 0.72, "trend": "slight_increase", "source": "static"},
        "Tokyo":        {"aod_annual_avg": 0.21, "trend": "stable",    "source": "static"},
        "London":       {"aod_annual_avg": 0.14, "trend": "decreasing","source": "static"},
        "Los Angeles":  {"aod_annual_avg": 0.18, "trend": "decreasing","source": "static"},
        "New York":     {"aod_annual_avg": 0.16, "trend": "decreasing","source": "static"},
        "Jakarta":      {"aod_annual_avg": 0.45, "trend": "increasing", "source": "static"},
        "Cairo":        {"aod_annual_avg": 0.55, "trend": "stable",    "source": "static"},
        "Sao Paulo":    {"aod_annual_avg": 0.25, "trend": "stable",    "source": "static"},
        "Paris":        {"aod_annual_avg": 0.15, "trend": "decreasing","source": "static"},
        "Berlin":       {"aod_annual_avg": 0.16, "trend": "decreasing","source": "static"},
        "Bangkok":      {"aod_annual_avg": 0.48, "trend": "increasing","source": "static"},
        "Singapore":    {"aod_annual_avg": 0.30, "trend": "stable",    "source": "static"},
        "Sydney":       {"aod_annual_avg": 0.10, "trend": "stable",    "source": "static"},
    }
    return fallback


def main():
    print("🛰️  NASA Earthdata AOD Collector")
    print("=" * 50)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    token = get_appeears_token()
    ts    = datetime.utcnow().isoformat() + "Z"

    samples = []
    fallback = generate_fallback_data()

    if token:
        print(f"\n📡 Submitting AppEEARS tasks for {len(SAMPLE_CITIES)} cities...")

        for city_info in SAMPLE_CITIES:
            city = city_info["city"]
            lat  = city_info["lat"]
            lon  = city_info["lon"]
            print(f"  → {city}...", end="", flush=True)

            task_id = submit_point_task(token, city, lat, lon)
            if not task_id:
                fb = fallback.get(city, {})
                samples.append({
                    "city": city, "country": city_info["country"],
                    "lat": lat, "lon": lon,
                    "aod_annual_avg": fb.get("aod_annual_avg"),
                    "trend": fb.get("trend", "unknown"),
                    "source": "static_fallback",
                    "timeseries": []
                })
                print(" ❌ (fallback)")
                continue

            if wait_for_task(token, task_id, max_wait=180):
                ts_data = get_task_result(token, task_id, city)
                avg_aod = (sum(d["aod"] for d in ts_data) / len(ts_data)) if ts_data else None
                samples.append({
                    "city": city, "country": city_info["country"],
                    "lat": lat, "lon": lon,
                    "aod_annual_avg": round(avg_aod, 4) if avg_aod else fallback.get(city, {}).get("aod_annual_avg"),
                    "trend": fallback.get(city, {}).get("trend", "unknown"),
                    "source": "AppEEARS",
                    "timeseries": ts_data[-30:] if ts_data else []  # 최근 30일만 저장
                })
                print(f" ✅ ({len(ts_data)} pts)")
            else:
                fb = fallback.get(city, {})
                samples.append({
                    "city": city, "country": city_info["country"],
                    "lat": lat, "lon": lon,
                    "aod_annual_avg": fb.get("aod_annual_avg"),
                    "trend": fb.get("trend", "unknown"),
                    "source": "static_fallback",
                    "timeseries": []
                })
                print(" ⏰ timeout (fallback)")

            time.sleep(2)

    else:
        # 토큰 없음 → 전체 static fallback
        print("\n⚠️  Using static fallback AOD data (no credentials)")
        for city_info in SAMPLE_CITIES:
            city = city_info["city"]
            fb   = fallback.get(city, {})
            samples.append({
                "city": city, "country": city_info["country"],
                "lat": city_info["lat"], "lon": city_info["lon"],
                "aod_annual_avg": fb.get("aod_annual_avg"),
                "trend": fb.get("trend", "unknown"),
                "source": "static_reference",
                "timeseries": []
            })

    # ── 저장 ──────────────────────────────────────────────────────────
    aod_out = {
        "updated_at": ts,
        "product": AOD_PRODUCT,
        "layer": AOD_LAYER,
        "description": "MODIS Terra AOD at 550nm",
        "count": len(samples),
        "cities": samples
    }

    (OUT_DIR / "aod_samples.json").write_text(
        json.dumps(aod_out, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n💾 Saved aod_samples.json ({len(samples)} cities)")

    # AOD trend summary
    trend_summary = [
        {"city": s["city"], "country": s["country"],
         "lat": s["lat"], "lon": s["lon"],
         "aod": s["aod_annual_avg"], "trend": s["trend"]}
        for s in samples if s.get("aod_annual_avg") is not None
    ]
    (OUT_DIR / "aod_trend.json").write_text(
        json.dumps({"updated_at": ts, "data": trend_summary},
                   ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"💾 Saved aod_trend.json")
    print("\n✅ Earthdata collection complete!")


if __name__ == "__main__":
    main()
