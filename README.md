# 🌍 AirLens - Global Air Quality Visualization

> 실시간 PM2.5 모니터링 • 66개국 정책 분석 • 3D 지구본 시각화

[![Deploy](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)
[![WAQI Data](https://github.com/joymin5655/Finedust_proj/actions/workflows/update-waqi-data.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions)

**🔗 Live Demo:** [https://joymin5655.github.io/Finedust_proj/app/](https://joymin5655.github.io/Finedust_proj/app/)

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🌐 **3D Globe** | Three.js 기반 인터랙티브 지구본, 실시간 PM2.5 마커 |
| 📊 **66개국 정책** | 국가별 대기질 정책, PM2.5 트렌드 차트, 효과 분석 |
| 📸 **Camera AI** | 하늘 사진으로 PM2.5 예측 (브라우저 기반 ML) |
| 🔄 **자동 업데이트** | GitHub Actions로 매일 WAQI 데이터 갱신 |

---

## 🚀 빠른 시작

```bash
# 저장소 클론
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj

# 로컬 서버 실행
python3 -m http.server 8000
# 또는
npx serve app

# 브라우저에서 열기
open http://localhost:8000/app/
```

---

## 📁 프로젝트 구조

```
Finedust_proj/
├── app/
│   ├── index.html          # 홈페이지
│   ├── globe.html          # 3D 지구본
│   ├── camera.html         # Camera AI
│   ├── css/                # 스타일시트
│   ├── js/
│   │   ├── globe.js        # 메인 지구본 로직
│   │   ├── camera.js       # 카메라 AI
│   │   ├── config.template.js  # API 설정 템플릿
│   │   └── services/       # 데이터 서비스 모듈
│   └── data/
│       ├── policy-impact/  # 66개국 정책 데이터
│       └── waqi/           # 53개 도시 실시간 데이터
├── scripts/
│   └── fetch-waqi-data.js  # WAQI 데이터 수집
└── .github/workflows/
    ├── deploy.yml          # GitHub Pages 배포
    └── update-waqi-data.yml # 매일 데이터 업데이트
```

---

## 📊 데이터 소스

| 소스 | 데이터 | API 키 |
|------|--------|--------|
| **EU Copernicus CAMS** | PM2.5 실시간 (Open-Meteo) | ❌ 불필요 |
| **WAQI** | 53개 도시 상세 데이터 | ✅ GitHub Secrets |
| **정책 데이터** | 66개국 133개 정책 | ❌ 로컬 JSON |

---

## 🛠️ 기술 스택

- **Frontend**: Vanilla JS (ES6+), Tailwind CSS
- **3D**: Three.js, WebGL
- **Charts**: Chart.js
- **CI/CD**: GitHub Actions, GitHub Pages

---

## 📄 라이선스

MIT License

---

**Made with ❤️ by [@joymin5655](https://github.com/joymin5655)**
