# app/models/ — 배포용 ML 모델 아티팩트

로컬에서 학습 완료된 모델을 이 폴더에 복사하면 GitHub Pages를 통해 서비스에 제공됩니다.

## 구조

```
models/
├── v1/                     현재 버전
│   ├── model_metadata.json 모델 메타데이터 (버전, 성능, 피처 목록)
│   ├── coefficients.json   경량 모델 계수 (브라우저 추론용)
│   ├── *.onnx              ONNX 모델 (Camera AI 등)
│   └── predictions/        사전 생성된 예측 결과 JSON
├── README.md
```

## 워크플로우

1. `local-models/`에서 학습 및 실험
2. 최종 모델을 `app/models/v1/`에 복사
3. `model_metadata.json` 업데이트
4. git push → GitHub Pages 배포

## 파일 크기 제한

- JSON 계수/메타데이터: 제한 없음
- ONNX 모델: **50MB 이하** 권장 (GitHub 제한)
- 대용량 모델은 GitHub Releases 또는 외부 스토리지 사용

## model_metadata.json 스키마

```json
{
  "version": "v1.0.0",
  "model_type": "quantile_xgboost",
  "target": "pm25",
  "features": ["aod", "temperature", "humidity", "wind_speed", "elevation", "month"],
  "metrics": { "r2": 0.65, "rmse": 8.2, "mae": 5.1 },
  "training_date": "2026-03-01",
  "training_samples": 50000,
  "spatial_coverage": "global",
  "notes": ""
}
```
