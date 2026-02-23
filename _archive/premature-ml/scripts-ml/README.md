# AirLens ML Pipeline

ML Spec v1 기반 모델 학습/배포 파이프라인

## Quick Start

```bash
# 1. 의존성 설치
pip install -r scripts/python/ml/requirements.txt

# 2. 기상 데이터 수집 (Open-Meteo, 무료)
python3 scripts/python/ml/fetch_weather_features.py

# 3. 모델 학습
python3 scripts/python/ml/train_pm25_model.py
```

## 파이프라인 구조

```
fetch_weather_features.py
  → app/data/predictions/weather_features.json
  
train_pm25_model.py
  → models/model_v1_rf.pkl           (모델 파일)
  → models/model_metadata.json       (메타데이터)
  → app/data/predictions/grid_latest.json  (예측 그리드 → 프론트엔드)
```

## 모델 사양 (ML Spec §2)

| 항목 | 값 |
|------|---|
| 입력 | temperature, humidity, wind_speed, pressure, lat, lon, month |
| 출력 | predicted_pm25, uncertainty_rmse, coverage_score |
| Baseline | Linear Regression |
| Primary | RandomForest / XGBoost |
| 타깃 R² | ≥ 0.6 |
| 타깃 RMSE | ≤ 9 µg/m³ |

## 향후 계획

- [ ] AOD 피처 추가 (NASA Earthdata)
- [ ] XGBoost / LightGBM 후보 추가
- [ ] 시공간 교차검증 (Spatial holdout)
- [ ] 지역별 보정 테이블
- [ ] ONNX 변환 → 브라우저 추론 (v2.0)
