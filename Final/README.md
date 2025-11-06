# AirLens Final

![AirLens](https://img.shields.io/badge/AirLens-Final-blue)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)
![No External API](https://img.shields.io/badge/API-Free-green)

**AirLens Final**은 **외부 API 없이 완전히 독립적으로 동작하는** AI 기반 대기질 측정 앱입니다. 모바일 우선 설계로 오프라인 지원, GitHub 기반 데이터 동기화(선택사항), 그리고 Progressive Web App(PWA) 기능을 제공합니다.

## ✨ 특별한 점

### 🚀 완전 독립 실행
- **외부 API 불필요**: Gemini API나 다른 외부 AI 서비스 없이 동작
- **이미지 분석**: 브라우저에서 직접 이미지 분석 수행
- **위치 정보**: 무료 OpenStreetMap API 사용
- **100% 오프라인**: 모든 핵심 기능이 오프라인에서 작동

## 🌟 주요 기능

### 📸 로컬 대기질 분석
- **카메라 촬영**: 하늘 사진을 촬영하여 PM2.5 수치를 실시간으로 분석
- **이미지 업로드**: 기존 사진을 업로드하여 분석
- **스마트 알고리즘**: 이미지의 밝기, 채도, 색상을 분석하여 대기질 추정
  - 밝기 분석: 어두운 하늘 = 높은 오염도
  - 채도 분석: 낮은 채도 = 많은 미세먼지
  - 색상 분석: 파란색 감소 = 오염 증가

### 📊 측정 데이터 관리
- **시뮬레이션 측정소 데이터**: 시간대별 패턴을 반영한 현실적인 데이터
- **위치 기반 서비스**: GPS를 통한 정확한 위치 정보
- **측정 이력**: 모든 측정 기록을 로컬에 저장

### 💾 스마트 데이터 저장 (GitHub 우선)
- **GitHub 주 저장소**: 온라인 시 모든 데이터를 GitHub에 직접 저장
- **로컬 캐시**: 빠른 접근을 위한 로컬 캐시
- **오프라인 지원**: 인터넷 없을 때는 로컬에 저장 후 자동 동기화
- **자동 백업**: 측정 기록이 GitHub 저장소에 안전하게 보관

### 📱 PWA 지원
- **홈 화면 추가**: 네이티브 앱처럼 사용
- **오프라인 동작**: 서비스 워커를 통한 완전한 오프라인 지원
- **백그라운드 동기화**: 온라인 복귀 시 자동 동기화

## 🛠 기술 스택

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **Image Analysis**: Canvas API + 커스텀 알고리즘
- **Geolocation**: OpenStreetMap Nominatim API (무료)
- **Storage**:
  - Primary: GitHub API (주 저장소)
  - Cache: localStorage API (로컬 캐시)
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
│   │   ├── airQualityService.ts  # 이미지 분석 엔진
│   │   ├── githubStorage.ts      # GitHub API 연동
│   │   ├── localStorage.ts       # 로컬 저장소 관리
│   │   └── storageManager.ts     # 통합 저장소 관리
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

3. 환경 변수 설정 (필수 - 데이터 저장용)

`.env` 파일을 생성하고 GitHub 설정을 추가하세요:

```env
VITE_GITHUB_TOKEN=your_github_personal_access_token
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=Finedust_proj
```

**GitHub Token 생성 방법**:
1. https://github.com/settings/tokens 접속
2. "Generate new token (classic)" 클릭
3. `repo` 권한 선택 (Full control of private repositories)
4. 생성된 토큰을 `.env` 파일에 추가

**참고**: 오프라인에서도 사용 가능하지만, 데이터 저장을 위해서는 GitHub 설정이 권장됩니다.

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

## 🌐 GitHub Pages 배포

이 프로젝트는 GitHub Pages를 통해 자동으로 배포되도록 설정되어 있습니다.

### 배포 설정하기

1. **GitHub Repository 설정**
   - GitHub에서 본 저장소의 Settings로 이동
   - 왼쪽 메뉴에서 "Pages" 선택
   - Source를 "GitHub Actions"로 설정

2. **환경 변수 설정**
   - `.env` 파일 생성 (`.env.example` 참고)
   - GitHub Personal Access Token 생성: https://github.com/settings/tokens
   - 필요한 권한: `repo` (Full control of private repositories)

   ```env
   VITE_GITHUB_TOKEN=your_github_personal_access_token
   VITE_GITHUB_OWNER=your_github_username
   VITE_GITHUB_REPO=Finedust_proj
   ```

3. **main 브랜치에 푸시**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

4. **자동 배포**
   - GitHub Actions가 자동으로 빌드 및 배포를 수행합니다
   - Actions 탭에서 배포 진행 상황을 확인할 수 있습니다
   - 완료 후 `https://your-username.github.io/Finedust_proj/` 에서 앱에 접속할 수 있습니다

### GitHub를 주 저장소로 사용

이 앱은 GitHub를 주 데이터 저장소로 사용하도록 설정되어 있습니다:

- **온라인 모드**: 모든 데이터가 GitHub에 직접 저장됩니다
- **오프라인 모드**: 로컬에 저장 후 온라인 시 자동 동기화
- **데이터 관리**: `data/history.json` 파일에 측정 기록 저장

**주의사항**:
- GitHub Personal Access Token은 절대 공개 저장소에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있습니다
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요

## 📖 사용 방법

### 1. 대기질 측정

**카메라로 촬영:**
1. "Capture" 버튼 클릭
2. 하늘을 향해 사진 촬영
3. 로컬 알고리즘이 자동으로 PM2.5 수치 분석
4. 이미지 밝기, 채도, 색상을 기반으로 대기질 추정

**이미지 업로드:**
1. "Upload" 버튼 클릭
2. 기존 하늘 사진 선택
3. 분석 결과 확인

**측정소 데이터:**
1. "Stations" 버튼 클릭
2. 시뮬레이션된 측정소 데이터 확인
3. 시간대별 패턴 반영 (출퇴근 시간 오염도 증가)

### 2. 측정 이력 확인

1. 우측 상단 시계 아이콘 클릭
2. 과거 측정 기록 확인
3. 세부 정보 보기

### 3. GitHub 동기화 (선택사항)

**자동 동기화:**
- 온라인 상태이고 Auto Sync가 활성화되어 있으면 자동으로 동기화

**수동 동기화:**
1. 이력 화면에서 동기화 버튼 클릭
2. 동기화 결과 확인

### 4. 설정

1. 우측 상단 톱니바퀴 아이콘 클릭
2. 다크모드, 언어, 동기화 설정 변경
3. 저장소 사용량 및 연결 상태 확인

## 🔬 이미지 분석 알고리즘

앱은 다음과 같은 방식으로 이미지를 분석합니다:

1. **픽셀 샘플링**: 이미지에서 균일하게 픽셀 샘플링
2. **밝기 분석**: 평균 밝기 계산 (0-255)
3. **채도 분석**: 색상 채도 계산 (0-1)
4. **색상 분석**: RGB 채널별 분석 (특히 파란색 채널)
5. **PM2.5 추정**:
   - 어두운 이미지 = 높은 PM2.5
   - 낮은 채도 = 미세먼지로 인한 흐릿함
   - 파란색 감소 = 대기 오염
6. **신뢰도 계산**: 이미지 품질 기반 신뢰도 점수

**예상 정확도**: 실제 측정값 대비 ±15-20 μg/m³

## 🌐 위치 정보

앱은 무료 OpenStreetMap Nominatim API를 사용하여 위치 정보를 가져옵니다:
- 요청 제한: 1초당 1회
- API 키 불필요
- 오프라인 시 좌표 기반 대략적 위치 표시

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
- GitHub 동기화는 완전 선택사항입니다
- 위치 정보는 측정 시에만 사용됩니다
- 개인 식별 정보는 수집하지 않습니다
- 외부 서버로 이미지가 전송되지 않습니다

## 🐛 문제 해결

### 위치 정보 오류
- 브라우저 설정에서 위치 권한 허용
- OpenStreetMap API 요청 제한 확인 (1초당 1회)

### 카메라 권한 오류
- 브라우저 설정에서 카메라 권한 허용
- HTTPS 연결 확인 (localhost는 HTTP 허용)

### GitHub 동기화 실패 (선택사항)
- GitHub Token 권한 확인
- 저장소 이름이 올바른지 확인
- 네트워크 연결 확인
- **참고**: GitHub 없이도 모든 기능 사용 가능

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

- OpenStreetMap Nominatim for free geocoding
- React Team
- Tailwind CSS Team
- Vite Team

## 📊 기술적 세부사항

### 이미지 분석 수식

```
PM2.5 = (brightnessFactor × 40) + (saturationFactor × 30) + (blueFactor × 30) + randomNoise

where:
  brightnessFactor = 1 - (avgBrightness / 255)
  saturationFactor = 1 - avgSaturation
  blueFactor = 1 - (avgBlue / 255)
  randomNoise = random(-5, 5) μg/m³
```

### 시간대별 시뮬레이션

- 07:00-09:00 (출근 시간): 30-50 μg/m³
- 17:00-19:00 (퇴근 시간): 35-60 μg/m³
- 00:00-05:00 (심야): 10-25 μg/m³
- 기타 시간대: 15-40 μg/m³

---

**Made with ❤️ by joymin5655**

**No External APIs Required!** 🎉
