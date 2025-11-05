#
# main.py - AirLens Backend Server
# FastAPI + Uvicorn
#
# Run: python main.py
# Access: http://localhost:8000
#

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from datetime import datetime
import json

app = FastAPI(title="AirLens Backend", version="1.0.0")

# MARK: - Health Check

@app.get("/health")
async def health():
    """헬스 체크 엔드포인트"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# MARK: - Stations API

@app.get("/api/stations")
async def get_stations(limit: int = 100, country: str = None):
    """
    대기질 측정소 데이터 조회
    
    Args:
        limit: 반환할 최대 측정소 개수
        country: 국가 필터 (선택사항)
    
    Returns:
        측정소 데이터 리스트
    """
    stations_data = [
        {
            "id": "seoul_1",
            "name": "Seoul Center",
            "latitude": 37.5665,
            "longitude": 126.9780,
            "country": "South Korea",
            "pm25": 28.5,
            "pm10": 45.2,
            "source": "WAQI",
            "last_updated": datetime.now().isoformat()
        },
        {
            "id": "beijing_1",
            "name": "Beijing Center",
            "latitude": 39.9042,
            "longitude": 116.4074,
            "country": "China",
            "pm25": 85.3,
            "pm10": 120.1,
            "source": "WAQI",
            "last_updated": datetime.now().isoformat()
        },
        {
            "id": "tokyo_1",
            "name": "Tokyo Center",
            "latitude": 35.6762,
            "longitude": 139.6503,
            "country": "Japan",
            "pm25": 18.7,
            "pm10": 32.4,
            "source": "WAQI",
            "last_updated": datetime.now().isoformat()
        }
    ]
    
    # 국가 필터 적용
    if country:
        stations_data = [s for s in stations_data if s["country"] == country]
    
    # 제한된 개수만 반환
    stations_data = stations_data[:limit]
    
    return {
        "status": "success",
        "count": len(stations_data),
        "data": stations_data
    }

# MARK: - Policies API

@app.get("/api/policies")
async def get_policies(country: str = None):
    """
    국가별 대기질 정책 조회
    
    Args:
        country: 국가 필터 (선택사항)
    
    Returns:
        정책 데이터 리스트
    """
    policies_data = [
        {
            "id": "kr_1",
            "source": "Korea EPA",
            "country": "South Korea",
            "title": "PM2.5 Reduction Policy",
            "description": "Fine dust reduction plan 2025-2030",
            "url": "https://example.com/kr-policy",
            "credibility_score": 0.95
        },
        {
            "id": "cn_1",
            "source": "China MEE",
            "country": "China",
            "title": "Air Quality Improvement Initiative",
            "description": "National air quality standard improvement",
            "url": "https://example.com/cn-policy",
            "credibility_score": 0.90
        }
    ]
    
    # 국가 필터 적용
    if country:
        policies_data = [p for p in policies_data if p["country"] == country]
    
    return {
        "status": "success",
        "count": len(policies_data),
        "data": policies_data
    }

# MARK: - Prediction API

@app.post("/api/predict")
async def predict_pm25(file: UploadFile = File(...)):
    """
    이미지 기반 PM2.5 예측
    
    Args:
        file: 업로드된 이미지 파일
    
    Returns:
        PM2.5 예측값 및 신뢰도
    """
    # 파일 읽기
    contents = await file.read()
    
    # 더미 예측값 (실제 ML 모델 구현 시 대체)
    prediction = {
        "data": {
            "pm25": 35.7,
            "confidence": 0.87,
            "breakdown": {
                "camera": 35.7,
                "station": None,
                "satellite": None
            },
            "timestamp": datetime.now().isoformat()
        }
    }
    
    return prediction

# MARK: - Root

@app.get("/")
async def root():
    """루트 경로"""
    return {
        "message": "AirLens Backend API",
        "version": "1.0.0",
        "docs": "http://localhost:8000/docs",
        "endpoints": {
            "health": "GET /health",
            "stations": "GET /api/stations",
            "policies": "GET /api/policies",
            "predict": "POST /api/predict"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AirLens Backend...")
    print("📍 Server: http://127.0.0.1:8000")
    print("📚 Docs: http://127.0.0.1:8000/docs")
    print("")
    uvicorn.run(app, host="0.0.0.0", port=8000)
