# 🌍 API 설정 가이드 | API Configuration Guide

## 개요 | Overview

AirLens는 **완전 무료** 공식 공기질 API를 사용하여 실시간 PM2.5 데이터를 제공합니다.
최소 1개의 API를 설정하시면 실제 지상 관측소 데이터를 활용할 수 있습니다.

AirLens uses **completely FREE** official air quality APIs to provide real-time PM2.5 data.
Configure at least ONE API to access real ground station data.

---

## 🎯 추천 API | Recommended APIs

### 1️⃣ WAQI (World Air Quality Index) - ⭐ 최우선 추천

**Coverage:** 전 세계 11,000+ 관측소 | 11,000+ stations worldwide
**Data:** PM2.5, PM10, O3, NO2, SO2, CO (실시간)
**Cost:** ✅ 완전 무료 | Completely FREE

#### 무료 토큰 받기 | Get FREE Token

1. **토큰 요청 | Request Token:**
   👉 https://aqicn.org/data-platform/token

2. **이메일 입력 | Enter Email:**
   이메일 주소를 입력하고 "Request Token" 클릭

3. **이메일 확인 | Check Email:**
   받은 이메일에서 API 토큰 복사

4. **설정 파일에 추가 | Add to Config:**
   ```javascript
   // js/config.js
   waqi: {
     token: 'your-token-here',  // ← 여기에 토큰 붙여넣기
     enabled: true               // ← true로 변경
   }
   ```

#### API 장점 | Advantages
- ✅ 가장 많은 관측소 (11,000+)
- ✅ 간단한 토큰 발급 (이메일만 필요)
- ✅ 빠른 응답 속도
- ✅ 한국 포함 전 세계 커버리지

---

### 2️⃣ OpenWeather Air Pollution API - ⭐ 추천

**Coverage:** 전 세계 좌표 기반 데이터 | Global coordinates-based
**Data:** PM2.5, PM10, CO, NO, NO2, O3, SO2, NH3
**Cost:** ✅ 무료 (월 1,000,000 호출) | FREE (1M calls/month)

#### 무료 API 키 받기 | Get FREE API Key

1. **회원가입 | Sign Up:**
   👉 https://home.openweathermap.org/users/sign_up

2. **계정 생성 | Create Account:**
   이메일 인증 후 로그인

3. **API 키 생성 | Generate Key:**
   My API Keys → Create Key → 키 복사

4. **설정 파일에 추가 | Add to Config:**
   ```javascript
   // js/config.js
   openweather: {
     apiKey: 'your-api-key-here',  // ← 여기에 API 키 붙여넣기
     enabled: true                  // ← true로 변경
   }
   ```

#### API 장점 | Advantages
- ✅ 전 세계 어디서나 사용 가능 (좌표 기반)
- ✅ 관측소가 없는 지역에서도 데이터 제공
- ✅ 매우 높은 무료 한도 (100만 호출/월)
- ✅ 다양한 오염물질 데이터

---

### 3️⃣ OpenAQ API v3 - 선택 사항

**Coverage:** 지역별 차이 (미국, 유럽, 인도, 중국 양호)
**Data:** PM2.5 (정부 공식 관측소)
**Cost:** ✅ 무료 | FREE

#### 무료 API 키 받기 | Get FREE API Key

1. **회원가입 | Sign Up:**
   👉 https://explore.openaq.org/register

2. **계정 생성 후 API 키 발급 | Generate Key:**
   Account → API Keys → Create

3. **설정 파일에 추가 | Add to Config:**
   ```javascript
   // js/config.js
   openaq: {
     apiKey: 'your-api-key-here',  // ← 여기에 API 키 붙여넣기
     enabled: true                  // ← true로 변경
   }
   ```

#### API 특징 | Features
- ✅ 정부 공식 관측소 데이터
- ⚠️ 한국은 커버리지 제한적
- ⚠️ 2025년 1월 31일부터 v3만 사용 가능 (v1/v2 종료)

---

## 🔄 API 우선순위 | API Priority

시스템은 다음 순서로 API를 시도합니다:

1. **WAQI** (가장 많은 관측소)
2. **OpenWeather** (전 세계 커버리지)
3. **OpenAQ** (정부 공식 데이터)

✅ **권장:** WAQI + OpenWeather 둘 다 설정하면 가장 좋습니다!
✅ **Recommended:** Configure both WAQI + OpenWeather for best results!

---

## 📊 데이터 소스 비교 | Data Source Comparison

| API | 관측소 수 | 전 세계 커버리지 | 한국 커버리지 | 무료 한도 |
|-----|---------|---------------|------------|---------|
| **WAQI** | 11,000+ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 무제한 |
| **OpenWeather** | 좌표 기반 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 1M/월 |
| **OpenAQ** | 지역별 | ⭐⭐⭐ | ⭐⭐ | 100/일 |

---

## 🚀 빠른 시작 | Quick Start

### 최소 설정 (1분 소요)

1. **WAQI 토큰 받기** (가장 빠름)
   - https://aqicn.org/data-platform/token
   - 이메일만 입력하면 즉시 토큰 발급

2. **config.js 편집**
   ```javascript
   waqi: {
     token: 'your-actual-token',
     enabled: true
   }
   ```

3. **완료!** 브라우저에서 camera.html 열기

### 권장 설정 (3분 소요)

WAQI + OpenWeather 둘 다 설정:

