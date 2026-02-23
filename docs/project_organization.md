# AirLens 프로젝트 정리 보고서

**Date:** 2026-02-23  
**PRD Version:** v2.0 (API Integration)  
**Status:** 정리 완료

---

## 1. 프로젝트 구조 현황 (PRD 기준)

```
Finedust_proj/
├── index.html                    # → app/index.html 리다이렉트
├── package.json
├── serve_local.sh
├── .gitignore
│
├── app/                          # ★ GitHub Pages 배포 대상
│   ├── index.html                # Today — 현재 대기질
│   ├── globe.html                # Globe — 3D 시각화 (핵심)
│   ├── policy.html               # Policy — 정책 분석
│   ├── camera.html               # Camera — 실험적
│   ├── about.html                # About & Research
│   ├── settings.html             # 설정
│   ├── research.html             # Research│   ├── 404.html, robots.txt, sitemap.xml
│   │
│   ├── css/
│   │   ├── main.css              # 공통
│   │   ├── globe.css             # Globe 전용
│   │   ├── camera.css            # Camera 전용
│   │   ├── settings.css          # Settings 전용
│   │   └── policy-panel-enhanced.css
│   │
│   ├── js/
│   │   ├── utils/                # 유틸리티 (v2.0)
│   │   │   ├── constants.js      # PM25 등급, WHO 기준, 캐시 TTL
│   │   │   ├── geo.js            # Haversine, IDW, 좌표변환
│   │   │   ├── color.js          # PM25→색상, AQI 변환
│   │   │   └── security.js       # XSS/URL 방어
│   │   │
│   │   ├── services/             # 서비스 레이어
│   │   │   ├── dataService.js    # 통합 데이터 서비스 (진입점)
│   │   │   ├── shared-data-service.js  # 글로벌 상태
│   │   │   ├── waqi-data-service.js    # WAQI 전용
│   │   │   ├── waqiService.js    # WAQI API
│   │   │   ├── stationService.js # 측정소 검색
│   │   │   ├── locationService.js  # 위치
│   │   │   ├── cameraService.js  # 카메라
│   │   │   ├── pmService.js      # PM 계산/등급
│   │   │   ├── uiService.js      # UI 유틸
│   │   │   ├── openaqService.js  # OpenAQ
│   │   │   ├── earthdataService.js  # NASA AOD
│   │   │   ├── openaiService.js  # AI 분석 (실험적)
│   │   │   ├── enhanced-marker-system.js  # Globe 마커
│   │   │   └── policy/           # 정책 서브시스템
│   │   │       ├── policy-data-service.js
│   │   │       ├── policy-impact-analyzer.js
│   │   │       ├── policy-change-visualizer.js
│   │   │       ├── policy-comparison-panel.js
│   │   │       ├── policy-visualization.js
│   │   │       └── data-integration-service.js
│   │   │
│   │   ├── globe.js              # 3D Globe 메인 (3,131줄)
│   │   ├── globe-enhancement.js  # Globe 확장
│   │   ├── globe-data-integration.js  # OpenAQ+AOD 오버레이
│   │   ├── today.js / today-enhanced.js
│   │   ├── policy.js / policy-enhanced.js
│   │   ├── camera.js / camera-today.js
│   │   ├── i18n.js / main.js / theme-toggle.js
│   │   └── message-utils.js / satellite-api.js / settings.js
│   │
│   ├── data/                     # 정적 JSON (자동 업데이트)
│   │   ├── waqi/                 # WAQI 스냅샷
│   │   ├── openaq/               # OpenAQ PM2.5
│   │   ├── earthdata/            # NASA AOD
│   │   ├── policies/             # 정책 데이터
│   │   ├── policy-impact/        # 68개국 정책 효과
│   │   └── pm25/                 # PM2.5 데이터
│   │
│   ├── assets/                   # 이미지, 텍스처
│   └── public/                   # 공개 리소스
│
├── scripts/                      # 데이터 수집 스크립트
│   ├── fetch-waqi-data.js        # WAQI (GitHub Actions)
│   └── python/
│       ├── fetch_openaq.py
│       ├── fetch_earthdata_aod.py
│       └── build_policy_effect.py
│
├── .github/workflows/            # 자동화
│   ├── deploy.yml                # GitHub Pages 배포
│   ├── update-waqi-data.yml      # WAQI 6시간
│   └── update_airdata.yml        # OpenAQ+Earthdata
│
├── _archive/                     # 보관 (비활성)
│   ├── premature-ml/             # ML (v3.0 대기)
│   ├── duplicate-services/       # 중복 서비스 백업
│   └── landing.html              # 구 Today 페이지
│
├── docs/
│   ├── PRD.md                    # v2.0
│   ├── project_organization.md   # 이 문서
│   └── refactoring_summary.md
│
└── analysis/
    └── policy_effect.ipynb
```

