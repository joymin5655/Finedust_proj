# 프로젝트 정리 요약 (2026-02-22)

## 수행한 작업

### 1. 깨진 참조 수정
- `enhanced-marker-system.js`: archive에서 `app/js/services/`로 복원 (globe.js 핵심 의존성)
- `config.js`: 4개 HTML에서 존재하지 않는 script 태그 제거
- `pro-features.js`: 2개 HTML에서 존재하지 않는 script 태그 제거

### 2. 미사용 파일 정리 → `_archive/`
- `hero-animation.js` — 어디에서도 참조 안 됨
- `config.template.js` — 어디에서도 참조 안 됨
- `_extract_policies.js` — 루트 레벨 임시 스크립트

### 3. ML 미완성 코드 보존 → `_archive/premature-ml/`
- `app/js/services/predictionService.js`
- `app/js/services/pmService.v2.js`
- `app/js/globe/prediction-layer.js`
- `app/js/globe/globe-data.js`
- `scripts/python/ml/*` (fetch_weather_features, train_pm25_model)
- `app/data/predictions/`
- `.github/workflows/ml_pipeline.yml`

### 4. globe.js 수정
- ML import 3줄 주석 처리 (PredictionService, PredictionLayer, globe-data)
- `this.predictionLayer = null` (기존 guard 조건이 자동으로 skip)

### 5. 빈 디렉토리 정리
- `models/` (빈 폴더) 삭제
- `app/js/globe/` (비어짐) 삭제
- `_archive/legacy-scripts/` (빈 폴더) 삭제
- `_archive/unused-pages/` (빈 폴더) 삭제

### 6. PRD 업데이트
- v2.5(ML) → v2.0(API Integration)으로 조정
- ML 관련 → "향후 계획 (v3.0)" 섹션으로 이동
- 현재 실제 상태에 맞는 아키텍처/파일 구조 반영

## 현재 구조

```
Finedust_proj/
├── .github/workflows/
│   ├── deploy.yml
│   ├── update-waqi-data.yml
│   └── update_airdata.yml
├── app/
│   ├── js/
│   │   ├── utils/          (constants, geo, color, security)
│   │   ├── services/       (data, station, location, camera, pm, ui, waqi, openaq, earthdata, policy/)
│   │   ├── globe.js        (3D Globe 메인)
│   │   ├── today.js        (Today 페이지)
│   │   ├── policy.js       (Policy 페이지)
│   │   └── ...
│   ├── data/               (waqi, openaq, earthdata, policies, policy-impact)
│   ├── css/, assets/, public/
│   └── *.html              (index, globe, policy, camera, about, settings, landing, 404)
├── scripts/
│   ├── fetch-waqi-data.js
│   └── python/             (fetch_openaq, fetch_earthdata_aod, build_policy_effect)
├── _archive/
│   ├── premature-ml/       ★ ML 코드 보존
│   └── duplicate-services/
├── docs/
│   └── PRD.md (v2.0)
└── analysis/
```

## 다음 할 일
- [ ] `git add -A && git commit` 으로 정리 커밋
- [ ] GitHub Pages 배포 확인 (깨진 import 없는지)
- [ ] globe.html 브라우저 테스트
