# 🔧 하얀 화면 문제 해결 가이드

## 🔍 문제 진단 완료

**현재 상황:**
- ✅ HTML/CSS/JS 파일: 모두 정상
- ✅ 로컬 서버: 정상 작동
- ❌ GitHub Pages: "Access denied" (403) 또는 하얀 화면
- ❌ GitHub Pages 설정: 비활성화 또는 잘못된 브랜치

**원인:** GitHub Pages가 제대로 설정되지 않았거나, 배포 브랜치와 코드 브랜치가 일치하지 않습니다.

---

## ✅ 해결 방법 (2분 소요)

### 단계 1: GitHub 저장소 접속
```
https://github.com/joymin5655/Finedust_proj
```

### 단계 2: Pull Request 생성

1. **"Pull requests" 탭 클릭**

2. **"New pull request" 버튼 클릭**

3. **브랜치 설정**:
   - **base:** `main`
   - **compare:** `claude/multimodal-pm2.5-prediction-011CUz8qbK4qavb61Gw52q7Q`

4. **제목 입력**: "Deploy: Update to stable version with real data"

5. **"Create pull request" 클릭**

6. **"Merge pull request" 클릭**

7. **"Confirm merge" 클릭**

### 단계 3: GitHub Pages 활성화

1. **Settings 탭으로 이동**
   ```
   https://github.com/joymin5655/Finedust_proj/settings/pages
   ```

2. **Source 섹션에서 설정**:
   - **Branch:** `main` 선택
   - **Folder:** `/ (root)` 선택

3. **"Save" 버튼 클릭**

4. **배포 대기 (2-5분)**

### 단계 4: 사이트 접속
```
https://joymin5655.github.io/Finedust_proj/
```

---

## 🎯 Alternative: 직접 GitHub Pages 브랜치 설정

만약 main 브랜치에 merge하지 않고 바로 배포하고 싶다면:

1. **Settings → Pages** 이동

2. **Source** 섹션에서:
   - Branch: `claude/multimodal-pm2.5-prediction-011CUz8qbK4qavb61Gw52q7Q` 선택
   - Folder: `/ (root)` 선택

3. **"Save" 클릭**

**주의:** 브랜치 이름이 매우 길어서 선택하기 어려울 수 있습니다. 이 경우 main 브랜치에 merge하는 것을 권장합니다.

---

## 🔍 저장소 권한 확인

만약 위 방법이 작동하지 않는다면:

### Public 저장소 확인
1. **Settings → General** 이동
2. **Danger Zone** 섹션 확인
3. 저장소가 **Private**이면 → **Change visibility** → **Make public**

**참고:** GitHub Pages는 무료 플랜에서 Public 저장소만 지원합니다.

### Branch Protection 확인
1. **Settings → Branches** 이동
2. **Branch protection rules** 확인
3. main 브랜치에 protection이 있다면 → 일시적으로 비활성화 또는 관리자 권한 필요

---

## 📝 체크리스트

배포 전 확인사항:
- [ ] Pull Request 생성 및 merge 완료
- [ ] GitHub Pages 설정에서 main 브랜치 선택
- [ ] 저장소가 Public으로 설정됨
- [ ] 2-5분 대기 (GitHub Pages 빌드 시간)
- [ ] 브라우저 캐시 초기화 (Ctrl+Shift+R)

배포 후 확인사항:
- [ ] https://joymin5655.github.io/Finedust_proj/ 접속
- [ ] 하얀 화면 대신 AirLens 홈페이지가 보임
- [ ] 네비게이션 메뉴가 작동함
- [ ] Globe, Camera AI 페이지 접속 가능

---

## 🚨 여전히 하얀 화면이 나온다면

### 1. Actions 탭 확인
```
https://github.com/joymin5655/Finedust_proj/actions
```
- "pages-build-deployment" 워크플로우 확인
- 빌드 에러가 있는지 확인

### 2. 브라우저 개발자 도구 확인
- `F12` 키 또는 `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Console** 탭에서 에러 메시지 확인
- **Network** 탭에서 404 또는 403 에러 확인

### 3. GitHub Pages 상태 확인
Settings → Pages에서 다음 메시지가 보여야 합니다:
```
✅ Your site is live at https://joymin5655.github.io/Finedust_proj/
```

만약 다른 메시지가 보인다면 스크린샷을 찍어서 확인하세요.

---

## 💡 빠른 테스트

로컬에서 사이트가 정상 작동하는지 확인:
```bash
# 프로젝트 폴더에서
python3 -m http.server 8080

# 브라우저에서 접속
http://localhost:8080
```

로컬에서 정상이라면 → GitHub Pages 설정 문제
로컬에서도 하얀 화면 → 코드 문제

---

## 📧 도움이 필요하면

1. GitHub Settings → Pages 스크린샷
2. 브라우저 Console 에러 메시지
3. Actions 탭의 빌드 로그

위 정보를 제공하면 더 정확한 진단이 가능합니다.

**대부분의 경우 Pull Request를 생성하고 GitHub Pages를 활성화하면 해결됩니다!** ✨
