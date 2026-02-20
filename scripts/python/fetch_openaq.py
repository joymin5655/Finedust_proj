#!/usr/bin/env python3
"""
fetch_openaq.py — OpenAQ v3 PM2.5 timeseries collector
-------------------------------------------------------
GitHub Actions에서 OPENAQ_API_KEY 시크릿을 사용해 실행
결과물:
  app/data/openaq/pm25_years.json   — 국가/도시별 연평균
  app/data/openaq/pm25_days.json    — 최근 365일 일평균
  app/data/openaq/stations.json     — 측정소 메타

Usage:
  OPENAQ_API_KEY=xxx python3 scripts/python/fetch_openaq.py
"""

import os, json, time, sys
from pathlib import Path
from datetime import datetime, timedelta

try:
    import requests
except ImportError:
    print("requests not installed. Run: pip install requests")
    sys.exit(1)

# ── 설정 ──────────────────────────────────────────────────────────────
API_KEY = os.environ.get("OPENAQ_API_KEY", "").strip()
if not API_KEY:
    print("❌ OPENAQ_API_KEY not set")
    sys.exit(1)

BASE_URL = "https://api.openaq.org"
HEADERS  = {"X-API-Key": API_KEY, "Accept": "application/json"}
OUT_DIR  = Path(__file__).resolve().parents[2] / "app" / "data" / "openaq"

# ── 수집 대상 도시 (location id 는 API로 조회) ──────────────────────
TARGET_CITIES = [
    {"city": "Seoul",        "country": "KR"},
    {"city": "Busan",        "country": "KR"},
    {"city": "Incheon",      "country": "KR"},
    {"city": "Beijing",      "country": "CN"},
    {"city": "Shanghai",     "country": "CN"},
    {"city": "Tokyo",        "country": "JP"},
    {"city": "Osaka",        "country": "JP"},
    {"city": "Delhi",        "country": "IN"},
    {"city": "Mumbai",       "country": "IN"},
    {"city": "Bangkok",      "country": "TH"},
    {"city": "Singapore",    "country": "SG"},
    {"city": "Taipei",       "country": "TW"},
    {"city": "Jakarta",      "country": "ID"},
    {"city": "London",       "country": "GB"},
    {"city": "Paris",        "country": "FR"},
    {"city": "Berlin",       "country": "DE"},
    {"city": "Madrid",       "country": "ES"},
    {"city": "Warsaw",       "country": "PL"},
    {"city": "New York",     "country": "US"},
    {"city": "Los Angeles",  "country": "US"},
    {"city": "Chicago",      "country": "US"},
    {"city": "Toronto",      "country": "CA"},
    {"city": "Sao Paulo",    "country": "BR"},
    {"city": "Cairo",        "country": "EG"},
    {"city": "Nairobi",      "country": "KE"},
    {"city": "Sydney",       "country": "AU"},
    {"city": "Melbourne",    "country": "AU"},
]

SLEEP_SEC = 0.5   # API rate limit 방지


def get_json(url, params=None, retries=3):
    """GET 요청 + 재시도"""
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, params=params, timeout=30)
            if r.status_code == 429:
                wait = 10 * (attempt + 1)
                print(f"  ⏳ Rate limited, waiting {wait}s...")
                time.sleep(wait)
                continue
            r.raise_for_status()
            return r.json()
        except requests.RequestException as e:
            print(f"  ⚠️  Attempt {attempt+1} failed: {e}")
            time.sleep(2)
    return None


def find_pm25_sensor(city_name, country_code):
    """도시에서 PM2.5 센서 ID 찾기"""
    url = f"{BASE_URL}/v3/locations"
    params = {
        "city": city_name,
        "country_id": country_code,
        "limit": 10,
        "order_by": "lastUpdated",
        "sort_order": "desc"
    }
    data = get_json(url, params)
    if not data or "results" not in data:
        return None, None

    for loc in data["results"]:
        for sensor in loc.get("sensors", []):
            param = sensor.get("parameter", {})
            if param.get("name") == "pm25" or param.get("displayName") == "PM2.5":
                return loc["id"], sensor["id"]
    return None, None


