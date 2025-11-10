# GitHub Pages 설정 가이드

## 현재 상황
✅ 코드 준비 완료:
- .htaccess 파일 제거됨 (GitHub Pages는 Apache를 사용하지 않음)
- 모든 HTML 페이지 (index.html, globe.html, camera.html, research.html, about.html, settings.html) 정상
- CSS/JS 파일 경로 모두 올바름
- 페이지 간 네비게이션 링크 정상

❌ GitHub Pages 비활성화 상태 (403 에러)

## 해결 방법

### GitHub Pages 활성화

1. **GitHub 저장소로 이동**:
   https://github.com/joymin5655/Finedust_proj

2. **Settings 탭 클릭**

3. **왼쪽 메뉴에서 "Pages" 클릭**
   또는 직접 링크: https://github.com/joymin5655/Finedust_proj/settings/pages

4. **Build and deployment 섹션 설정**:
   - Source: "Deploy from a branch" 선택
   - Branch: **main** 선택
   - Folder: **/ (root)** 선택
   - **Save** 버튼 클릭

5. **2-5분 대기** (GitHub Pages 빌드 시간)

6. **페이지 새로고침 후 확인**:
   - 상단에 녹색 체크마크와 함께 다음 메시지 표시:
     "Your site is live at https://joymin5655.github.io/Finedust_proj/"

7. **사이트 접속**:
   https://joymin5655.github.io/Finedust_proj/

## 테스트할 페이지들

- ✅ https://joymin5655.github.io/Finedust_proj/ (홈페이지)
- ✅ https://joymin5655.github.io/Finedust_proj/globe.html (Globe 페이지)
- ✅ https://joymin5655.github.io/Finedust_proj/camera.html (Camera AI 페이지)
- ✅ https://joymin5655.github.io/Finedust_proj/research.html (Research 페이지)
- ✅ https://joymin5655.github.io/Finedust_proj/about.html (About 페이지)
- ✅ https://joymin5655.github.io/Finedust_proj/settings.html (Settings 페이지)

## 문제 해결

### 여전히 403 에러가 나온다면:

1. **저장소가 Public인지 확인**:
   - Settings → General → Danger Zone
   - Private 저장소는 무료 플랜에서 GitHub Pages 지원 안 됨
   - "Change visibility" → "Make public"

2. **Actions 탭 확인**:
   - https://github.com/joymin5655/Finedust_proj/actions
   - "pages-build-deployment" 워크플로우 성공 확인
   - 실패 시 에러 로그 확인

3. **브라우저 캐시 초기화**:
   - Windows: Ctrl + Shift + R
   - Mac: Cmd + Shift + R
   - 또는 시크릿/프라이빗 모드에서 접속

4. **개발자 도구에서 에러 확인**:
   - F12 키
   - Console 탭에서 에러 메시지 확인
   - Network 탭에서 로드 실패한 파일 확인

## 참고

모든 코드가 정상적으로 준비되어 있습니다. GitHub Pages 설정만 활성화하면 즉시 작동합니다!
