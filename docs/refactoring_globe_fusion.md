# AirLens — 리팩토링 완료 보고서 + 최적화 로드맵

**Date:** 2026-02-23  
**Status:** Globe 분할 완료, FusionService 구현 완료

---

## 1. 완료된 작업

### 1.1 Globe.js 분할 (3,131줄 → 6개 모듈)

| 모듈 | 줄 수 | 책임 |
|------|-------|------|
| `globe/globe-core.js` | 227 | 클래스 정의, constructor, init(), animate() |
| `globe/globe-earth.js` | 361 | 지구 텍스처, 대기, 구름, 별, 조명, 국경선 |
| `globe/globe-markers.js` | 150 | 파티클(대기 화살표), PM2.5/정책 마커 |
| `globe/globe-data.js` | 292 | 데이터 로딩 (WAQI, Open-Meteo, 정책, 통계) |
| `globe/globe-ui.js` | 504 | 이벤트, 토글, 검색, 필터, 패널, 모달 |
| `globe/globe-charts.js` | 209 | 차트 렌더링 (트렌드, 상세 모달) |
| **합계** | **1,743** | 원본 3,131줄에서 중복/사용하지 않는 코드 제거 |

**설계 방식:** Mixin 패턴 — 각 모듈이 `mixXxx(Cls)` 함수로 
PolicyGlobe 프로토타입에 메서드를 주입.

**하위 호환성:** `globe.js`는 thin re-export로 유지.
`globe.html`의 `import('./js/globe.js')` 그대로 동작.

**원본 보관:** `_archive/globe-monolith.js`

### 1.2 FusionService 구현 (230줄)

`app/js/services/fusionService.js`

기능:
- WAQI + OpenAQ + AOD 데이터를 단일 Map으로 통합
- 좌표 기반 중복 제거 (소수 2자리 정규화)
- 교차 소스 검증 시 DQSS 보너스
- DQSS-lite 점수 자동 부착 (freshness, 완전성, 소스 수)
- `/api/air-quality` 시뮬레이션 (getAirQuality)
- `/api/country-summary` 시뮬레이션 (getCountrySummary)
- TTL 기반 캐싱 (5분)

---

## 2. 변경된 파일 구조

```
app/js/
├── globe.js              ← thin re-export (16줄)
├── globe/                ★ NEW: 분할된 Globe 모듈
│   ├── globe-core.js     (227줄)
│   ├── globe-earth.js    (361줄)
│   ├── globe-markers.js  (150줄)
│   ├── globe-data.js     (292줄)
│   ├── globe-ui.js       (504줄)
│   └── globe-charts.js   (209줄)
├── services/
│   ├── fusionService.js  ★ NEW (230줄)
│   ├── dataService.js    (기존 유지)
│   └── ... (기존 서비스 유지)

_archive/
├── globe-monolith.js     ★ 원본 백업 (3,131줄)
└── ... (기존 아카이브)
```

---

## 3. 권장 커밋

```bash
git add -A
git commit -m "🔧 Globe 리팩토링 + FusionService 구현

- globe.js 3,131줄 → 6개 모듈로 분할 (mixin 패턴)
  - globe-core.js: 클래스/init/animate
  - globe-earth.js: 지구 렌더링
  - globe-markers.js: 마커/파티클
  - globe-data.js: 데이터 로딩
  - globe-ui.js: 이벤트/UI
  - globe-charts.js: 차트
- fusionService.js: WAQI+OpenAQ+AOD 통합 aggregator
  - DQSS-lite 점수 자동 부착
  - 정적 API 시뮬레이션 (getAirQuality, getCountrySummary)
- 원본 보관: _archive/globe-monolith.js
- 하위 호환성 유지: globe.html import 변경 없음"
```

---

## 4. 최적화 로드맵 (향후 단계)

### Phase 1: 데이터 파이프라인 통합 (Week 1-2)

**목표:** 프론트 중심 구조 → 데이터 중심 구조 전환

```
data_pipeline/              ★ 새로 생성
├── ingestion/
│   ├── fetch_openaq.py     (기존 scripts/ 에서 이동)
│   ├── fetch_waqi.js       
│   └── fetch_earthdata.py  
├── normalization/
│   ├── normalize_pm25.py   (단위 통일, 시간 정규화)
│   └── station_canonicalize.py
├── dqss/
│   ├── compute_dqss.py     (데이터 품질 점수)
│   └── bayesian_reliability.py
├── aggregation/
│   └── build_panel.py      (country_year_panel 생성)
└── policy_merge/
    └── merge_worldbank.py  (GDP, population 통합)
```

