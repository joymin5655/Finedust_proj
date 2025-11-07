# AirLens - Product Requirements Document (PRD)

## 📱 Product Overview

**Product Name**: AirLens
**Version**: 1.0
**Platform**: Progressive Web App (iOS-focused design)
**Target Users**: 일반 사용자, 환경 의식이 있는 개인, 대기질에 관심 있는 사람들

### Executive Summary

AirLens는 외부 AI API 없이 완전히 독립적으로 동작하는 대기질 측정 Progressive Web App입니다. 사용자는 카메라로 하늘 사진을 촬영하면 브라우저 기반 이미지 분석을 통해 PM2.5 수치를 즉시 확인할 수 있습니다. GitHub를 주 데이터 저장소로 사용하며, 오프라인에서도 완벽하게 작동합니다.

---

## 🎯 Core Value Propositions

### 1. 완전한 프라이버시
- ❌ 외부 AI API 불필요 (Gemini, OpenAI 등 사용 안 함)
- ❌ 서버로 이미지 전송 안 함
- ✅ 100% 클라이언트 사이드 분석
- ✅ 사용자 데이터가 외부로 나가지 않음

### 2. 오프라인 우선 설계
- 인터넷 연결 없이도 대기질 측정 가능
- 로컬 저장 후 자동 동기화
- PWA로 설치하여 네이티브 앱처럼 사용

### 3. GitHub 기반 데이터 관리
- GitHub를 주 데이터 저장소로 활용
- 무료 클라우드 스토리지
- 버전 관리와 백업 자동화
- 여러 기기 간 동기화

---

## 🎨 Design Philosophy

### iOS-Inspired Design System

**Color Palette**:
- Primary Blue: `#007AFF` (iOS standard blue)
- Success Green: `#34C759`
- Warning Yellow: `#FFCC00`
- Danger Red: `#FF3B30`
- Purple Accent: `#AF52DE`
- Teal Accent: `#5AC8FA`

