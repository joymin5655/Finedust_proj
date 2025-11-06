# Make_App - AirLens 개발 소스 코드

이 폴더는 AirLens 앱을 개발하고 빌드하기 위한 모든 소스 코드와 설정 파일을 포함합니다.

---

## 📂 폴더 구조

```
Make_App/
├── src/                    # 소스 코드
│   ├── components/        # React 컴포넌트
│   │   ├── LandingPage.tsx      # 포트폴리오 랜딩 페이지
│   │   ├── CameraView.tsx       # 카메라 측정 화면
│   │   ├── ResultsDisplay.tsx   # 결과 표시 화면
│   │   ├── HistoryView.tsx      # 측정 기록 화면
│   │   ├── SettingsView.tsx     # 설정 화면
│   │   └── Icons.tsx            # 아이콘 컴포넌트
│   ├── services/          # 비즈니스 로직
│   │   ├── airQualityService.ts    # 이미지 분석 알고리즘
│   │   ├── storageManager.ts       # 저장소 관리
│   │   ├── githubStorage.ts        # GitHub API 연동
│   │   └── localStorage.ts         # 로컬 저장소
│   ├── types/             # TypeScript 타입 정의
│   │   └── index.ts
│   ├── utils/             # 유틸리티 함수
│   │   └── helpers.ts
│   ├── App.tsx            # 메인 앱 컴포넌트
│   ├── main.tsx           # 진입점
│   └── index.css          # 글로벌 스타일
│
├── public/                # 정적 파일
│   ├── manifest.json      # PWA 매니페스트
│   ├── sw.js              # Service Worker
│   └── icon-192.png.txt   # 아이콘 (예제)
│
├── package.json           # 의존성 관리
├── tsconfig.json          # TypeScript 설정
├── vite.config.ts         # Vite 빌드 설정
├── tailwind.config.js     # Tailwind CSS 설정
├── postcss.config.js      # PostCSS 설정
├── index.html             # HTML 템플릿
└── .env.example           # 환경 변수 예제

```

---

## 🚀 개발 시작하기

### 1. 의존성 설치

```bash
cd Make_App
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 GitHub 설정 입력:

```env
VITE_GITHUB_TOKEN=your_github_personal_access_token
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=your_repository_name
```

**GitHub Token 발급 방법**:
1. GitHub Settings → Developer settings → Personal access tokens
2. "Generate new token" 클릭
3. 권한 선택: `repo` (Full control of private repositories)
4. 토큰 복사하여 `.env`에 붙여넣기

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 4. 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

### 5. 프리뷰

```bash
npm run preview
```

프로덕션 빌드를 로컬에서 테스트할 수 있습니다.

---

## 🛠 기술 스택

### Core
- **React 19.2** - UI 라이브러리
- **TypeScript 5.8** - 타입 안전성
- **Vite 6.2** - 빌드 도구

### Styling
- **Tailwind CSS 3.3** - 유틸리티 CSS 프레임워크
- **PostCSS** - CSS 후처리
- iOS-inspired 디자인 시스템

### APIs & Services
- **Canvas API** - 이미지 분석
- **Geolocation API** - 위치 감지
- **GitHub API** - 데이터 저장
- **OpenStreetMap Nominatim** - Reverse geocoding

### PWA
- **Service Worker** - 오프라인 지원
- **Web App Manifest** - 앱 설치

---

## 📋 주요 컴포넌트

### 1. LandingPage.tsx
포트폴리오 랜딩 페이지 - 앱의 모든 기능을 소개

**Props**:
```typescript
interface LandingPageProps {
  onLaunchApp: () => void;
}
```

**Features**:
- Hero section with animated gradients
- 6 feature cards
- "How It Works" 3-step guide
- Technology stack display
- CTA sections
- Footer

### 2. CameraView.tsx
메인 측정 화면 - 카메라/업로드로 이미지 분석

**Props**:
```typescript
interface CameraViewProps {
  onNavigateToHistory: () => void;
  onNavigateToSettings: () => void;
}
```

**Features**:
- Camera capture
- Image upload
- Location display
- Nearby station data
- Loading state

### 3. ResultsDisplay.tsx
결과 표시 - PM2.5 수치와 AQI 레벨 표시

**Props**:
```typescript
interface ResultsDisplayProps {
  prediction: PM25Prediction;
  onClose: () => void;
}
```

**Features**:
- Large circular display (w-48 h-48)
- Color-coded AQI levels
- Health recommendations
- Continue button

### 4. HistoryView.tsx
측정 기록 - 모든 과거 측정 데이터 표시

**Props**:
```typescript
interface HistoryViewProps {
  onBack: () => void;
}
```

**Features**:
- History cards with PM2.5 values
- Sync status indicators
- GitHub sync button
- Empty state handling

### 5. SettingsView.tsx
설정 화면 - 앱 설정 및 GitHub 연동

**Props**:
```typescript
interface SettingsViewProps {
  onBack: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}