**핵심 출력물:**
- `data/processed/country_year_panel.parquet` — DID 분석용 통합 패널
- `data/processed/country_quality_scores.json` — DQSS 점수
- `data/processed/policy_effects_v{date}.json` — DID 결과

### Phase 2: 분석 코어 분리 (Week 2-3)

**문제:** 현재 정책 분석 로직이 프론트엔드(JS)에 존재
**해결:** Python 분석 모듈로 이동, 프론트는 시각화만

```
analysis/
├── policy/
│   ├── did_engine.py           (DID 회귀)
│   ├── event_study.py          (이벤트 스터디)
│   ├── control_selection.py    (대조국 자동 선정)
│   ├── parallel_trend_test.py  (평행 추세 검정)
│   └── dqss_weighting.py       (품질 가중 분석)
├── pm_model/
│   ├── 01_build_dataset.ipynb
│   ├── 02_train_baseline.ipynb
│   └── 03_quantile_xgboost.ipynb
└── outputs/                    (결과 JSON → app/data/에 복사)
```

### Phase 3: 서비스 레이어 재정리 (Week 3)

**현재:** 13개 서비스 파일, 역할 겹침  
**목표:** 5개 핵심 서비스로 통합

```
services/
├── fusionService.js       ✅ 구현 완료 (통합 aggregator)
├── apiClient.js           ★ 새로 생성 (HTTP 공통 레이어)
├── airQualityService.js   ← waqiService + openaqService + pmService 통합
├── policyService.js       ← policy/ 6개 파일 통합
└── locationService.js     (기존 유지)
```

**이동 대상 (내부 모듈화):**
- `waqiService.js` → `airQualityService.js` 내부
- `openaqService.js` → `airQualityService.js` 내부  
- `earthdataService.js` → `fusionService.js` 내부
- `shared-data-service.js` → `fusionService.js`로 흡수

### Phase 4: 정적 JSON API 최적화 (Week 3-4)

**현재 문제:**
- 68개국 policy-impact JSON이 개별 파일
- 초기 로딩 느림 (모든 데이터 한번에)
- 버전 관리 안 됨

**해결:**

1. **Country별 Lazy Load:**
   ```
   app/data/processed/
   ├── realtime_cities.json      (실시간 스냅샷, ~50KB)
   ├── policy_effects_v1.json    (68국 통합, 버전화)
   └── tiles/                    (지역별 분할, zoom 기반)
       ├── asia_pm25.json
       ├── europe_pm25.json
       └── ...
   ```

2. **Service Worker 캐싱 전략:**
   - 핵심 데이터: Cache First (5분 TTL)
   - 실시간 데이터: Network First (10분 fallback)
   - 정적 정책 JSON: Cache Only (업데이트 시 SW 갱신)

3. **파일명에 버전 포함:**
   - `policy_effects_2026-02-23.json`
   - Git LFS 또는 GitHub Releases로 대용량 관리

### Phase 5: DID 고도화 (Week 4+)

순서:
1. World Bank API → GDP, Population, Urbanization 수집
2. Open-Meteo → 기상 통제변수 (기온, 강수, 풍속)
3. `country_year_panel.parquet` 생성 (통합 패널)
4. DID full version (WLS, DQSS 가중치)
5. Parallel trend 자동 검정
6. Event study
7. Staggered DID (다중 시점 정책)

---

## 5. iOS 전환 준비

현재 구조가 iOS 전환에 유리한 이유:

| 항목 | 현재 상태 | iOS 전환 시 |
|------|----------|------------|
| 데이터 API | 정적 JSON (GitHub Pages) | URLSession으로 동일 JSON fetch |
| FusionService | JS 싱글턴 | Swift로 포팅 (동일 로직) |
| 차트 | Chart.js | SwiftUI Charts or Charts.framework |
| 3D Globe | Three.js | SceneKit or MapKit Globe |
| 모델 | 향후 ONNX | CoreML 변환 |

**핵심:** 정적 JSON API 인터페이스를 고정해두면 
iOS는 같은 엔드포인트를 그대로 사용.

---

## 6. 즉시 실행 체크리스트

- [x] globe.js 모듈 분할 (6개 파일)
- [x] fusionService.js 구현
- [x] 원본 백업 (_archive/globe-monolith.js)
- [x] 리팩토링 문서 작성
- [ ] git commit + push
- [ ] 브라우저 테스트 (globe.html 정상 로딩 확인)
- [ ] data_pipeline/ 폴더 생성 + 스크립트 이동
- [ ] analysis/policy/did_engine.py 구현
- [ ] World Bank API 연동
- [ ] DQSS compute 스크립트 작성
