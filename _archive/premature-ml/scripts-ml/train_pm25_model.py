#!/usr/bin/env python3
"""
train_pm25_model.py — AOD + Weather → PM2.5 예측 모델 학습
──────────────────────────────────────────────────────────────
ML Spec v1 §2 기반

모델 후보:
  - Baseline: Multiple Linear Regression
  - Primary: RandomForest / XGBoost
  - Future: LightGBM / Spatio-temporal NN

입력: app/data/predictions/weather_features.json (+ OpenAQ ground truth)
출력: models/model_v1_rf.pkl, models/model_metadata.json

Usage:
  python3 scripts/python/ml/train_pm25_model.py

의존성:
  pip install scikit-learn pandas numpy xgboost
"""

import json
import sys
from pathlib import Path
from datetime import datetime

try:
    import numpy as np
    import pandas as pd
    from sklearn.model_selection import TimeSeriesSplit
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
    import joblib
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("Install: pip install scikit-learn pandas numpy joblib")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[3]
FEATURES_FILE = ROOT / "app" / "data" / "predictions" / "weather_features.json"
OPENAQ_FILE = ROOT / "app" / "data" / "openaq" / "pm25_days.json"
MODEL_DIR = ROOT / "models"
OUTPUT_DIR = ROOT / "app" / "data" / "predictions"

# ML Spec §2.2: 필수 피처
FEATURE_COLS = [
    "temperature",
    "relative_humidity",
    "wind_speed",
    "surface_pressure",
    "lat",
    "lon",
    "month",
]

TARGET_COL = "pm25"

# ML Spec §2.5: 타깃 성능
TARGET_R2 = 0.6
TARGET_RMSE = 9.0


def load_training_data():
    """weather_features.json에서 학습 데이터 구축"""
    if not FEATURES_FILE.exists():
        print(f"❌ {FEATURES_FILE} not found. Run fetch_weather_features.py first.")
        sys.exit(1)
    
    with open(FEATURES_FILE) as f:
        raw = json.load(f)
    
    rows = []
    for entry in raw.get("data", []):
        feat = entry.get("features", {})
        pm25 = feat.get("pm25")
        
        if pm25 is None or pm25 <= 0:
            continue
        
        rows.append({
            "city": entry["city"],
            "country": entry.get("country", ""),
            "lat": entry["lat"],
            "lon": entry["lon"],
            "month": entry.get("month", 1),
            "temperature": feat.get("temperature", 15),
            "relative_humidity": feat.get("relative_humidity", 60),
            "wind_speed": feat.get("wind_speed", 3),
            "surface_pressure": feat.get("surface_pressure", 1013),
            "pm25": pm25,
        })
    
    df = pd.DataFrame(rows)
    print(f"📊 Loaded {len(df)} samples from {df['country'].nunique()} countries")
    print(f"   PM2.5 range: {df['pm25'].min():.1f} – {df['pm25'].max():.1f} µg/m³")
    return df


def train_baseline(X, y):
    """ML Spec §2.4: Baseline — Linear Regression"""
    model = LinearRegression()
    model.fit(X, y)
    pred = model.predict(X)
    
    rmse = np.sqrt(mean_squared_error(y, pred))
    mae = mean_absolute_error(y, pred)
    r2 = r2_score(y, pred)
    
    print(f"\n📈 Baseline (Linear Regression):")
    print(f"   R² = {r2:.4f}  |  RMSE = {rmse:.2f}  |  MAE = {mae:.2f}")
    return model, {"r2": r2, "rmse": rmse, "mae": mae}


def train_random_forest(X, y):
    """ML Spec §2.4: Primary — RandomForest"""
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X, y)
    pred = model.predict(X)
    
    rmse = np.sqrt(mean_squared_error(y, pred))
    mae = mean_absolute_error(y, pred)
    r2 = r2_score(y, pred)
    
    print(f"\n🌲 RandomForest:")
    print(f"   R² = {r2:.4f}  |  RMSE = {rmse:.2f}  |  MAE = {mae:.2f}")
    
    # Feature importance
    importances = dict(zip(FEATURE_COLS, model.feature_importances_))
    sorted_imp = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print(f"   Feature importance:")
    for feat, imp in sorted_imp:
        print(f"     {feat}: {imp:.3f}")
    
    return model, {"r2": r2, "rmse": rmse, "mae": mae, "importances": importances}


