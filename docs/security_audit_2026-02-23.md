# AirLens 보안 및 데이터 관리 감사 보고서

**Date:** 2026-02-23  
**Status:** 조치 완료 (히스토리 정리 제외)

---

## 🚨 긴급 조치 필요

### GitHub PAT 토큰 노출 (git 히스토리)

`Final/.env` 파일이 과거 커밋에 포함되어 GitHub Personal Access Token이 노출됨:

- **커밋:** `82bda10`, `3f8321b`
- **내용:** `ghp_HC1YHX...` (GitHub PAT)
- **현재 상태:** 파일은 삭제되었으나 히스토리에 남아있음

**즉시 조치:**
1. GitHub Settings → Developer settings → Personal access tokens → 해당 토큰 **Revoke**
2. (선택) `git filter-branch` 또는 `BFG Repo-Cleaner`로 히스토리에서 제거

```bash
# BFG로 히스토리 정리 (권장)
brew install bfg
bfg --delete-files .env /Users/joymin/Development/Finedust_proj
cd /Users/joymin/Development/Finedust_proj
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

---

## ✅ 완료된 조치

### 1. 워크플로우 정리

| 항목 | 조치 |
|------|------|
| `update-waqi-data.yml` 중복 | 삭제 (update_airdata.yml로 통합) |
| earthdata job `if` 조건 누락 | 주간 스케줄 조건 추가 |
| 병렬 job 충돌 | concurrency group + git pull --rebase 추가 |
| WAQI history 불필요 커밋 | `SKIP_HISTORY=true` 환경변수 적용 |

### 2. .gitignore 강화

추가된 항목:
- `app/data/waqi/history/` — 일별 히스토리 (latest.json만 필요)
- `models/*.pkl`, `*.onnx`, `*.pt`, `*.h5` — ML 모델 아티팩트
- `__pycache__/`, `.venv/`, `venv/` — Python 런타임

### 3. WAQI 히스토리 파일 git 추적 해제

- 102개 히스토리 JSON (~5.6MB) git rm --cached 완료
- 로컬 파일은 유지, git에서만 제거

### 4. 코드 내 하드코딩된 시크릿 — 없음 ✅

스캔 결과 현재 코드에 API 키, 토큰 등 하드코딩 없음:
- `app/js/config.js` — .gitignore에 포함 (null template만 존재)
- 워크플로우 — `secrets.*` 참조만 사용
- Python 스크립트 — `os.environ` 또는 `secrets.*` 사용

### 5. 개인정보 — 없음 ✅

- 이메일, 전화번호 등 개인정보 미발견
- `joymin5655`는 공개 GitHub 사용자명으로 settings.html에서 레포 링크로만 사용

---

## ⚠️ 알려진 이슈 (히스토리)

`.git` 디렉토리 38MB — 과거 커밋에 포함된 대용량 파일:
- `AirLens_Complete/Backend/venv/` — Python venv 전체 (22MB+)
- `Final/.env` — 토큰 포함
- `app/data/waqi/history/` — 102개 일별 JSON

**정리 방법 (선택):**
```bash
# BFG로 대용량 파일 + 시크릿 히스토리 일괄 제거
bfg --strip-blobs-bigger-than 1M .
bfg --delete-folders venv .
bfg --delete-files .env .
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

> ⚠️ `--force` push는 모든 collaborator에게 영향. 혼자 작업 중이면 안전.
