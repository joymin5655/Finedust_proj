# 🌍 AirLens — Global Air Quality Intelligence Platform

> Bridging the air quality data gap — so everyone, everywhere, can know what they breathe.

[![Deploy to GitHub Pages](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions/workflows/deploy.yml)
[![Update AirLens Data](https://github.com/joymin5655/Finedust_proj/actions/workflows/update_airdata.yml/badge.svg)](https://github.com/joymin5655/Finedust_proj/actions/workflows/update_airdata.yml)

**🔗 Live:** [https://joymin5655.github.io/Finedust_proj/app/](https://joymin5655.github.io/Finedust_proj/app/)

---

## The Problem

The world's air quality monitoring infrastructure is fundamentally unequal.

Developed nations operate dense networks of ground sensors, while vast regions across Africa, South Asia, and South America — home to billions — have little to no monitoring coverage. People in these areas are exposed to some of the worst air pollution on Earth, yet they have no data to understand the risks they face or to hold policymakers accountable.

At the same time, governments worldwide are enacting air quality regulations, but there is no accessible platform to measure whether these policies actually work.

---

## Our Vision

**AirLens exists to democratize air quality intelligence.**

We believe that access to clean air data is not a privilege — it is a right. Our platform combines ground station measurements, satellite remote sensing, and machine learning to provide air quality insights for every corner of the globe, regardless of local infrastructure.

Beyond monitoring, AirLens aims to become the first open platform that quantitatively evaluates the real-world impact of environmental policies, giving citizens and researchers the evidence they need to drive meaningful change.

### What We're Building

🌐 **See the invisible** — An interactive 3D globe that makes global PM2.5 pollution visible and tangible, turning abstract numbers into an experience that connects people to the air around them.

📊 **Measure what matters** — A policy analysis engine that goes beyond correlation to estimate the causal effect of air quality regulations across 68 countries, using quasi-experimental methods that separate policy impact from weather and economic trends.

🛰️ **Fill the gaps** — Satellite-based estimation that brings air quality data to unmonitored regions, combining NASA AOD observations with weather data to predict PM2.5 where no sensors exist.

📸 **Empower individuals** — A camera-based air quality classifier (experimental) that lets anyone point their phone at the sky and get an instant air quality estimate, no sensor required.

---

## Core Principles

**Transparency first.** Every data point shows its source, uncertainty, and quality score. We never present estimates as facts.

**Scientific integrity.** Our policy analysis clearly states its limitations. We provide approximate causal insights, not definitive conclusions. All methods are documented and reproducible.

**Open by default.** Built entirely on publicly available data and open-source tools. Anyone can verify, extend, or challenge our work.

**Honest about uncertainty.** When data is sparse or models are uncertain, we say so. Trust is built through honesty, not impressive-looking numbers.

---

## Features

| Feature | Description |
|---------|-------------|
| 🌐 **3D Globe** | Interactive real-time PM2.5 visualization with multi-layer overlays |
| 📊 **Policy Analysis** | Before/after policy impact analysis across 68 countries |
| 📍 **Today** | GPS-based real-time PM2.5 + 7-day trend for your location |
| 📸 **Camera AI** | Estimate air quality from sky photos (experimental, browser-only) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JS (ES6+), Tailwind CSS |
| 3D Visualization | Three.js |
| Charts | Chart.js |
| Data Pipeline | Python + Node.js |
| CI/CD | GitHub Actions → GitHub Pages |

---

<details>
<summary>🇰🇷 한국어</summary>

## 문제 인식

전 세계 대기질 모니터링 인프라는 근본적으로 불평등합니다. 선진국은 촘촘한 관측망을 운영하지만, 아프리카·남아시아·남미 등 수십억 인구가 사는 지역에는 측정소가 거의 없습니다. 이 지역의 사람들은 지구에서 가장 심각한 대기오염에 노출되어 있지만, 자신이 마시는 공기의 질조차 알 수 없습니다.

동시에 세계 각국 정부가 대기질 규제를 시행하고 있지만, 이 정책들이 실제로 효과가 있는지 측정할 수 있는 접근 가능한 플랫폼은 존재하지 않습니다.

## 비전

**AirLens는 대기질 정보의 민주화를 위해 존재합니다.**

깨끗한 공기 데이터에 대한 접근은 특권이 아니라 권리입니다. 우리 플랫폼은 지상 관측소, 위성 원격 탐사, 머신러닝을 결합하여 지역 인프라와 무관하게 전 세계 모든 곳에 대기질 인사이트를 제공합니다.

모니터링을 넘어, AirLens는 환경 정책의 실제 효과를 정량적으로 평가하는 최초의 오픈 플랫폼이 되고자 합니다. 시민과 연구자에게 의미 있는 변화를 이끌어낼 근거를 제공합니다.

### 우리가 만들고 있는 것

🌐 **보이지 않는 것을 보이게** — 글로벌 PM2.5 오염을 시각적으로 체감할 수 있는 인터랙티브 3D 지구본

📊 **중요한 것을 측정** — 68개국 대기질 규제의 인과적 효과를 추정하는 정책 분석 엔진. 기상·경제 변화를 분리하는 준실험적 방법론 적용

🛰️ **공백을 채우다** — NASA AOD 위성 데이터와 기상 정보를 결합해 센서가 없는 지역의 PM2.5를 추정

📸 **개인에게 힘을** — 하늘 사진만으로 대기질 등급을 즉시 추정하는 카메라 기반 분류기 (실험적)

## 핵심 원칙

**투명성 우선.** 모든 데이터 포인트에 출처·불확실성·품질 점수를 표시합니다.

**과학적 무결성.** 정책 분석의 한계를 명확히 합니다. 확정적 결론이 아닌 근사적 인과 인사이트를 제공합니다.

**기본적으로 오픈.** 공개 데이터와 오픈소스 도구만으로 구축. 누구나 검증하고 확장할 수 있습니다.

**불확실성에 정직.** 데이터가 부족하거나 모델이 불확실할 때, 솔직히 말합니다.

</details>

---

**Made with ❤️ for cleaner air · [@joymin5655](https://github.com/joymin5655)**
