# AirLens - AI-Powered Air Quality Monitoring Portfolio

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-green)](https://joymin5655.github.io/Finedust_proj/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**외부 AI API 없이 완전히 독립적으로 동작하는 대기질 측정 Progressive Web App**

🌐 **Live Demo**: [https://joymin5655.github.io/Finedust_proj/](https://joymin5655.github.io/Finedust_proj/)

---

## 📱 프로젝트 소개

AirLens는 사용자의 프라이버시를 최우선으로 하는 대기질 측정 앱입니다.

### ✨ 핵심 특징

- ✅ **외부 AI API 불필요** - Gemini, OpenAI 등 필요 없음
- ✅ **100% 클라이언트 사이드** - 이미지가 서버로 전송되지 않음
- ✅ **완전한 오프라인 지원** - 인터넷 없이도 작동
- ✅ **GitHub 기반 데이터 관리** - 무료 클라우드 스토리지 활용
- ✅ **iOS-Inspired 디자인** - 세련되고 현대적인 UI/UX
- ✅ **PWA 지원** - 홈 화면에 추가하여 네이티브 앱처럼 사용

---

## 📂 프로젝트 구조

```
Finedust_proj/
├── 📱 [Portfolio & Deployed App]
│   ├── dist/              # 배포된 프로덕션 빌드
│   ├── public/            # 정적 파일 (PWA manifest, icons)
│   ├── src/               # 앱 소스 코드 (현재 실행 중)
│   ├── index.html         # HTML 템플릿
│   ├── package.json       # 의존성 관리
│   └── vite.config.ts     # 빌드 설정
│
├── 🛠️ Make_App/          # 개발용 소스 코드 (모든 개발 파일)
│   ├── src/              # React 컴포넌트 및 서비스
│   ├── public/           # 정적 파일
│   ├── package.json      # 의존성 관리
│   ├── README.md         # 개발 가이드
│   └── ...               # 모든 설정 파일
│
├── 📚 FineD_App/         # 제품 문서
│   └── AirLens_iOS_PRD.md   # 전체 제품 요구사항 문서
│
├── 🗄️ Old/               # 구버전 파일 보관 (참고용)
│   ├── Finedust_model/
│   ├── iOS_App_fd/
│   ├── Policy/
│   └── legacy_components/
│
├── 🚀 .github/           # GitHub Actions
│   └── workflows/
│       └── deploy.yml    # 자동 배포 워크플로우
│
└── README.md             # 이 파일 (포트폴리오 소개)
```

---

## 🎯 주요 기능

### 1. 포트폴리오 랜딩 페이지

앱의 모든 기능을 소개하는 전문적인 포트폴리오 페이지

- **Hero Section**: 대형 타이틀, 핵심 가치 제안, 통계 배지
- **Features Showcase**: 6개 기능 카드로 모든 기능 설명
- **How It Works**: 3단계 사용 방법
- **Technology Stack**: 사용된 기술 스택 표시
- **CTA Sections**: "Launch App" 버튼으로 즉시 앱 실행

### 2. 카메라 측정

- 📷 **카메라 캡처**: 실시간 하늘 사진 촬영
- 📁 **이미지 업로드**: 기존 이미지로 측정
- 🌍 **자동 위치 감지**: Geolocation API + OpenStreetMap
- 📡 **측정소 데이터**: 시뮬레이션된 실시간 대기질 데이터

### 3. 이미지 분석

- Canvas API를 사용한 클라이언트 사이드 분석
- 밝기, 채도, Blue 채널 비율 계산
- PM2.5 농도 추정 알고리즘
- 6단계 AQI 레벨 (Good ~ Hazardous)

### 4. 측정 기록

- 📜 **히스토리**: 모든 측정 기록 저장 및 표시
- ☁️ **GitHub 동기화**: 자동으로 GitHub에 백업
- 💾 **로컬 저장**: 오프라인 시 localStorage 사용
- 📤 **데이터 내보내기**: JSON 파일로 다운로드

### 5. 설정 및 관리

- 🌙 **Dark Mode**: 라이트/다크 테마 전환
- 🔗 **GitHub 연동**: Personal Access Token으로 연결
- 🗑️ **데이터 관리**: 로컬 데이터 삭제, 동기화

---

## 🚀 빠른 시작

### 포트폴리오 확인

Live Demo: [https://joymin5655.github.io/Finedust_proj/](https://joymin5655.github.io/Finedust_proj/)

### 개발하기

개발을 시작하려면 **Make_App** 폴더를 사용하세요:

```bash
# Make_App 폴더로 이동
cd Make_App

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집하여 GitHub token 입력

# 개발 서버 실행
npm run dev
```

자세한 개발 가이드는 [Make_App/README.md](./Make_App/README.md)를 참조하세요.

---

## 🛠 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **Frontend** | React 19, TypeScript 5.8 |
| **Build** | Vite 6 |
| **Styling** | Tailwind CSS 3, iOS-inspired Design System |
| **Storage** | GitHub API (주), localStorage (캐시) |
| **Deploy** | GitHub Pages + GitHub Actions |
| **PWA** | Service Worker, Web App Manifest |
| **APIs** | Canvas API, Geolocation API, OpenStreetMap Nominatim |

### 디자인 시스템

**iOS-Inspired Colors**:
- Primary Blue: `#007AFF`
- Success Green: `#34C759`
- Warning Yellow: `#FFCC00`
- Danger Red: `#FF3B30`
- Purple Accent: `#AF52DE`
- Teal Accent: `#5AC8FA`

**Typography**:
- Font Family: SF Pro Display (Apple's system font)
- Font Weights: Regular (400), Semibold (600), Bold (700)
- Letter Spacing: `-0.01em`

**Visual Elements**:
- Border Radius: 16px (`rounded-2xl`), 24px (`rounded-3xl`)
- Backdrop Blur for glassmorphism
- Gradient backgrounds and buttons
- Smooth cubic-bezier animations

---

## 📖 상세 문서

### 1. 제품 요구사항 문서 (PRD)
전체 기능 명세와 기술 아키텍처:
- **[FineD_App/AirLens_iOS_PRD.md](./FineD_App/AirLens_iOS_PRD.md)**

이 문서에는 다음 내용이 포함되어 있습니다:
- 제품 개요 및 핵심 가치
- 모든 기능 상세 명세
- 디자인 철학 및 스타일 가이드
- 기술 아키텍처 (이미지 분석, 데이터 저장)
- 데이터 모델 및 TypeScript 인터페이스
- 보안 및 프라이버시
- 사용자 흐름
- 배포 전략
- 향후 로드맵

### 2. 개발 가이드
개발 환경 설정 및 코드 구조:
- **[Make_App/README.md](./Make_App/README.md)**

이 문서에는 다음 내용이 포함되어 있습니다:
- 개발 환경 설정
- 폴더 구조 설명
- 주요 컴포넌트 가이드
- 핵심 서비스 API
- 스타일 가이드
- 트러블슈팅

---

## 🎨 스크린샷

### 랜딩 페이지
![Landing Page](https://via.placeholder.com/800x450/007AFF/FFFFFF?text=Landing+Page)

### 카메라 뷰
![Camera View](https://via.placeholder.com/400x800/34C759/FFFFFF?text=Camera+View)

### 결과 디스플레이
![Results](https://via.placeholder.com/400x800/FFCC00/000000?text=Results+Display)

### 히스토리
![History](https://via.placeholder.com/800x450/FF3B30/FFFFFF?text=History)

---

## 🌐 배포

### GitHub Pages 자동 배포

main 브랜치에 푸시하면 GitHub Actions가 자동으로 빌드 및 배포합니다.

**워크플로우**: `.github/workflows/deploy.yml`

1. 코드 체크아웃
2. Node.js 20 설정
3. 의존성 설치 (`npm ci`)
4. 프로덕션 빌드 (`npm run build`)
5. GitHub Pages에 배포

**배포 URL**: https://joymin5655.github.io/Finedust_proj/

### GitHub Pages 활성화

1. 저장소 Settings → Pages
2. Source를 "GitHub Actions"로 설정
3. main 브랜치에 푸시

---

## 💾 데이터 저장 아키텍처

### 3-Layer Storage System

```
User Action
    ↓
StorageManager
    ↓
    ├─→ GitHub Storage (Primary)
    │   └─→ GitHub API
    │
    └─→ localStorage (Cache/Fallback)
```

### 온라인 모드
- 측정 시 즉시 GitHub에 저장
- localStorage에 캐시 저장
- `synced: true` 플래그

### 오프라인 모드
- localStorage에만 저장
- `synced: false` 플래그
- 온라인 복귀 시 자동 동기화

---

## 🔒 보안 및 프라이버시

### 데이터 보호

1. **이미지 처리**
   - ✅ 모든 분석은 클라이언트에서 수행
   - ✅ 서버로 전송되지 않음
   - ✅ Base64로 인코딩하여 저장

2. **GitHub Token**
   - ✅ 환경 변수로만 관리 (`.env`)
   - ✅ `.gitignore`에 추가
   - ✅ Repository scope만 필요

3. **위치 정보**
   - ✅ 사용자 명시적 동의 필요
   - ✅ 거부 시 수동 입력 가능

### 보안 모범 사례
- ✅ HTTPS only (GitHub Pages 기본)
- ✅ No external tracking
- ✅ No cookies
- ✅ No third-party analytics
- ✅ 100% Privacy-focused

---

## 🧪 테스트

### 브라우저 호환성
- ✅ Chrome (최신)
- ✅ Safari (iOS 포함)
- ✅ Firefox
- ✅ Edge

### 디바이스 테스트
- ✅ Desktop (1920x1080)
- ✅ Tablet (768px)
- ✅ Mobile (375px, 414px)

### PWA 기능
- ✅ 홈 화면에 추가
- ✅ 오프라인 동작
- ✅ Service Worker caching

---

## 📈 성능

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Bundle Size
- Main JS: < 250KB (gzipped)
- CSS: < 50KB (gzipped)
- Total: < 300KB

---

## 🔮 향후 계획

### Phase 2 (v2.0)
- [ ] 실제 대기질 측정소 API 연동 (선택적)
- [ ] 머신러닝 모델 개선 (TensorFlow.js)
- [ ] 다국어 지원 (i18n)
- [ ] 소셜 공유 기능

### Phase 3 (v3.0)
- [ ] 실시간 대기질 지도
- [ ] 커뮤니티 측정 데이터 공유
- [ ] Apple HealthKit 연동
- [ ] 알림 및 경고 시스템

---

## 🤝 기여하기

### 버그 리포트
GitHub Issues에 버그 리포트를 제출해주세요:
- 재현 단계
- 예상 동작
- 실제 동작
- 스크린샷 (선택)

### 기능 제안
Discussion에서 새로운 기능을 제안해주세요.

### Pull Request
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

Copyright (c) 2025 joymin5655

---

## 👨‍💻 개발자

**joymin5655**
- GitHub: [@joymin5655](https://github.com/joymin5655)
- Repository: [Finedust_proj](https://github.com/joymin5655/Finedust_proj)

---

## 🙏 감사의 말

- [React Team](https://react.dev/) - 훌륭한 UI 라이브러리
- [Vite Team](https://vitejs.dev/) - 빠른 빌드 도구
- [Tailwind CSS Team](https://tailwindcss.com/) - 유틸리티 CSS 프레임워크
- [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) - 무료 Geocoding API

---

## 📞 연락처

프로젝트에 대한 질문이나 제안이 있으시면:
- GitHub Issues: [Create an issue](https://github.com/joymin5655/Finedust_proj/issues)
- GitHub Discussions: [Start a discussion](https://github.com/joymin5655/Finedust_proj/discussions)

---

<div align="center">

**Made with ❤️ for clean air monitoring**

🌍 **No External AI APIs Required!** 🎉

⭐ **Star this project if you find it useful!** ⭐

</div>
