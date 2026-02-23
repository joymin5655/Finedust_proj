# AirLens PRD — v2.0 (API Integration)
> Version 2.0 | 2026-02  
> **방향**: 3-API 데이터 통합 (WAQI + OpenAQ + Earthdata) + 정책 효과 분석

---

## 1. 배경 & 방향

전 세계 대기질 모니터링 인프라가 부족한 지역이 많습니다.
AirLens는 다양한 공개 데이터 소스를 통합하여 3D 글로브에서
실시간 대기질 현황과 국가별 정책 효과를 시각화합니다.

### 데이터 소스

| 역할 | 담당 | 업데이트 주기 |
|------|------|-------------|
| 실시간 AQI | WAQI → GitHub Actions | 6시간 |
| 연/일 평균 PM2.5 | OpenAQ v3 | 주 1회 |
| 위성 AOD | NASA Earthdata | 월 1회 |
| 정책 효과 분석 | DID 기반 스크립트 | 주 1회 |

---

## 2. 시스템 아키텍처

```
[GitHub Actions — 자동 실행]
    ├─ scripts/fetch-waqi-data.js              (6h)
    ├─ scripts/python/fetch_openaq.py          (주 1회)
    ├─ scripts/python/fetch_earthdata_aod.py   (월 1회)
    └─ scripts/python/build_policy_effect.py   (주 1회)
              ↓
[app/data/ — 정적 JSON]
    ├─ waqi/          (실시간 AQI 스냅샷)
    ├─ openaq/        (연/일 평균 PM2.5)
    ├─ earthdata/     (위성 AOD)
    ├─ policies/      (정책 데이터)
    └─ policy-impact/ (68개국 정책 효과)
              ↓
[GitHub Pages — 프론트엔드]
    ├─ index.html   (Today — 현재 대기질)
    ├─ globe.html   (Globe — 3D 시각화)
    ├─ policy.html  (Policy — 정책 분석)
    ├─ camera.html  (Camera — 실험적)
    ├─ about.html   (About & Research)
    └─ settings.html
```

---

## 3. 페이지별 기능

### 3.1 Today (index.html)
- 현재 위치 기반 대기질 표시
- 가까운 측정소 데이터 (WAQI)
- PM2.5 등급 색상 + 건강 가이드

### 3.2 Globe (globe.html) ★ 핵심
- Three.js 3D 지구본
- PM2.5 측정소 마커 (1,188+ stations, 색상 코딩)
- 국가별 정책 마커 (68개국, 신뢰도 뱃지)
- 국가 클릭 → 정책 상세 패널 + 효과 분석
- OpenAQ/Earthdata AOD 오버레이

### 3.3 Policy (policy.html)
- 국가별 정책 목록
- 정책 효과 차트 (DID 기반 pre/post 비교)
- 신뢰도 점수 표시

### 3.4 Camera (camera.html)
- 카메라/사진 기반 대기질 추정 (실험적)
- 위성 데이터 보조

### 3.5 About (about.html)
- 프로젝트 소개, 데이터 소스, 방법론

---

## 4. 프론트엔드 서비스 레이어

```
app/js/
  ├─ utils/
  │   ├─ constants.js     PM25 등급, WHO 기준, 캐시 TTL
  │   ├─ geo.js           거리계산, IDW, 좌표변환
  │   ├─ color.js         PM25→색상, AQI 변환
  │   └─ security.js      XSS/URL 방어
  ├─ services/
  │   ├─ dataService.js        통합 데이터 서비스 (진입점)
  │   ├─ shared-data-service.js  글로벌 상태 관리
  │   ├─ waqi-data-service.js    WAQI 전용 로더
  │   ├─ enhanced-marker-system.js  Globe 마커 시스템
  │   ├─ stationService.js     측정소 검색/관리
  │   ├─ locationService.js    위치 서비스
  │   ├─ cameraService.js      카메라 서비스
  │   ├─ pmService.js          PM 계산/등급
  │   ├─ uiService.js          UI 유틸리티
  │   ├─ openaqService.js      OpenAQ 데이터
  │   ├─ earthdataService.js   NASA AOD 데이터
  │   ├─ waqiService.js        WAQI API
  │   ├─ openaiService.js      AI 분석 (실험적)
  │   └─ policy/
  │       ├─ policy-data-service.js
  │       ├─ policy-impact-analyzer.js
  │       ├─ policy-change-visualizer.js
  │       ├─ policy-comparison-panel.js
  │       ├─ policy-visualization.js
  │       └─ data-integration-service.js
  ├─ globe.js             3D Globe 메인 (모듈)
  ├─ globe-enhancement.js
  ├─ globe-data-integration.js
  ├─ today.js / today-enhanced.js
  ├─ policy.js / policy-enhanced.js
  ├─ camera.js / camera-today.js
  ├─ i18n.js / main.js / theme-toggle.js
  └─ message-utils.js / satellite-api.js / settings.js
```

---

## 5. KPIs

| 지표 | 타깃 |
|------|------|
| First Load | ≤ 3초 |
| Globe FPS | ≥ 30 |
| 측정소 수 | ≥ 1,188 |
| 정책 국가 수 | ≥ 68 |
| 데이터 신선도 (WAQI) | ≤ 6시간 |

---

## 6. 보안 규칙

| 규칙 | 이유 |
|------|------|
| API 토큰 → GitHub Secrets만 | 클라이언트 노출 방지 |
| 프론트 → 외부 API 직접 호출 금지 | CORS + 토큰 보호 |
| HTML 출력 → XSS escape 필수 | 보안 |
| 정책 효과 → "단독 근거 아님" 고지 | 과신 방지 |

---

## 7. 향후 계획 (v3.0)

아래는 코드가 `_archive/premature-ml/`에 보존되어 있으며,
데이터/인프라 준비 완료 후 활성화 예정입니다.

| 기능 | 설명 | 상태 |
|------|------|------|
| ML 예측 모델 | AOD+Weather→PM2.5 (RF/XGBoost) | archived |
| 예측 그리드 레이어 | Globe 위 PM2.5 히트맵 | archived |
| ML 파이프라인 자동화 | GitHub Actions 학습/배포 | archived |
| 이미지 기반 AQ 분류 | ResNet18/MobileNet → AQ 등급 | 계획 |
| ONNX 브라우저 추론 | onnxruntime-web | 계획 |
| iOS 앱 (AirLens) | SwiftUI + CoreML + SceneKit | 별도 PRD |

---

End of Document