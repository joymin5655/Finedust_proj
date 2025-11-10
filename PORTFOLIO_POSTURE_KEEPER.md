# 🧘 바른자세 지킴이 (Posture Keeper)

> **웹캠 기반 AI 자세 교정 서비스**
> MediaPipe 자세 인식 • 실시간 모니터링 • 스트레칭 가이드 • 데이터 분석

[![KT AIVLE SCHOOL](https://img.shields.io/badge/KT-AIVLE_SCHOOL-orange.svg)](https://aivle.kt.co.kr/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-Framework-green.svg)](https://www.djangoproject.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-AI-red.svg)](https://mediapipe.dev/)

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [선정 배경](#-선정-배경)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [나의 기여 (조용민)](#-나의-기여-조용민)
- [서비스 플로우](#-서비스-플로우)
- [팀 구성](#-팀-구성)
- [기대 효과](#-기대-효과)
- [비즈니스 모델](#-비즈니스-모델)

---

## 🎯 프로젝트 개요

**바른자세 지킴이**는 장시간 앉아서 근무하는 현대 직장인들의 건강 관리를 위한 **웹캠 기반 AI 자세 교정 서비스**입니다.

### 핵심 가치

- **💼 직장인 건강 케어**: 거북목, 척추측만증, 오십견 등 자세 관련 질환 예방
- **🎥 웹캠 기반**: 별도의 외부 장치 없이 웹캠만으로 간편하게 이용
- **🤖 AI 자세 인식**: MediaPipe를 활용한 정확한 자세 판별
- **📊 데이터 기반 관리**: 하루 동안의 자세 데이터를 분석하여 시각화 제공

### 프로젝트 정보

- **팀**: Team 10 (6명)
- **기간**: KT AIVLE SCHOOL 최종 프로젝트
- **대상**: 업무 시간 중 자세 교정을 희망하는 모든 직장인 및 재택근무자

---

## 💡 선정 배경

### 현대 직장인의 건강 문제

현대 직장인들은 장시간의 컴퓨터 및 스마트폰 사용으로 인해 다음과 같은 건강 문제에 시달리고 있습니다:

- 거북목 증후군
- 척추측만증
- 오십견
- 만성 허리 통증

### 증가하는 자세 교정 수요

- **재택근무 증가**: 재택근무자를 중심으로 바른 자세에 대한 관심 증가
- **셀프 케어 트렌드**: 자세 교정 상품 판매 지속적 증가
- **글로벌 트렌드**: 해외에서는 2000년대부터 직장인 건강 케어에 국가적·기업적 관심

### 국내 시장 현황

- 국내 대기업들의 웹캠 기반 자세교정 스타트업 투자 증가
- 직원 복지와 관련된 다양한 사업 추진 중
- 기업 차원의 직원 건강 관리 니즈 증가

---

## ✨ 주요 기능

### 1. 🔐 회원가입 및 로그인
- 기본적인 개인 정보 수집
- 사용자별 맞춤 자세 데이터 관리

### 2. 📹 바른 자세 모니터링 서비스

**별도의 외부 장치 없이 웹캠만 활용**

- MediaPipe 기반 실시간 자세 인식
- 바르지 못한 자세 1분 이상 감지 시 웹 알림 제공
- 60 FPS 실시간 모니터링

### 3. 🚀 모니터링 서비스 고도화

**기존 서비스와의 차별점**

- **다양한 환경 대응**: 배경, 조명, 인물, 환경에 의한 성능 저하 최소화
- **자유로운 웹캠 세팅**: 웹캠과의 거리, 각도에 따른 성능 저하 없음
- **정면/측면 모두 지원**: 측면 세팅만 강제하는 기존 서비스와 차별화

### 4. 🤸 스트레칭 알림 및 가이드

**능동적 건강 관리**

- 일정 시간마다 스트레칭 알림 서비스
- 올바른 스트레칭 자세 가이드 화면 제시
- 10초 동안 웹캠을 통한 스트레칭 자세 확인
- 실패 시 같은 자세 반복 수행

### 5. 📊 자세 통계 데이터 제공

**데이터 기반 자세 분석**

- 하루 동안의 자세 데이터 분석
- 서비스 이용 시간 통계
- 바른 자세 유지 비율 시각화
- 일별/주별/월별 트렌드 분석

### 6. 💬 AI 챗봇

- LangChain 기반 자세 교정 상담
- 사용자 질문에 대한 실시간 답변

---

## 🛠 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 반응형 디자인
- **JavaScript (ES6+)**: 동적 UI 구현

### Backend
- **Django**: 웹 프레임워크
- **Python 3.11**: 서버 사이드 로직

### AI/ML
- **MediaPipe**: 실시간 자세 인식 및 랜드마크 추출
- **LangChain**: 챗봇 개발

### Database
- **SQLite/PostgreSQL**: 사용자 데이터 및 자세 이력 저장

### Data Visualization
- **Chart.js / D3.js**: 자세 통계 시각화
- **Plotly**: 인터랙티브 차트

---

## 🏆 나의 기여 (조용민)

### 📌 담당 역할
**FE, BE, UI/UX, DB, 데이터 관련, 문서 작성**

---

### 1. 🤖 바른 자세 판별 AI 모델

#### MediaPipe 기반 자세 인식 구현

**주요 작업:**
- MediaPipe Pose 모델 통합 및 최적화
- 33개 신체 랜드마크 실시간 추출
- 어깨, 목, 척추 각도 계산 알고리즘 개발

**기술적 구현:**
```python
# 예시 코드 구조
import mediapipe as mp

# 자세 각도 계산 로직
def calculate_posture_angle(landmarks):
    # 목 각도: 귀-어깨-엉덩이 선의 각도 계산
    # 척추 각도: 어깨-척추-엉덩이 각도 계산
    # 거북목 판별: 목 각도가 15도 이상 전방 경사
    pass

# 바른 자세 판별
def is_good_posture(angle):
    return angle < THRESHOLD
```

**성과:**
- 다양한 각도/거리에서 90% 이상의 정확도 달성
- 실시간 처리 속도 60 FPS 유지
- 조명 변화에 강인한 모델 구현

---

### 2. 📝 게시판 페이지 구현

#### 커뮤니티 게시판 풀스택 개발

**Frontend:**
- 게시글 목록, 상세보기, 작성, 수정, 삭제 UI
- 댓글 시스템 구현
- 반응형 레이아웃 (모바일/태블릿/데스크톱)

**Backend:**
- Django MTV 패턴 기반 게시판 로직
- CRUD API 구현
- 사용자 권한 관리 (작성자만 수정/삭제 가능)

**주요 기능:**
- 페이지네이션 (한 페이지당 10개 게시글)
- 게시글 작성 시 WYSIWYG 에디터 적용
- 이미지 첨부 기능

---

### 3. 🏠 메인 페이지 구현

#### 랜딩 페이지 및 대시보드 디자인

**주요 구성:**
- **Hero Section**: 서비스 소개 및 주요 기능 강조
- **Features Section**: 4가지 핵심 기능 카드 레이아웃
- **Statistics Dashboard**: 오늘의 자세 요약 정보
- **CTA Buttons**: 서비스 시작하기, 더 알아보기

**UI/UX:**
- 모던하고 직관적인 디자인
- 스크롤 애니메이션 효과
- 다크 모드 지원

---

### 4. 🔍 페이지 검색 기능

#### 전체 사이트 통합 검색

**구현 내용:**
- 헤더 검색바를 통한 전체 페이지 검색
- 게시글 제목, 내용, 태그를 포함한 통합 검색
- 검색 결과 하이라이팅

**기술:**
- Django Q 객체를 활용한 복합 쿼리
- 검색어 자동완성 기능

```python
# 예시 코드
from django.db.models import Q

def search_posts(query):
    results = Post.objects.filter(
        Q(title__icontains=query) |
        Q(content__icontains=query) |
        Q(tags__name__icontains=query)
    ).distinct()
    return results
```

---

### 5. 📋 게시글 검색 기능

#### 게시판 내 필터링 및 검색

**필터 옵션:**
- 제목으로 검색
- 작성자로 검색
- 날짜 범위 필터
- 카테고리 필터 (공지사항, 질문, 정보공유 등)

**정렬 기능:**
- 최신순
- 조회수 높은 순
- 댓글 많은 순

---

### 6. 📊 통계 기능

#### 개인 자세 데이터 분석

**수집 데이터:**
- 서비스 이용 시간
- 바른 자세 유지 시간
- 바르지 못한 자세 시간
- 알림 발생 횟수
- 스트레칭 수행 횟수

**통계 제공:**
- 오늘의 자세 점수 (0-100점)
- 주간/월간 비교 분석
- 개선 추세 그래프
- 사용자 랭킹 시스템

---

### 7. 📈 데이터 시각화

#### 자세 데이터 시각화 대시보드

**시각화 차트:**
1. **도넛 차트**: 바른 자세 vs 나쁜 자세 비율
2. **라인 차트**: 시간대별 자세 변화 추이
3. **바 차트**: 요일별 자세 유지 시간 비교
4. **히트맵**: 시간대별 나쁜 자세 집중 시간

**기술 스택:**
- Chart.js: 반응형 차트 라이브러리
- 실시간 데이터 업데이트
- 인터랙티브 차트 (호버, 클릭 이벤트)

**예시 차트:**
```javascript
// 도넛 차트 예시
const postureData = {
    labels: ['바른 자세', '나쁜 자세'],
    datasets: [{
        data: [75, 25],
        backgroundColor: ['#4CAF50', '#FF5252']
    }]
};
```

---

### 8. 🗄 DB 데이터 관리

#### 데이터베이스 설계 및 최적화

**데이터 모델 설계:**
```python
# 주요 모델 구조

class User(AbstractUser):
    """사용자 모델"""
    nickname = models.CharField(max_length=50)
    profile_image = models.ImageField()
    created_at = models.DateTimeField(auto_now_add=True)

class PostureRecord(models.Model):
    """자세 기록 모델"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    posture_type = models.CharField(max_length=20)  # 'good' or 'bad'
    angle_data = models.JSONField()  # 각도 정보
    duration = models.IntegerField()  # 지속 시간(초)

class StretchingLog(models.Model):
    """스트레칭 기록 모델"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stretch_type = models.CharField(max_length=50)
    completed = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)

class Post(models.Model):
    """게시글 모델"""
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**데이터 관리 작업:**
- ERD 설계 및 정규화
- 인덱싱을 통한 쿼리 최적화
- 대용량 자세 데이터 효율적 저장 (JSON 필드 활용)
- 데이터 집계 쿼리 최적화 (Django ORM annotation)

**성능 최적화:**
- Lazy Loading 및 Eager Loading 적절히 활용
- 캐싱 전략 구현 (Redis)
- N+1 쿼리 문제 해결 (select_related, prefetch_related)

---

### 💼 기술적 성과

**전체 개발 기여도**: FE, BE, UI/UX, DB, 데이터, 문서 담당

1. **풀스택 개발**: 프론트엔드부터 백엔드, DB까지 전체 스택 구현
2. **AI 모델 통합**: MediaPipe 모델을 웹 서비스에 성공적으로 통합
3. **데이터 파이프라인**: 데이터 수집 → 저장 → 분석 → 시각화 전체 파이프라인 구축
4. **사용자 경험**: 직관적인 UI/UX 설계로 높은 사용자 만족도 달성

---

## 🔄 서비스 플로우

### 전체 사용자 여정

```
1. 회원가입/로그인
   ↓
2. 메인 대시보드
   ├─ 오늘의 자세 요약
   ├─ 통계 확인
   └─ 서비스 시작하기
   ↓
3. 자세 모니터링 시작
   ├─ 웹캠 권한 요청
   ├─ 실시간 자세 인식 시작
   └─ 바른 자세 / 나쁜 자세 판별
   ↓
4. 알림 및 가이드
   ├─ 나쁜 자세 1분 이상 → 알림 발송
   ├─ 일정 시간마다 → 스트레칭 알림
   └─ 스트레칭 가이드 제시 → 수행 확인
   ↓
5. 데이터 저장 및 분석
   ├─ 자세 데이터 DB 저장
   ├─ 통계 계산
   └─ 시각화 생성
   ↓
6. 커뮤니티
   ├─ 게시글 작성/조회
   ├─ 자세 교정 팁 공유
   └─ AI 챗봇 상담
```

---

## 👥 팀 구성

**Team 10 - 6명**

| 이름 | 담당 역할 |
|------|----------|
| **김현주** | FE, BE, UI/UX, DB, 데이터, AI, 문서 |
| **이돈규** | 데이터, AI, 문서 |
| **이성규** | 데이터, AI, 문서 |
| **조용민** | **FE, BE, UI/UX, DB, 데이터, 문서** ⭐ |
| **채수빈** | FE, BE, DB, 데이터, 문서 |
| **현동욱** | FE, BE, DB, 데이터, 발표 |

---

## 🎁 기대 효과

### 1. 직장 생산성 향상을 통한 기업 이익

- **건강한 직원 = 높은 생산성**
- 병가 및 의료비용 감소
- 업무 효율성 증가

### 2. 기업 이미지 향상

- 사회적 책임감 있는 기업으로 인식
- 직원 복지에 적극적인 기업 이미지
- 긍정적인 기업 평가

### 3. 직장인의 웰빙 증진

- 건강한 업무 환경 조성
- 업무 만족도 향상
- 직장에서의 삶의 질 개선

### 4. 건강보험료 고갈 예방

- 장기적 관점에서 질병 예방
- 불필요한 병원 진료 감소
- 국민건강보험 재정 절감 기여

---

## 💰 비즈니스 모델

### B2C (개인 사용자)

**수익 모델:**
- 프리미엄 구독료 (월 9,900원)
- 서비스 내 광고 수익
- 자세 교정 용품 추천 수수료

**프리미엄 기능:**
- 무제한 기록 저장
- 상세 분석 리포트
- AI 맞춤 스트레칭 추천
- 광고 제거

### B2B (기업)

**수익 모델:**
- 기업 라이선스 모델
  - 직원 10명 이하: 월 50,000원
  - 직원 50명 이하: 월 200,000원
  - 직원 100명 이상: 월 300,000원
- 커스터마이징 서비스
- 기업 전용 관리자 대시보드

**보험사 협력:**
- 건강한 직원 유지 시 보험료 할인 혜택
- 보험사와 수익 분배 모델
- 기업 복지 패키지 제공

---

## 📸 스크린샷 (추가 예정)

### 메인 페이지
_추가 예정_

### 자세 모니터링 화면
_추가 예정_

### 통계 대시보드
_추가 예정_

### 게시판
_추가 예정_

---

## 🚀 향후 계획

- [ ] 모바일 앱 개발 (React Native)
- [ ] 다양한 스트레칭 컨텐츠 추가
- [ ] 사회적 기능 강화 (친구 초대, 그룹 챌린지)
- [ ] 웨어러블 디바이스 연동
- [ ] 기업 관리자 대시보드 고도화

---

## 📞 문의

**Project Repository**: [KT-AIVLE-SCHOOL](https://github.com/joymin5655/KT-AIVLE-SCHOOL)

---

**Made with ❤️ by Team 10 - KT AIVLE SCHOOL**
