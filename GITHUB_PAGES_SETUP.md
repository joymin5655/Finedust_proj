# 🚀 GitHub Pages 배포 가이드

## ✅ 현재 상태

**main 브랜치**: 생성 완료 ✓
**모든 파일**: main 브랜치에 업로드 완료 ✓
**GitHub Actions**: 설정 완료 ✓

---

## 📋 GitHub Pages 활성화 방법

### 1단계: GitHub 저장소 설정 페이지로 이동

1. 브라우저에서 https://github.com/joymin5655/Finedust_proj 접속
2. 상단 메뉴에서 **Settings** 클릭

### 2단계: Pages 섹션 설정

1. 왼쪽 사이드바에서 **Pages** 클릭
2. **Source** 섹션에서:
   - Branch: **main** 선택 (드롭다운에서)
   - Folder: **/ (root)** 선택
   - **Save** 버튼 클릭

### 3단계: 배포 대기 (2-5분)

- 페이지 상단에 "Your site is live at https://joymin5655.github.io/Finedust_proj/" 메시지가 나타날 때까지 기다림
- 초기 배포는 5-10분 정도 소요될 수 있음

### 4단계: 접속 확인

배포 완료 후 다음 URL로 접속:

- **메인 페이지**: https://joymin5655.github.io/Finedust_proj/
- **Globe**: https://joymin5655.github.io/Finedust_proj/globe.html
- **Camera AI**: https://joymin5655.github.io/Finedust_proj/camera.html
- **Research**: https://joymin5655.github.io/Finedust_proj/research.html
- **About**: https://joymin5655.github.io/Finedust_proj/about.html
- **Settings**: https://joymin5655.github.io/Finedust_proj/settings.html

---

## 🔍 문제 해결

### 화면이 비어있거나 로딩되지 않는 경우

#### 1. 브라우저 콘솔 확인
- **F12** 또는 **Ctrl+Shift+I** (Windows/Linux)
- **Cmd+Option+I** (Mac)
- **Console** 탭에서 에러 메시지 확인

#### 2. 일반적인 에러와 해결방법

**에러: "Failed to load resource: 404"**
```
원인: 파일 경로 오류
해결: 캐시 삭제 후 새로고침 (Ctrl+Shift+R)
```

**에러: "CORS policy"**
```
원인: CORS 정책 위반
해결: 정상 - 외부 API 사용 시 발생 가능, 기능에는 영향 없음
```

**에러: "Failed to fetch"**
```
원인: 네트워크 오류 또는 API 접근 제한
해결:
1. 인터넷 연결 확인
2. 브라우저 확장 프로그램 (광고 차단기 등) 비활성화
3. 다른 브라우저로 시도
```

**화면이 완전히 비어있는 경우**
```
원인: JavaScript 로딩 실패
해결:
1. 브라우저 캐시 삭제
2. 시크릿/프라이빗 모드로 접속
3. 브라우저 콘솔에서 구체적 에러 확인
```

#### 3. 캐시 삭제 방법

**Chrome/Edge:**
- Ctrl+Shift+Delete → "캐시된 이미지 및 파일" 선택 → 삭제

**Firefox:**
- Ctrl+Shift+Delete → "캐시" 선택 → 지금 삭제

**Safari:**
- Cmd+Option+E → 캐시 비우기

#### 4. 강력 새로고침

- **Windows/Linux**: Ctrl+Shift+R 또는 Ctrl+F5
- **Mac**: Cmd+Shift+R

---

## 🧪 로컬에서 테스트

GitHub Pages 배포 전에 로컬에서 테스트하려면:

### 방법 1: Python 사용
```bash
# 프로젝트 폴더에서
python -m http.server 8000

# 또는
python3 -m http.server 8000

# 브라우저에서 접속
# http://localhost:8000/index.html
```

### 방법 2: Node.js 사용
```bash
# npx 사용 (설치 불필요)
npx http-server -p 8000

# 브라우저에서 접속
# http://localhost:8000/index.html
```

### 방법 3: 제공된 스크립트 사용
```bash
# 프로젝트 폴더에서
./test-server.sh
```

---

## ✅ 배포 확인 체크리스트

배포가 성공했는지 다음 항목들을 확인:

- [ ] https://joymin5655.github.io/Finedust_proj/ 접속 가능
- [ ] 메인 페이지 배경과 Hero 애니메이션 표시됨
- [ ] 상단 네비게이션 바 작동
- [ ] 다크 모드 토글 버튼 작동 (우측 하단)
- [ ] Globe 페이지에서 3D 지구본 렌더링
- [ ] Camera AI 페이지에서 이미지 업로드 가능
- [ ] 모든 링크가 제대로 작동
- [ ] 브라우저 콘솔에 치명적 에러 없음

---

## 📊 GitHub Actions 상태 확인

1. https://github.com/joymin5655/Finedust_proj/actions 접속
2. "Deploy to GitHub Pages" 워크플로 확인
3. 최근 실행 상태가 ✅ 녹색 체크인지 확인
4. 빨간 X가 있다면 클릭하여 에러 로그 확인

---

## 💡 주요 기능별 확인사항

### Globe 페이지
- Three.js 3D 렌더링이 표시되어야 함
- 지구본을 마우스로 회전 가능
- 도시 마커 클릭 시 PM2.5 데이터 표시
- 국가 클릭 시 정책 정보 표시

### Camera AI 페이지
- 이미지 드래그 앤 드롭 영역 표시
- 이미지 업로드 시 분석 시작
- PM2.5 예측 결과 표시
- 위치 권한 요청 (선택사항)

### Settings 페이지
- API 설정 폼 표시
- 다크/라이트 모드 설정
- 설정 저장 기능

---

## 🆘 추가 도움이 필요한 경우

1. **GitHub Issues**:
   - https://github.com/joymin5655/Finedust_proj/issues
   - 구체적인 에러 메시지와 함께 issue 생성

2. **브라우저 콘솔 로그 캡처**:
   - F12 → Console 탭
   - 에러 메시지 전체 복사
   - 스크린샷 촬영

3. **네트워크 탭 확인**:
   - F12 → Network 탭
   - 페이지 새로고침
   - 빨간색으로 표시된 실패한 요청 확인

---

## 📝 배포 완료 후

배포가 성공적으로 완료되면:

1. ✅ 저장소 README.md의 Live Demo 링크 확인
2. ✅ 소셜 미디어에 공유 가능
3. ✅ API 키 설정 (선택사항, 더 많은 데이터 소스 활용)

---

**문제가 계속되면 위 체크리스트와 에러 메시지를 확인하여 구체적인 상황을 파악해주세요!**