---

## 2. 페이지별 의존성 맵

### Today (index.html)
```
i18n → theme-toggle → main → message-utils → satellite-api
→ dataService → stationService → locationService → cameraService
→ pmService → uiService → camera-today → today
→ today-enhanced (module: waqiService, openaqService, earthdataService)
```

### Globe (globe.html)
```
i18n → theme-toggle → main → message-utils → air-quality-api
→ globe.js (ES module importmap):
    ├── three, OrbitControls
    ├── shared-data-service, waqi-data-service, dataService
    ├── enhanced-marker-system
    ├── policy/{data-service, impact-analyzer, change-visualizer}
    ├── utils/{color, geo, security}
    └── globe-enhancement (dynamic):
        └── policy/{visualization, comparison-panel, data-integration}
→ globe-data-integration (module: earthdataService, openaqService)
```

### Policy (policy.html)
```
i18n → theme-toggle → main → dataService → pmService → uiService → policy
→ policy-enhanced (module: openaqService, earthdataService)
```

### Camera (camera.html)
```
i18n → theme-toggle → main → message-utils → satellite-api → camera
```

---

## 3. 정리 결과

### ✅ 확인 사항
- 고아(orphan) 파일 없음 — 모든 JS가 HTML 또는 다른 JS에서 참조됨
- utils/ 모듈 (v2.0) — globe.js에서 정상 import
- services/policy/ — 리팩토링 완료
- _archive/ — premature-ml, duplicate-services 보관
- .gitignore — DS_Store, 모델, 환경파일 제외

### 정리 수행
| 항목 | 조치 | 이유 |
|------|------|------|
| `landing.html` | → `_archive/` | index.html과 중복 |

### 📊 파일 통계
| 카테고리 | 파일 수 | 줄 수 |
|----------|--------|-------|
| JS (페이지) | 14 | ~4,500 |
| JS (서비스) | 13 | ~2,200 |
| JS (Policy 서브) | 6 | ~2,800 |
| JS (유틸) | 4 | ~300 |
| JS (Globe) | 1 | 3,131 |
| **합계** | **38** | **~12,900** |

---

## 4. PRD v2.0 적합성

| PRD 항목 | 상태 |
|----------|------|
| WAQI 실시간 데이터 | ✅ |
| OpenAQ 연/일 평균 | ✅ |
| Earthdata AOD | ✅ |
| 정책 효과 DID 분석 (68개국) | ✅ |
| 3D Globe (Three.js) | ✅ |
| utils/ 모듈화 | ✅ |
| services/ 통합 | ✅ |
| 보안 (XSS, Secrets) | ✅ |
| ML (v3.0) | ⏸️ archived |

---

## 5. 미커밋 변경사항

```
 M .gitignore
 M app/camera.html, globe.html, index.html, settings.html
 M app/js/globe-enhancement.js, globe.js, services/dataService.js
 D app/js/config.template.js, hero-animation.js (→ _archive)
 D app/js/services/{policy-*} (→ services/policy/)
 + _archive/, app/data/{country-policies,major-cities}.json
 + app/js/services/policy/, app/js/utils/
 + docs/refactoring_summary.md, project_organization.md
```

커밋 권장 메시지:
```
🔧 v2.0 리팩토링 정리: 모듈화 + 아카이브 + 정리

- utils/ 모듈 추가 (constants, geo, color, security)
- services/policy/ 서브폴더로 재구성
- premature-ml → _archive/ 보관
- landing.html → _archive/ (중복 제거)
- 데이터 파일 추가 (country-policies, major-cities)
- PRD v2.0 업데이트
```