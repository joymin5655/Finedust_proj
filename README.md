# 🌍 AirLens — Global Air Quality Intelligence Platform

**실시간 PM2.5 시각화 · 정책 영향 분석 · 위성 기반 보조 추정**

[![GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-blue)](https://your-username.github.io/AirLens/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

AirLens는 전 세계 대기질(PM2.5)을 3D Globe 위에 시각화하고,  
국가별 정책 효과를 데이터 기반으로 분석하며,  
센서가 부족한 지역에서도 위성·기상 데이터를 활용해 추정치를 제공하는 웹 플랫폼입니다.

## Features

- **3D Globe** — Three.js 기반 실시간 PM2.5 시각화
- **Today Dashboard** — 도시별 실시간 대기질 카드
- **Policy Analysis** — 68개국 정책 전후(Pre/Post) 변화 분석
- **Camera AI** — 이미지 기반 대기질 판정 (실험적)
- **다국어 지원** — EN / KO / JA / ZH / ES / FR

## Data Sources

- [OpenAQ](https://openaq.org/) — 관측소 PM2.5 시계열
- [WAQI](https://waqi.info/) — 실시간 AQI
- [Open-Meteo](https://open-meteo.com/) — 기상 데이터
- [NASA Earthdata](https://earthdata.nasa.gov/) — 위성 AOD

## Tech Stack

Three.js · Chart.js · Tailwind CSS · GitHub Actions · GitHub Pages

## Getting Started

```bash
# 로컬 개발 서버
./serve_local.sh
# 또는
npx http-server app -p 8080
```

## License

MIT License — See [LICENSE](LICENSE) for details.