```javascript
const API_CONFIG = {
  waqi: {
    token: 'your-waqi-token',
    enabled: true
  },
  openweather: {
    apiKey: 'your-openweather-key',
    enabled: true
  },
  openaq: {
    apiKey: null,  // 선택사항
    enabled: false
  }
};
```

---

## 🔍 작동 확인 | Verification

### 브라우저 콘솔 확인 (F12)

**API 설정 성공 시:**
```
✅ Satellite API initialized
✅ Ground station APIs configured: WAQI, OpenWeather
🌍 Fetching WAQI data for (37.5665, 126.9780)...
✅ WAQI: Found station "Seoul", PM2.5: 45
```

**API 미설정 시:**
```
⚠️ No ground station API configured. System will use satellite + image data only.
📝 RECOMMENDED: Configure at least ONE free API in js/config.js:
   - WAQI (11,000+ stations): https://aqicn.org/data-platform/token
   - OpenWeather (global): https://home.openweathermap.org/users/sign_up
```

---

## 🛠️ 문제 해결 | Troubleshooting

### "WAQI token invalid"
- **문제:** 토큰이 잘못되었거나 만료됨
- **해결:** 새 토큰을 https://aqicn.org/data-platform/token 에서 발급

### "OpenWeather API key invalid"
- **문제:** API 키가 잘못되었거나 활성화 대기 중
- **해결:**
  1. API 키 생성 후 몇 분 기다리기 (활성화 시간 필요)
  2. My API Keys에서 키 재확인

### "No ground station data available"
- **문제:** 해당 위치에 사용 가능한 데이터 없음
- **해결:**
  - 정상입니다! 위성 + 이미지 데이터로 계속 작동
  - 다른 API도 추가로 설정하면 커버리지 향상

### 한국에서 데이터가 안 나올 때
- **WAQI 사용:** 한국 전역 우수한 커버리지 ⭐⭐⭐⭐⭐
- **OpenWeather 사용:** 좌표 기반으로 항상 사용 가능 ⭐⭐⭐⭐⭐
- **OpenAQ:** 한국은 제한적 (권장하지 않음)

---

## 📈 데이터 흐름 | Data Flow

```
사용자 이미지 업로드
    ↓
GPS 위치 요청
    ↓
병렬 데이터 수집:
├── 이미지 특징 (CNN) ──────────────────┐
├── MODIS AOD (지역별 추정) ──────────────┤
├── Sentinel-5P (지역별 추정) ────────────┼─→ Late Fusion
└── 지상 관측소 (WAQI/OpenWeather/OpenAQ)─┘   (가중 평균)
    ↓
PM2.5 예측 + 교차 검증
```

### 융합 가중치 | Fusion Weights

- **이미지 CNN:** 40%
- **위성 데이터:** 35%
- **지상 관측소:** 25%

---

## 🆓 비용 | Costs

### 모든 API 완전 무료! | All APIs are FREE!

- **WAQI:** 무제한 무료
- **OpenWeather:** 월 100만 호출 무료
- **OpenAQ:** 일 100 호출 무료

**캐싱:** 30분 캐시로 API 호출 최소화

---

## 🔐 보안 | Security

### API 키 보안 주의사항

⚠️ **주의:** `js/config.js`는 클라이언트 측 파일입니다.

**GitHub에 업로드 시:**
```bash
# .gitignore에 추가
echo "js/config.js" >> .gitignore
```

**또는 환경 변수 템플릿 사용:**
```javascript
// js/config.template.js (GitHub에 커밋)
const API_CONFIG = {
  waqi: { token: null, enabled: false },
  openweather: { apiKey: null, enabled: false },
  openaq: { apiKey: null, enabled: false }
};

// js/config.js (로컬만, .gitignore에 포함)
// 실제 키 입력
```

---

## 📚 참고 자료 | References

- **WAQI 문서:** https://aqicn.org/api/
- **OpenWeather 문서:** https://openweathermap.org/api/air-pollution
- **OpenAQ 문서:** https://docs.openaq.org
- **프로젝트 GitHub:** https://github.com/joymin5655/Finedust_proj

---

## 💡 FAQ

**Q: API 키 없이도 작동하나요?**
A: 네! 위성 + 이미지 데이터로 작동합니다. 하지만 지상 관측소 데이터가 있으면 정확도가 높아집니다.

**Q: 어떤 API를 선택해야 하나요?**
A: WAQI (가장 많은 관측소) + OpenWeather (전 세계 커버리지) 조합을 추천합니다.

**Q: 한국에서는 어떤 API가 좋나요?**
A: WAQI가 한국 전역을 우수하게 커버합니다. OpenWeather도 좋습니다.

**Q: 비용이 발생할 수 있나요?**
A: 아니요! 모든 API가 무료입니다. 한도를 초과해도 비용은 없고 요청만 거부됩니다.

**Q: 여러 API를 동시에 설정하면?**
A: 시스템이 자동으로 가장 좋은 데이터를 선택합니다 (WAQI → OpenWeather → OpenAQ 순서).

---

## 🎉 설정 완료!

API를 설정하셨다면 이제 **camera.html**에서 실시간 PM2.5 예측을 체험해보세요!

**Configured your APIs? Now try real-time PM2.5 prediction at camera.html!**

---

### 📧 지원 | Support

문제가 있으신가요? GitHub Issues에 문의하세요:
https://github.com/joymin5655/Finedust_proj/issues