```

**Features**:
- Dark mode toggle
- GitHub integration status
- Data management (sync, clear, export)
- About information

---

## 🧠 핵심 서비스

### airQualityService.ts
이미지 분석 알고리즘

**주요 함수**:
```typescript
export async function analyzeSkyImage(
  imageDataUrl: string
): Promise<PM25Prediction>
```

**알고리즘**:
1. Canvas에 이미지 로드
2. 픽셀 데이터 추출
3. 밝기, 채도, Blue 비율 계산
4. PM2.5 추정 공식 적용
5. Confidence score 계산

### storageManager.ts
저장소 관리 오케스트레이터

**주요 메서드**:
```typescript
class StorageManager {
  async initialize(): Promise<void>
  async saveRecord(prediction: PM25Prediction): Promise<HistoryRecord>
  getHistory(): HistoryRecord[]
  async syncToGitHub(): Promise<void>
  clearLocalData(): void
}
```

### githubStorage.ts
GitHub API 연동

**주요 메서드**:
```typescript
class GitHubStorage {
  async fetchData(): Promise<HistoryRecord[]>
  async addRecord(prediction: PM25Prediction): Promise<void>
  async updateHistory(records: HistoryRecord[]): Promise<void>
  async checkConnection(): Promise<boolean>
}
```

### localStorage.ts
브라우저 로컬 저장소

**주요 함수**:
```typescript
export const localStorageService = {
  saveHistory(records: HistoryRecord[]): void
  loadHistory(): HistoryRecord[]
  saveSettings(settings: Settings): void
  loadSettings(): Settings
  clearHistory(): void
  clearSettings(): void
}
```

---

## 🎨 스타일 가이드

### Tailwind 커스텀 설정

`tailwind.config.js`에서 iOS 색상 정의:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        ios: {
          blue: '#007AFF',
          green: '#34C759',
          yellow: '#FFCC00',
          orange: '#FF9500',
          red: '#FF3B30',
          purple: '#AF52DE',
          teal: '#5AC8FA',
        }
      }
    }
  }
}
```

### CSS 변수 (`index.css`)

```css
:root {
  --brand-blue: #007AFF;
  --brand-green: #34C759;
  --brand-yellow: #FFCC00;
  --brand-orange: #FF9500;
  --brand-red: #FF3B30;
  --brand-purple: #AF52DE;
  --brand-teal: #5AC8FA;
}
```

### 애니메이션

```css
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

---

## 🔧 개발 팁

### Hot Reload
Vite는 파일 변경 시 자동으로 브라우저를 새로고침합니다.

### TypeScript 타입 체크
```bash
npx tsc --noEmit
```

### 코드 포맷팅
Tailwind CSS IntelliSense 확장 프로그램 추천

### 디버깅
- React DevTools 사용
- Console.log 대신 debugger 사용
- Network 탭에서 API 호출 확인

---

## 📦 빌드 및 배포

### 로컬 빌드
```bash
npm run build
```

결과물: `dist/` 폴더

### GitHub Pages 배포
루트 디렉토리의 `.github/workflows/deploy.yml`이 자동 배포를 처리합니다.

main 브랜치에 푸시하면 자동 빌드 및 배포됩니다.

### 수동 배포
```bash
npm run build
# dist/ 폴더를 원하는 호스팅 서비스에 업로드
```

---

## 🐛 트러블슈팅

### 빌드 에러

**문제**: `Module not found`
**해결**: `npm install` 다시 실행

**문제**: TypeScript 에러
**해결**: `tsconfig.json` 확인, 타입 정의 확인

### 런타임 에러

**문제**: GitHub API 연결 실패
**해결**: `.env` 파일의 토큰 확인, 인터넷 연결 확인

**문제**: 카메라 접근 거부
**해결**: HTTPS 사용 확인, 브라우저 권한 설정 확인

**문제**: 위치 정보 접근 거부
**해결**: 브라우저 위치 권한 확인, HTTPS 사용 확인

---

## 📚 추가 문서

프로젝트 루트의 `FineD_App/` 폴더를 참조하세요:

- **AirLens_iOS_PRD.md** - 전체 제품 요구사항 문서
  - 기능 명세
  - 기술 아키텍처
  - 데이터 모델
  - 보안 및 프라이버시
  - 사용자 흐름
  - 배포 전략
  - 향후 로드맵

---

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. Feature branch 생성
3. 코드 작성 및 테스트
4. Pull Request 제출

---

## 📄 라이선스

MIT License

---

**개발자**: joymin5655
**GitHub**: [@joymin5655](https://github.com/joymin5655)

---

Made with ❤️ for clean air monitoring
