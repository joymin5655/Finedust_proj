<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/16co_Ms4Wsm_EYIczhiuTWiMkgDcel3P3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


---

## 🍎 iOS 네이티브 앱 (NEW!)

### 프로젝트 구조
```
Finedust_proj/
├── 웹 앱 (React/TypeScript) - 기존 프로젝트
│   ├── components/
│   ├── App.tsx
│   └── package.json
│
└── AirLens-iOS/ - iOS 네이티브 앱 (NEW!)
    ├── AirLens/
    │   ├── Models/
    │   ├── Views/
    │   ├── ViewModels/
    │   ├── Services/
    │   └── Utilities/
    ├── README.md
    └── create_xcode_project.sh
```

### iOS 앱 시작하기

1. **프로젝트 폴더로 이동**
   ```bash
   cd AirLens-iOS
   ```

2. **스크립트 실행**
   ```bash
   chmod +x create_xcode_project.sh
   ./create_xcode_project.sh
   ```

3. **Xcode에서 프로젝트 생성**
   - 스크립트 안내에 따라 Xcode에서 프로젝트 생성
   - 모든 Swift 파일을 프로젝트에 추가
   - Info.plist에 Gemini API 키 설정

4. **빌드 및 실행**
   ```
   Cmd + R
   ```

### iOS 앱 주요 기능
- 📸 **카메라로 하늘 촬영** - 실시간 대기질 분석
- 🤖 **AI 분석** - Google Gemini 2.5 Flash
- 🌍 **글로벌 맵** - 전세계 대기질 모니터링
- 📍 **위치 기반** - 자동 위치 감지
- 📊 **데이터 통합** - 카메라/측정소/위성 데이터

자세한 내용은 [AirLens-iOS/README.md](AirLens-iOS/README.md)를 참고하세요.

---

## 웹 앱 (기존)

### Run Locally

**Prerequisites:** Node.js