def fetch_sensor_years(sensor_id):
    """센서별 연평균 데이터"""
    url = f"{BASE_URL}/v3/sensors/{sensor_id}/years"
    params = {"limit": 10}
    data = get_json(url, params)
    if not data:
        return []
    return [
        {
            "year": r.get("period", {}).get("datetimeFrom", {}).get("local", "")[:4],
            "avg":  round(r.get("summary", {}).get("mean", 0), 2),
            "min":  round(r.get("summary", {}).get("min", 0), 2),
            "max":  round(r.get("summary", {}).get("max", 0), 2),
        }
        for r in data.get("results", [])
        if r.get("summary", {}).get("mean")
    ]


def fetch_sensor_days(sensor_id, days=90):
    """센서별 일평균 데이터 (최근 N일)"""
    date_to = datetime.utcnow()
    date_from = date_to - timedelta(days=days)
    url = f"{BASE_URL}/v3/sensors/{sensor_id}/days"
    params = {
        "limit": days,
        "date_from": date_from.strftime("%Y-%m-%dT00:00:00Z"),
        "date_to":   date_to.strftime("%Y-%m-%dT00:00:00Z"),
    }
    data = get_json(url, params)
    if not data:
        return []
    return [
        {
            "date": r.get("period", {}).get("datetimeFrom", {}).get("local", "")[:10],
            "avg":  round(r.get("summary", {}).get("mean", 0), 2),
        }
        for r in data.get("results", [])
        if r.get("summary", {}).get("mean")
    ]


def main():
    print("🌍 OpenAQ PM2.5 Data Collector")
    print("=" * 50)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    years_out   = []
    days_out    = []
    stations_out = []
    ok = fail = 0

    for target in TARGET_CITIES:
        city    = target["city"]
        country = target["country"]
        print(f"\n📍 {city} ({country})...")

        loc_id, sensor_id = find_pm25_sensor(city, country)
        if not sensor_id:
            print(f"  ❌ No PM2.5 sensor found")
            fail += 1
            time.sleep(SLEEP_SEC)
            continue

        print(f"  ✅ sensor_id={sensor_id}")
        stations_out.append({
            "city": city, "country": country,
            "location_id": loc_id, "sensor_id": sensor_id
        })

        # 연평균
        year_data = fetch_sensor_years(sensor_id)
        if year_data:
            years_out.append({
                "city": city, "country": country,
                "sensor_id": sensor_id,
                "data": year_data
            })
            print(f"  📅 {len(year_data)} years of data")
        time.sleep(SLEEP_SEC)

        # 일평균
        day_data = fetch_sensor_days(sensor_id, 90)
        if day_data:
            days_out.append({
                "city": city, "country": country,
                "sensor_id": sensor_id,
                "data": day_data
            })
            print(f"  📅 {len(day_data)} days of data")
        time.sleep(SLEEP_SEC)

        ok += 1

    # ── 저장 ──────────────────────────────────────────────────────────
    ts = datetime.utcnow().isoformat() + "Z"

    (OUT_DIR / "pm25_years.json").write_text(
        json.dumps({"updated_at": ts, "count": len(years_out), "data": years_out},
                   ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n💾 Saved pm25_years.json ({len(years_out)} cities)")

    (OUT_DIR / "pm25_days.json").write_text(
        json.dumps({"updated_at": ts, "count": len(days_out), "data": days_out},
                   ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"💾 Saved pm25_days.json ({len(days_out)} cities)")

    (OUT_DIR / "stations.json").write_text(
        json.dumps({"updated_at": ts, "count": len(stations_out), "stations": stations_out},
                   ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"💾 Saved stations.json ({len(stations_out)} entries)")

    print(f"\n✅ Done — {ok} cities OK, {fail} failed")


if __name__ == "__main__":
    main()