**Typography**:
- Font Family: SF Pro Display (Apple's system font)
- Letter spacing: `-0.01em` for tighter, more refined look
- Font weights: Regular (400), Semibold (600), Bold (700)

**Visual Elements**:
- Border radius: `rounded-2xl` (16px), `rounded-3xl` (24px)
- Backdrop blur for glassmorphism effects
- Gradient backgrounds and buttons
- Smooth cubic-bezier animations: `cubic-bezier(0.16, 1, 0.3, 1)`
- Large, bold typography for emphasis
- Generous white space and padding

---

## 🚀 Core Features

### 1. 포트폴리오 랜딩 페이지

**목적**:
- 앱의 모든 기능을 소개하는 showcase 페이지
- 포트폴리오로 활용 가능한 전문적인 프레젠테이션
- 사용자에게 첫인상 제공

**주요 섹션**:

#### Hero Section
- 대형 타이틀 애니메이션 (최대 8xl)
- 핵심 가치 제안 표시
- 통계 배지: "0 External APIs • 100% Privacy • Works Offline"
- 2개의 CTA 버튼:
  - Primary: "Launch App" (앱 실행)
  - Secondary: "Learn More" (스크롤 다운)
- Animated 그라디언트 배경 효과
- 스크롤 인디케이터

#### Features Showcase (6개 기능 카드)
1. **Camera Analysis**
   - Icon: 📷
   - Gradient: Blue (from-blue-500 to-blue-600)
   - Description: 하늘 사진 촬영으로 PM2.5 즉시 측정

2. **Station Data**
   - Icon: 📡 Signal Tower
   - Gradient: Purple (from-purple-500 to-purple-600)
   - Description: 시뮬레이션된 측정소 데이터 제공

3. **Location Tracking**
   - Icon: 📍 Map Pin
   - Gradient: Green (from-green-500 to-green-600)
   - Description: OpenStreetMap 기반 자동 위치 인식

4. **Measurement History**
   - Icon: 📜 History
   - Gradient: Orange (from-orange-500 to-orange-600)
   - Description: 모든 측정 기록 타임스탬프와 함께 저장

5. **GitHub Sync**
   - Icon: ☁️ Cloud Sync
   - Gradient: Teal (from-teal-500 to-teal-600)
   - Description: GitHub에 자동 백업 및 기기 간 동기화

6. **PWA Support**
   - Icon: 📱
   - Gradient: Pink (from-pink-500 to-pink-600)
   - Description: 홈 화면에 설치 가능, 오프라인 동작

#### How It Works (3단계)
1. **Capture** - 카메라로 하늘 촬영 또는 이미지 업로드
2. **Analyze** - 로컬 AI가 밝기, 채도, 색상 분석
3. **Results** - 즉시 AQI 결과 및 권장사항 표시

#### Technology Stack Display
- React 19, TypeScript, Vite 6, Tailwind CSS
- Canvas API, PWA, GitHub API, LocalStorage
- 8개 기술 뱃지 그리드 레이아웃

#### CTA Section
- 그라디언트 배경 (blue-600 to purple-600)
- "Ready to Check Your Air Quality?" 헤드라인
- "Launch AirLens Now" 버튼

#### Footer
- "Made with ❤️ by joymin5655"
- GitHub 링크
- "No External AI APIs Required • 100% Privacy"

---

### 2. 카메라 뷰 (CameraView)

**위치**: 앱 메인 화면

#### 헤더
- 앱 이름: "AirLens" (text-3xl, bold)
- 설정 버튼 (우측 상단)
  - 둥근 버튼 (rounded-2xl)
  - 반투명 배경 (bg-white/10 backdrop-blur-md)
  - Hover 효과 (hover:bg-white/20)
  - Active scale 효과 (active:scale-95)

#### 위치 정보 디스플레이
- 국기 이모지 (text-4xl)
- 국가명 (text-xl, bold)
- 도시명 (text-sm, text-gray-300)
- 자동 위치 감지 (Geolocation API)
- Reverse geocoding (OpenStreetMap Nominatim API)

#### 카메라 인터페이스
**2개의 액션 버튼**:

1. **Capture 버튼**
   - 그라디언트 배경 (from-blue-500 to-blue-600)
   - 카메라 아이콘 + "Capture" 텍스트
   - 높이: h-14
   - Hover: shadow-xl, scale-[1.02]
   - Active: scale-[0.98]
   - 모바일에서 후면 카메라 우선

2. **Upload 버튼**
   - 그라디언트 배경 (from-purple-500 to-purple-600)
   - 업로드 아이콘 + "Upload" 텍스트
   - File input으로 이미지 선택
   - Accept: image/*

#### 이미지 분석 중 로딩 상태
- 풀스크린 오버레이 (bg-black/80 backdrop-blur-xl)
- 큰 스피너 (w-20 h-20, border-4)
- "Analyzing Air Quality..." 메시지
- "This takes just a moment" 서브텍스트

#### 측정소 데이터 섹션
- 카드 디자인 (rounded-2xl, bg-white/5)
- "Nearby Station" 헤더
- 현재 시간 기반 시뮬레이션 데이터
- PM2.5, PM10, O3, NO2, SO2, CO 수치
- 각 오염물질별 색상 코드

#### 히스토리 버튼
- "View History" 텍스트 버튼
- 하단에 위치
- 히스토리 뷰로 네비게이션

---

### 3. 결과 디스플레이 (ResultsDisplay)

**위치**: 측정 완료 후 모달 또는 전체 화면

#### Hero Display
- **대형 원형 디스플레이** (w-48 h-48, 192px × 192px)
  - 그라디언트 테두리 (AQI 레벨에 따라 변경)
  - 배경: bg-gradient-to-br
  - Border: border-4 border-white/10
  - Shadow: shadow-2xl

- **PM2.5 수치** (text-7xl, 5rem)
  - 굵은 폰트 (font-bold)
  - White color with drop-shadow-2xl
  - 소수점 없이 정수로 표시

- **단위** (μg/m³)
  - text-base, font-semibold
  - text-white/80
  - 수치 아래 작게 표시

#### AQI 레벨 표시
**6단계 대기질 수준**:

1. **Good (좋음)** - 0-30 μg/m³
   - Color: Green (#34C759)
   - Ring: from-green-400 to-green-500
   - Button: from-green-500 to-green-600
   - Message: "공기가 깨끗합니다"

2. **Moderate (보통)** - 31-80 μg/m³
   - Color: Yellow (#FFCC00)
   - Ring: from-yellow-400 to-yellow-500
   - Button: from-yellow-500 to-yellow-600
   - Message: "보통 수준의 대기질입니다"

3. **Unhealthy for Sensitive (민감군 나쁨)** - 81-150 μg/m³
   - Color: Orange (#FF9500)
   - Ring: from-orange-400 to-orange-500
   - Button: from-orange-500 to-orange-600
   - Message: "민감군은 주의하세요"

4. **Unhealthy (나쁨)** - 151-200 μg/m³
   - Color: Red (#FF3B30)
   - Ring: from-red-400 to-red-500
   - Button: from-red-500 to-red-600
   - Message: "외출을 자제하세요"

5. **Very Unhealthy (매우 나쁨)** - 201-300 μg/m³
   - Color: Purple (#AF52DE)
   - Ring: from-purple-400 to-purple-500
   - Button: from-purple-500 to-purple-600
   - Message: "실외활동을 피하세요"

6. **Hazardous (위험)** - 301+ μg/m³
   - Color: Brown (#8B4513)
   - Ring: from-red-600 to-red-700
   - Button: from-red-700 to-red-800
   - Message: "긴급 상황입니다"

#### Continue 버튼
- 풀 너비 (w-full)
- 높이: py-4
- 그라디언트 배경 (AQI 레벨에 맞춤)
- Hover: scale-[1.02]
- Active: scale-[0.98]
- 클릭 시 카메라 뷰로 복귀

---

### 4. 히스토리 뷰 (HistoryView)

**위치**: 히스토리 버튼 클릭 시

#### 헤더
- 제목: "History" (text-2xl, bold)
- 뒤로가기 버튼 (좌측)
- GitHub 동기화 버튼 (우측)
  - 클라우드 아이콘
  - 동기화 중 회전 애니메이션 (animate-spin)
  - 배경: bg-blue-500
  - Hover: bg-blue-600

#### 히스토리 카드 리스트
**각 카드 정보**:
- 측정 날짜 및 시간 (상대 시간 표시)
  - 예: "2 hours ago", "3 days ago"
- PM2.5 수치 (text-4xl, bold)
- AQI 레벨 배지 (Good, Moderate, etc.)
- 위치 정보 (국가, 도시)
- 동기화 상태 아이콘 (✓ 또는 ↻)

**카드 디자인**:
- padding: p-5
- Border radius: rounded-2xl
- 배경: bg-white dark:bg-gray-800
- 그림자: shadow-lg
- Border: border border-gray-100
- Hover 효과:
  - shadow-2xl
  - scale-[1.01]
- Active 효과:
  - scale-[0.99]
- Cursor: pointer

#### 상태 처리
- **로딩 중**: 스켈레톤 로더 또는 스피너
- **빈 히스토리**: 안내 메시지 표시
  - "No measurements yet"
  - "Take your first photo to get started!"
- **에러 상태**: 에러 메시지 및 재시도 버튼

#### 정렬 및 필터
- 최신순 정렬 (기본)
- 동기화된 항목 / 로컬 항목 필터 (선택사항)

---

### 5. 설정 뷰 (SettingsView)

**위치**: 설정 버튼 클릭 시

#### 헤더
- 제목: "Settings" (text-2xl, bold)
- 뒤로가기 버튼

#### 설정 섹션들

##### 1. Appearance (외관)
**설정 카드**:
- 제목: "Appearance" (text-xl, bold)
- Dark Mode 토글
  - 스위치 UI
  - 라벨: "Dark Mode"
  - 상태: localStorage에 저장
  - 실시간 테마 변경

##### 2. GitHub Integration (GitHub 연동)
**설정 카드**:
- 제목: "GitHub Integration"
- 연동 상태 표시
  - ✅ Connected: GitHub username 표시
  - ❌ Not Connected: "Connect GitHub" 버튼

**환경 변수 안내**:
```
VITE_GITHUB_TOKEN=your_token
VITE_GITHUB_OWNER=your_username
VITE_GITHUB_REPO=your_repo
```

- GitHub Token 발급 링크
- 설정 방법 안내

##### 3. Data Management (데이터 관리)
**설정 카드**:
- 제목: "Data Management"

**버튼들**:
1. **Sync Now**
   - GitHub와 즉시 동기화
   - 로딩 상태 표시
   - 성공/실패 토스트 메시지

2. **Clear Local Data**
   - localStorage 데이터 삭제
   - 확인 대화상자
   - "Are you sure?" 메시지
   - GitHub 데이터는 유지

3. **Export Data**
   - JSON 파일로 다운로드
   - 모든 측정 기록 포함
   - 파일명: `airlens-history-${date}.json`

##### 4. About (정보)
**설정 카드**:
- 앱 이름: AirLens
- 버전: 1.0.0
- GitHub 링크
- 라이선스: MIT
- 개발자: joymin5655

---

## 🧠 기술 아키텍처

### Frontend Stack

```typescript
// 주요 라이브러리
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "typescript": "~5.8.2",
  "vite": "^6.2.0",
  "tailwindcss": "^3.3.2"
}
```

### 이미지 분석 알고리즘

**위치**: `src/services/airQualityService.ts`

#### 분석 단계

1. **Image Loading**
   ```typescript
   const img = new Image();
   img.src = imageDataUrl;
   await img.decode();
   ```

2. **Canvas Processing**
   ```typescript
   const canvas = document.createElement('canvas');
   const ctx = canvas.getContext('2d');
   ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
   ```

3. **Pixel Analysis**
   - 모든 픽셀 RGB 값 추출
   - 밝기 계산: `(R + G + B) / 3`
   - 채도 계산: `Math.max(R, G, B) - Math.min(R, G, B)`
   - Blue 채널 비율: `B / (R + G + B)`

4. **PM2.5 추정 공식**
   ```typescript
   // Base calculation
   let pm25 = 150 - (avgBrightness * 0.5);

   // Saturation adjustment
   pm25 += (avgSaturation * 0.3);

   // Blue channel adjustment (higher blue = clearer sky)
   pm25 -= (blueRatio * 50);

   // Add randomness for realism
   pm25 += (Math.random() - 0.5) * 20;

   // Clamp between 10 and 300
   pm25 = Math.max(10, Math.min(300, pm25));
   ```

**알고리즘 가정**:
- 밝은 이미지 = 맑은 하늘 = 낮은 PM2.5
- 높은 채도 = 오염된 하늘 (갈색/회색 톤)
- 높은 Blue 비율 = 깨끗한 하늘

**제한사항**:
- 실제 대기질 측정기와 정확도 차이
- 조명, 시간, 날씨에 영향받음
- 교육 및 참고 목적으로 사용

---

### 데이터 저장 아키텍처

#### 3-Layer Storage System

```
User Action
    ↓
StorageManager (Orchestrator)
    ↓
    ├─→ GitHub Storage (Primary)
    │   └─→ GitHub API
    │
    └─→ localStorage (Cache/Fallback)
```

#### StorageManager
**위치**: `src/services/storageManager.ts`

**주요 메서드**:

```typescript
class StorageManager {
  // 초기화 - GitHub에서 데이터 로드
  async initialize(): Promise<void>

  // 새 측정 저장
  async saveRecord(prediction: PM25Prediction): Promise<HistoryRecord>

  // 히스토리 가져오기
  getHistory(): HistoryRecord[]

  // GitHub 동기화
  async syncToGitHub(): Promise<void>

  // 로컬 데이터 삭제
  clearLocalData(): void
}
```

**동작 원리**:

1. **온라인 모드**:
   - 측정 시 즉시 GitHub에 저장
   - localStorage에 캐시 저장
   - `synced: true` 플래그 설정

2. **오프라인 모드**:
   - localStorage에만 저장
   - `synced: false` 플래그 설정
   - 온라인 복귀 시 자동 동기화

3. **초기 로드**:
   - GitHub에서 데이터 fetch
   - localStorage와 병합
   - 중복 제거 (timestamp 기준)

#### GitHub Storage
**위치**: `src/services/githubStorage.ts`

**GitHub API 사용**:
- Endpoint: `https://api.github.com/repos/{owner}/{repo}/contents/data/history.json`
- Method: GET (read), PUT (write)
- Authentication: Personal Access Token

**데이터 구조**:
```json
{
  "version": "1.0",
  "records": [
    {
      "id": "uuid-string",
      "timestamp": 1699999999999,
      "prediction": {
        "pm25": 45.2,
        "confidence": 0.85,
        "imageUrl": "data:image/jpeg;base64,..."
      },
      "location": {
        "latitude": 37.5665,
        "longitude": 126.9780,
        "country": "South Korea",
        "city": "Seoul"
      },
      "synced": true
    }
  ]
}
```

**주요 메서드**:
```typescript
// 데이터 가져오기
async fetchData(): Promise<HistoryRecord[]>

// 레코드 추가
async addRecord(prediction: PM25Prediction): Promise<void>

// 전체 히스토리 업데이트
async updateHistory(records: HistoryRecord[]): Promise<void>

// 연결 상태 확인
async checkConnection(): Promise<boolean>
```

#### localStorage Service
**위치**: `src/services/localStorage.ts`

**저장 키**:
- `airlens_history`: 측정 기록 배열
- `airlens_settings`: 앱 설정 (dark mode, etc.)

**주요 메서드**:
```typescript
// 히스토리 저장/로드
saveHistory(records: HistoryRecord[]): void
loadHistory(): HistoryRecord[]

// 설정 저장/로드
saveSettings(settings: Settings): void
loadSettings(): Settings

// 데이터 삭제
clearHistory(): void
clearSettings(): void
```

---

### 위치 서비스

#### Geolocation API
```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // Reverse geocoding...
  },
  (error) => {
    console.error('Location error:', error);
  }
);
```

#### Reverse Geocoding
**API**: OpenStreetMap Nominatim
**Endpoint**: `https://nominatim.openstreetmap.org/reverse`

**요청 예시**:
```typescript
const url = `https://nominatim.openstreetmap.org/reverse?` +
  `format=json&lat=${latitude}&lon=${longitude}`;

const response = await fetch(url);
const data = await response.json();

const location = {
  country: data.address.country,
  city: data.address.city || data.address.town,
  flag: getFlagEmoji(data.address.country_code)
};
```

**국기 이모지 생성**:
```typescript
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
```

---

### PWA 구성

#### Service Worker
**위치**: `public/sw.js`

**캐싱 전략**:
1. **Static Assets**: Cache First
   - HTML, CSS, JS 파일
   - 이미지, 폰트

2. **API Requests**: Network First
   - GitHub API 호출
   - Geocoding API 호출

3. **Offline Fallback**: Cache Only
   - 오프라인 페이지
   - 기본 아이콘

#### Web App Manifest
**위치**: `public/manifest.json`

```json
{
  "name": "AirLens - AI Air Quality Monitor",
  "short_name": "AirLens",
  "description": "AI-powered air quality monitoring without external APIs",
  "theme_color": "#007AFF",
  "background_color": "#000000",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 📊 Data Models

### TypeScript 인터페이스

```typescript
// src/types/index.ts

export interface PM25Prediction {
  pm25: number;           // PM2.5 concentration (μg/m³)
  confidence: number;     // Confidence score (0-1)
  imageUrl: string;       // Base64 encoded image
}

export interface Location {
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  flag?: string;         // Flag emoji
}

export interface HistoryRecord {
  id: string;            // UUID
  timestamp: number;     // Unix timestamp
  prediction: PM25Prediction;
  location: Location;
  synced: boolean;       // GitHub sync status
}

export interface Settings {
  darkMode: boolean;
  githubConnected: boolean;
  githubUsername?: string;
}

export type View = 'camera' | 'history' | 'settings';

export interface AQILevel {
  name: string;          // e.g., "Good", "Moderate"
  color: string;         // Tailwind color class
  textColor: string;
  ringGradient: string;
  buttonGradient: string;
  message: string;
}
```

---

## 🔒 보안 및 프라이버시

### 데이터 보호
1. **이미지 처리**:
   - 모든 이미지 분석은 클라이언트에서 수행
   - 서버로 전송되지 않음
   - Base64로 인코딩하여 localStorage/GitHub에만 저장

2. **GitHub Token**:
   - 환경 변수로만 관리 (.env)
   - .gitignore에 추가
   - 클라이언트에서만 사용 (서버 없음)
   - Repository scope만 필요

3. **위치 정보**:
   - 사용자 명시적 동의 필요
   - Geolocation API 권한 요청
   - 거부 시 수동 입력 가능

### 보안 모범 사례
- ✅ HTTPS only (GitHub Pages 기본)
- ✅ Content Security Policy
- ✅ No external tracking
- ✅ No cookies
- ✅ No third-party analytics

---

## 📱 사용자 흐름 (User Flow)

### 첫 방문자 (New User)

```
1. 랜딩 페이지 도착
   ↓
2. Features 섹션 탐색
   ↓
3. "Launch App" 버튼 클릭
   ↓
4. 카메라 뷰 진입
   ↓
5. 위치 권한 요청 (선택)
   ↓
6. "Capture" 또는 "Upload" 선택
   ↓
7. 이미지 분석 (로딩)
   ↓
8. 결과 표시
   ↓
9. "Continue" → 다시 측정 또는 히스토리 확인
```

### 재방문자 (Returning User)

```
1. 랜딩 페이지 또는 직접 앱 접근
   ↓
2. 이전 측정 기록 자동 로드 (GitHub)
   ↓
3. 새 측정 수행 또는 히스토리 확인
   ↓
4. GitHub 자동 동기화
```

### 오프라인 사용자

```
1. 오프라인 상태에서 앱 접근
   ↓
2. Service Worker가 캐시된 앱 로드
   ↓
3. 측정 수행 (이미지 분석은 로컬에서 가능)
   ↓
4. localStorage에만 저장 (synced: false)
   ↓
5. 온라인 복귀 시
   ↓
6. 자동으로 GitHub 동기화
```

---

## 🚀 배포 전략

### GitHub Pages + GitHub Actions

**워크플로우**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
```

### 배포 URL
- Production: `https://joymin5655.github.io/Finedust_proj/`
- Branch Previews: 없음 (main만 배포)

---

## 🧪 테스트 전략

### Manual Testing Checklist

#### 기능 테스트
- [ ] 랜딩 페이지 모든 버튼 작동
- [ ] 카메라 캡처 기능
- [ ] 이미지 업로드 기능
- [ ] 이미지 분석 알고리즘
- [ ] 결과 표시 및 AQI 레벨 정확성
- [ ] 히스토리 저장 및 로드
- [ ] GitHub 동기화
- [ ] 오프라인 모드
- [ ] Dark mode 토글
- [ ] 위치 감지

#### 브라우저 호환성
- [ ] Chrome (최신)
- [ ] Safari (iOS 포함)
- [ ] Firefox
- [ ] Edge

#### 디바이스 테스트
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px)
- [ ] Mobile (375px, 414px)
- [ ] iOS Safari
- [ ] Android Chrome

#### PWA 테스트
- [ ] 홈 화면에 추가
- [ ] 오프라인 동작
- [ ] 푸시 알림 (미구현)

---

## 📈 성능 목표

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Bundle Size
- Main JS: < 250KB (gzipped)
- CSS: < 50KB (gzipped)
- Total: < 300KB

### 로딩 최적화
- Code splitting
- Lazy loading for images
- Service Worker caching
- Preconnect to APIs

---

## 🔮 향후 로드맵

### Phase 2 (v2.0)
- [ ] 실제 대기질 측정소 API 연동 (선택적)
- [ ] 머신러닝 모델 개선 (TensorFlow.js)
- [ ] 다국어 지원 (i18n)
- [ ] 소셜 공유 기능
- [ ] 위젯 뷰 (작은 화면용)

### Phase 3 (v3.0)
- [ ] 실시간 대기질 지도
- [ ] 커뮤니티 측정 데이터 공유
- [ ] Apple HealthKit 연동
- [ ] 알림 및 경고 시스템
- [ ] 데이터 분석 및 트렌드

### 장기 비전
- 글로벌 대기질 모니터링 커뮤니티
- 크라우드소싱 데이터로 정확도 향상
- 환경 보호 캠페인 통합
- 교육 기관과 파트너십

---

## 📝 개발 가이드

### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/joymin5655/Finedust_proj.git
cd Finedust_proj

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집하여 GitHub token 입력

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview
```

### 코딩 컨벤션

**TypeScript**:
- Strict mode 활성화
- Explicit types for all function signatures
- No `any` types (use `unknown` instead)

**React**:
- Functional components only
- Hooks for state management
- Props interface for all components

**CSS (Tailwind)**:
- Utility-first approach
- Custom classes only when necessary
- Dark mode variants for all UI

**File Structure**:
```
src/
├── components/      # React components
├── services/        # Business logic
├── types/          # TypeScript interfaces
├── utils/          # Helper functions
├── App.tsx         # Main app component
├── main.tsx        # Entry point
└── index.css       # Global styles
```

---

## 🤝 기여 가이드

### 버그 리포트
- GitHub Issues 사용
- 재현 단계 상세히 기술
- 스크린샷 첨부

### 기능 제안
- Discussion에서 먼저 논의
- Use case 설명
- UI mockup (선택)

### Pull Request
1. Fork the repository
2. Create feature branch
3. Commit with clear messages
4. Write tests (if applicable)
5. Submit PR with description

---

## 📞 연락처 및 리소스

**개발자**: joymin5655
**GitHub**: [@joymin5655](https://github.com/joymin5655)
**Repository**: [Finedust_proj](https://github.com/joymin5655/Finedust_proj)

**문서 링크**:
- [User Guide](./USER_GUIDE.md) - 사용자 가이드 (작성 예정)
- [API Documentation](./API.md) - API 문서 (작성 예정)
- [Architecture](./ARCHITECTURE.md) - 아키텍처 문서 (작성 예정)

---

## 📜 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

**Last Updated**: 2025-11-06
**Document Version**: 1.0
**App Version**: 1.0.0

---

Made with ❤️ for clean air and privacy-focused development