def generate_prediction_grid(model, grid_resolution=5):
    """
    예측 그리드 생성 (ML Spec §2.6)
    전 세계를 grid_resolution 도 간격으로 예측
    """
    predictions = []
    month = datetime.now().month
    
    for lat in range(-60, 75, grid_resolution):
        for lon in range(-180, 180, grid_resolution):
            features = pd.DataFrame([{
                "temperature": 15,  # 기본값 (실제로는 기상 데이터 필요)
                "relative_humidity": 60,
                "wind_speed": 3,
                "surface_pressure": 1013,
                "lat": lat,
                "lon": lon,
                "month": month,
            }])
            
            pred = model.predict(features)[0]
            
            predictions.append({
                "lat": lat,
                "lon": lon,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "predicted_pm25": round(max(0, pred), 1),
                "uncertainty_rmse": TARGET_RMSE,
                "coverage_score": 0.5,  # 기본 커버리지
            })
    
    return predictions


def main():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. 데이터 로드
    df = load_training_data()
    
    if len(df) < 10:
        print("⚠️ Not enough data for training. Need at least 10 samples.")
        print("   Run: python3 scripts/python/ml/fetch_weather_features.py")
        sys.exit(1)
    
    X = df[FEATURE_COLS]
    y = df[TARGET_COL]
    
    # 2. Baseline 학습
    lr_model, lr_metrics = train_baseline(X, y)
    
    # 3. RandomForest 학습
    rf_model, rf_metrics = train_random_forest(X, y)
    
    # 4. 최적 모델 선택
    best_model = rf_model if rf_metrics["r2"] >= lr_metrics["r2"] else lr_model
    best_metrics = rf_metrics if rf_metrics["r2"] >= lr_metrics["r2"] else lr_metrics
    best_name = "RandomForest" if rf_metrics["r2"] >= lr_metrics["r2"] else "LinearRegression"
    
    # 5. 모델 저장
    model_path = MODEL_DIR / "model_v1_rf.pkl"
    joblib.dump(best_model, model_path)
    print(f"\n💾 Model saved: {model_path}")
    
    # 6. 메타데이터 저장
    metadata = {
        "model_name": best_name,
        "version": "1.0",
        "trained_at": datetime.now().isoformat(),
        "samples": len(df),
        "features": FEATURE_COLS,
        "target": TARGET_COL,
        "metrics": {k: round(v, 4) if isinstance(v, float) else v for k, v in best_metrics.items()},
        "target_metrics": {"r2": TARGET_R2, "rmse": TARGET_RMSE},
        "meets_target": best_metrics["r2"] >= TARGET_R2 and best_metrics["rmse"] <= TARGET_RMSE,
    }
    
    meta_path = MODEL_DIR / "model_metadata.json"
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"📋 Metadata saved: {meta_path}")
    
    # 7. 예측 그리드 생성
    print("\n🌍 Generating prediction grid...")
    grid = generate_prediction_grid(best_model)
    
    grid_output = {
        "generated_at": datetime.now().isoformat(),
        "model": best_name,
        "model_version": "1.0",
        "grid_resolution_deg": 5,
        "prediction_count": len(grid),
        "predictions": grid,
    }
    
    grid_path = OUTPUT_DIR / "grid_latest.json"
    with open(grid_path, "w") as f:
        json.dump(grid_output, f, indent=2)
    print(f"🗺️ Grid saved: {grid_path} ({len(grid)} points)")
    
    # 8. 결과 요약
    print(f"\n{'='*50}")
    print(f"✅ Training complete!")
    print(f"   Best model: {best_name}")
    print(f"   R² = {best_metrics['r2']:.4f} (target: ≥ {TARGET_R2})")
    print(f"   RMSE = {best_metrics['rmse']:.2f} (target: ≤ {TARGET_RMSE})")
    print(f"   Meets target: {'✅' if metadata['meets_target'] else '❌'}")


if __name__ == "__main__":
    main()
