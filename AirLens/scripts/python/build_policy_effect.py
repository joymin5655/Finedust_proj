#!/usr/bin/env python3
"""
build_policy_effect.py — 정책 효과 분석 (OpenAQ 데이터 기반)
------------------------------------------------------------
pm25_years.json를 읽어 정책 전후 평균을 계산
결과물:
  app/data/policy-impact/policy_effect_basic.json

Usage:
  python3 scripts/python/build_policy_effect.py
"""

import json
from pathlib import Path
from datetime import datetime

ROOT    = Path(__file__).resolve().parents[2]
IN_FILE = ROOT / "app" / "data" / "openaq" / "pm25_years.json"
POL_FILE = ROOT / "app" / "data" / "policies.json"
OUT_DIR = ROOT / "app" / "data" / "policy-impact"
OUT_FILE = OUT_DIR / "policy_effect_basic.json"

# ── 주요 정책 연도 (수동 큐레이션) ────────────────────────────────────
POLICY_YEARS = {
    "KR": {"year": 2019, "policy": "Korea Clean Air Action Plan",
           "description": "차량 운행 제한, 석탄화력 감축, 계절관리제 도입"},
    "CN": {"year": 2013, "policy": "Action Plan on Prevention of Air Pollution",
           "description": "PM2.5 농도 25% 감축 목표, 석탄 소비 총량 제한"},
    "IN": {"year": 2019, "policy": "National Clean Air Programme (NCAP)",
           "description": "2024년까지 PM2.5 20~30% 감축 목표"},
    "GB": {"year": 2008, "policy": "Climate Change Act & Air Quality Standards",
           "description": "탄소 예산 법제화, 차량 배출 기준 강화"},
    "US": {"year": 2011, "policy": "Cross-State Air Pollution Rule (CSAPR)",
           "description": "주간 SO2/NOx 배출 감축, PM2.5 개선"},
    "DE": {"year": 2010, "policy": "Federal Immission Control Act revision",
           "description": "EU Air Quality Directive 전국 적용"},
    "FR": {"year": 2015, "policy": "Energy Transition for Green Growth Act",
           "description": "재생에너지 확대, 화석연료 의존도 감축"},
    "JP": {"year": 2013, "policy": "PM2.5 Environmental Standard",
           "description": "PM2.5 환경기준 15/35µg/m³ 설정"},
    "TH": {"year": 2018, "policy": "Thailand National Air Quality Standards",
           "description": "농업 소각 규제, 공장 배출 기준 강화"},
    "AU": {"year": 2015, "policy": "National Clean Air Agreement",
           "description": "주(州) 간 협력 공기질 목표 설정"},
}


def calc_effect(timeseries, policy_year, window=3):
    """정책 연도 기준 전후 window년 평균 비교"""
    before = [d["avg"] for d in timeseries
              if d["year"] and int(d["year"]) < policy_year
              and int(d["year"]) >= policy_year - window and d["avg"] > 0]
    after  = [d["avg"] for d in timeseries
              if d["year"] and int(d["year"]) > policy_year
              and int(d["year"]) <= policy_year + window and d["avg"] > 0]

    if not before or not after:
        return None

    avg_before = round(sum(before) / len(before), 2)
    avg_after  = round(sum(after)  / len(after),  2)
    change_pct = round((avg_after - avg_before) / avg_before * 100, 1) if avg_before else 0

    return {
        "before_avg": avg_before,
        "after_avg":  avg_after,
        "change_pct": change_pct,
        "improved":   change_pct < 0,
        "window_years": window
    }


def main():
    print("📊 Building Policy Effect Analysis...")
    print("=" * 50)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # OpenAQ 연평균 데이터 로드
    if not IN_FILE.exists():
        print(f"⚠️  {IN_FILE} not found. Run fetch_openaq.py first.")
        # 빈 파일 생성
        ts = datetime.utcnow().isoformat() + "Z"
        OUT_FILE.write_text(
            json.dumps({"updated_at": ts, "note": "No OpenAQ data yet", "effects": []},
                       ensure_ascii=False, indent=2), encoding="utf-8"
        )
        return

    pm25_data = json.loads(IN_FILE.read_text(encoding="utf-8"))
    city_data_list = pm25_data.get("data", [])

    # country → list of year data
    country_map = {}
    for entry in city_data_list:
        cc = entry.get("country")
        if not cc:
            continue
        if cc not in country_map:
            country_map[cc] = []
        for yr in entry.get("data", []):
            try:
                y = int(yr.get("year", 0))   # int 보장 (fetch_openaq.py 와 일치)
                a = float(yr.get("avg", 0))
            except (ValueError, TypeError):
                continue
            if y > 0 and a > 0:
                country_map[cc].append({"year": y, "avg": a, "city": entry["city"]})

    # 정책별 효과 계산
    effects = []
    for cc, policy_info in POLICY_YEARS.items():
        ts_data = sorted(country_map.get(cc, []), key=lambda x: x["year"])
        if not ts_data:
            print(f"  ⚠️  {cc}: no data")
            continue

        effect = calc_effect(ts_data, policy_info["year"])
        effects.append({
            "country_code": cc,
            "policy_year":  policy_info["year"],
            "policy_name":  policy_info["policy"],
            "description":  policy_info["description"],
            "effect":       effect,
            "timeseries":   ts_data
        })

        if effect:
            sign = "✅" if effect["improved"] else "⚠️"
            print(f"  {sign} {cc}: {effect['before_avg']} → {effect['after_avg']} µg/m³ ({effect['change_pct']:+.1f}%)")
        else:
            print(f"  ❓ {cc}: insufficient data for comparison")

    ts = datetime.utcnow().isoformat() + "Z"
    result = {
        "updated_at": ts,
        "description": "Policy effect analysis based on OpenAQ PM2.5 annual averages",
        "count": len(effects),
        "effects": effects
    }

    OUT_FILE.write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n💾 Saved policy_effect_basic.json ({len(effects)} countries)")
    print("✅ Done!")


if __name__ == "__main__":
    main()
