# Finedust_proj

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-green)](https://joymin5655.github.io/Finedust_proj/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**외부 AI API 없이 완전히 독립적으로 동작하는 대기질 측정 Progressive Web App**

GitHub를 주 저장소로 사용하며, GitHub Pages로 자동 배포되는 모바일 우선 웹 앱입니다.

---

## 📂 프로젝트 구조

```
Finedust_proj/
├── Final/                 # ✅ 메인 애플리케이션 (여기가 실제 앱입니다!)
│   ├── src/              # 소스 코드
│   ├── public/           # 정적 파일
│   ├── dist/             # 빌드 결과물
│   ├── package.json      # 의존성 관리
│   └── README.md         # 상세 문서
│
├── .github/              # GitHub Actions 워크플로우
│   └── workflows/
│       └── deploy.yml    # 자동 배포 설정
│
├── Old/                  # 구버전 파일 보관 (참고용, 삭제 가능)
│   ├── components/
│   ├── iOS_App_fd/
│   └── ...
│
├── .gitignore           # Git 무시 파일 설정
└── README.md            # 이 파일
```

---

## 🚀 빠른 시작

### 로컬 개발

```bash
# 1. 저장소 클론
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj/Final

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일에 GitHub 토큰 설정

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 프로덕션 배포

main 브랜치에 푸시하면 GitHub Actions가 자동으로 빌드 및 배포합니다.

**배포된 앱**: https://joymin5655.github.io/Finedust_proj/

---

## ✨ 주요 기능

### 🎯 완전 독립 실행
- ✅ **외부 AI API 불필요** - Gemini, OpenAI 등 필요 없음
- ✅ **브라우저 기반 이미지 분석** - Canvas API 사용
- ✅ **100% 오프라인 가능** - 인터넷 없이도 작동

### 📸 대기질 측정
- 카메라로 하늘 사진 촬영
- 이미지 분석을 통한 PM2.5 추정
- 위치 기반 측정 기록

### 💾 GitHub 기반 데이터 관리
- **온라인**: GitHub에 직접 저장
- **오프라인**: 로컬 저장 후 자동 동기화
- 측정 기록을 GitHub 저장소에 안전하게 보관

### 📱 PWA 지원
- 홈 화면에 추가 가능
- 오프라인 동작
- 모바일 최적화

---

## 🛠 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **Frontend** | React 19, TypeScript 5.8 |
| **Build** | Vite 6 |
| **Styling** | Tailwind CSS 3 |
| **Storage** | GitHub API (주), localStorage (캐시) |
| **Deploy** | GitHub Pages + GitHub Actions |
| **PWA** | Service Worker, Web App Manifest |

---

## 📖 상세 문서

모든 상세 문서는 **[Final/README.md](./Final/README.md)** 에서 확인하세요:

- 설치 및 설정 가이드
- GitHub Token 발급 방법
- 이미지 분석 알고리즘 설명
- API 문서
- 트러블슈팅 가이드

---

## 🌐 배포 설정

### 1. GitHub Pages 활성화

1. 저장소 Settings → Pages
2. Source를 "GitHub Actions"로 설정

### 2. GitHub Token 설정

```bash
cd Final
cp .env.example .env
# .env 파일 편집
```

```env
VITE_GITHUB_TOKEN=your_github_personal_access_token
VITE_GITHUB_OWNER=joymin5655
VITE_GITHUB_REPO=Finedust_proj
```

[Token 발급 방법](https://github.com/settings/tokens)

### 3. 배포

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

GitHub Actions가 자동으로 빌드 및 배포합니다!

---

## 🗂️ Old 폴더에 대하여

`Old/` 폴더는 프로젝트 재구성 이전의 구버전 파일들을 보관합니다.

- **목적**: 참고용 보관
- **사용**: 실제 작동하지 않음
- **삭제**: 안전하게 삭제 가능

모든 기능은 `Final/` 폴더에 새롭게 구현되어 있습니다.

---

## 📄 라이선스

MIT License

---

## 👨‍💻 개발자

**joymin5655**
- GitHub: [@joymin5655](https://github.com/joymin5655)

---

## 🙏 감사의 말

- React Team
- Vite Team
- Tailwind CSS Team
- OpenStreetMap Nominatim

---

**Made with ❤️ for clean air monitoring**

🌍 **No External AI APIs Required!** 🎉
