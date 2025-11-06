# AirLens Final

![AirLens](https://img.shields.io/badge/AirLens-Final-blue)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)

**AirLens Final**은 AI 기반 대기질 측정 앱입니다. 모바일 우선 설계로 오프라인 지원, GitHub 기반 데이터 동기화, 그리고 Progressive Web App(PWA) 기능을 제공합니다.

## 🌟 주요 기능

### 📸 AI 대기질 분석
- **카메라 촬영**: 하늘 사진을 촬영하여 PM2.5 수치를 실시간으로 분석
- **이미지 업로드**: 기존 사진을 업로드하여 분석
- **Google Gemini AI**: 최신 AI 모델을 사용한 정확한 분석

### 📊 측정 데이터 관리
- **측정소 데이터**: 주변 측정소의 실시간 대기질 정보
- **위치 기반 서비스**: GPS를 통한 정확한 위치 정보
- **측정 이력**: 모든 측정 기록을 로컬에 저장

### 💾 스마트 데이터 저장
- **로컬 저장소**: 모든 데이터를 휴대폰에 저장
- **GitHub 동기화**: 온라인 시 자동으로 GitHub에 백업
- **오프라인 우선**: 인터넷 없이도 완전히 동작

### 📱 PWA 지원
- **홈 화면 추가**: 네이티브 앱처럼 사용
- **오프라인 동작**: 서비스 워커를 통한 완전한 오프라인 지원
- **백그라운드 동기화**: 온라인 복귀 시 자동 동기화

## 🛠 기술 스택

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **AI**: Google Gemini AI
- **Storage**:
  - Local: localStorage API
  - Remote: GitHub API
- **PWA**: Service Worker + Web App Manifest

## 📁 프로젝트 구조

```
Final/
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── CameraView.tsx  # 카메라 및 측정 화면
│   │   ├── HistoryView.tsx # 측정 이력 화면
│   │   ├── SettingsView.tsx# 설정 화면
│   │   ├── ResultsDisplay.tsx # 결과 표시
│   │   └── Icons.tsx       # 아이콘 컴포넌트
│   ├── services/           # 비즈니스 로직
│   │   ├── githubStorage.ts  # GitHub API 연동
│   │   ├── localStorage.ts   # 로컬 저장소 관리
│   │   └── storageManager.ts # 통합 저장소 관리
│   ├── types/              # TypeScript 타입 정의
│   ├── utils/              # 유틸리티 함수
│   ├── App.tsx             # 메인 앱 컴포넌트
│   ├── main.tsx            # 엔트리 포인트
│   └── index.css           # 전역 스타일
├── public/
│   ├── manifest.json       # PWA 매니페스트
│   └── sw.js               # 서비스 워커
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

1. 저장소 클론
```bash
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj/Final
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GITHUB_TOKEN=your_github_token_here
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=your_repository_name
```

### API 키 발급

#### Google Gemini API
1. [Google AI Studio](https://aistudio.google.com/)에 접속
2. API 키 생성
3. `.env` 파일에 추가

#### GitHub Token (선택사항)
1. GitHub Settings → Developer settings → Personal access tokens
2. `repo` 권한으로 토큰 생성
3. `.env` 파일에 추가

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 프리뷰

```bash
npm run preview
```

## 📖 사용 방법

### 1. 대기질 측정

**카메라로 촬영:**
1. "Capture" 버튼 클릭
2. 하늘을 향해 사진 촬영
3. AI가 자동으로 PM2.5 수치 분석

**이미지 업로드:**
1. "Upload" 버튼 클릭
2. 기존 하늘 사진 선택
3. 분석 결과 확인

**측정소 데이터:**
1. "Stations" 버튼 클릭
2. 주변 측정소 데이터 확인

### 2. 측정 이력 확인

1. 우측 상단 시계 아이콘 클릭
2. 과거 측정 기록 확인
3. 세부 정보 보기

### 3. GitHub 동기화

**자동 동기화:**
- 온라인 상태이고 Auto Sync가 활성화되어 있으면 자동으로 동기화

**수동 동기화:**
1. 이력 화면에서 동기화 버튼 클릭
2. 동기화 결과 확인

### 4. 설정

1. 우측 상단 톱니바퀴 아이콘 클릭
2. 다크모드, 언어, 동기화 설정 변경
3. 저장소 사용량 및 연결 상태 확인

## 🌐 GitHub 저장소 설정

앱에서 GitHub을 데이터 저장소로 사용하려면:

1. 새로운 GitHub 저장소 생성 (Private 권장)
2. 저장소에 `data/` 폴더 생성
3. Personal Access Token 생성 (`repo` 권한)
4. `.env` 파일에 설정 추가

데이터는 `data/history.json` 파일에 저장됩니다.

## 📱 PWA 설치

### Android
1. Chrome에서 앱 실행
2. 메뉴 → "홈 화면에 추가"
3. 아이콘이 홈 화면에 추가됨

### iOS
1. Safari에서 앱 실행
2. 공유 버튼 → "홈 화면에 추가"
3. 아이콘이 홈 화면에 추가됨

## 🔒 개인정보 보호

- 모든 데이터는 로컬에 저장됩니다
- GitHub 동기화는 선택사항입니다
- 위치 정보는 측정 시에만 사용됩니다
- 개인 식별 정보는 수집하지 않습니다

## 🐛 문제 해결

### Gemini API 오류
- API 키가 올바른지 확인
- API 사용량 제한 확인

### GitHub 동기화 실패
- GitHub Token 권한 확인
- 저장소 이름이 올바른지 확인
- 네트워크 연결 확인

### 카메라 권한 오류
- 브라우저 설정에서 카메라 권한 허용
- HTTPS 연결 확인 (localhost는 HTTP 허용)

## 🤝 기여

이 프로젝트에 기여하고 싶으시다면:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👨‍💻 개발자

**joymin5655**
- GitHub: [@joymin5655](https://github.com/joymin5655)

## 🙏 감사의 말

- Google Gemini AI
- React Team
- Tailwind CSS Team
- Vite Team

---

**Made with ❤️ by joymin5655**
