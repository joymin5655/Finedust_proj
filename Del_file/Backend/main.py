"""
AirLens API Server
FastAPI backend for AirLens iOS application
Created on 2025-11-06
"""

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import random
import numpy as np
from enum import Enum

# FastAPI app initialization
app = FastAPI(
    title="AirLens API",
    description="Global Air Quality Monitoring API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Data Models ====================

class Station(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    country: str
    pm25: float
    pm10: Optional[float] = None
    aqi: Optional[int] = None
    source: str
    last_updated: datetime

class StationsResponse(BaseModel):
    status: str
    count: int
    data: List[Station]

class PolicyCategory(str, Enum):
    EMISSIONS = "Emissions Reduction"
    MONITORING = "Air Quality Monitoring"
    PUBLIC_HEALTH = "Public Health"
    TRANSPORTATION = "Clean Transportation"
    INDUSTRY = "Industrial Regulation"
    RESEARCH = "Research & Development"
    INTERNATIONAL = "International Cooperation"

class AirPolicy(BaseModel):
    id: str
    source: str
    country: str
    title: str
    description: Optional[str] = None
    url: str
    credibility_score: float = Field(ge=0, le=1)
    category: PolicyCategory
    implementation_date: Optional[datetime] = None
    last_updated: datetime

class PoliciesResponse(BaseModel):
    status: str
    count: int
    data: List[AirPolicy]

class PredictionBreakdown(BaseModel):
    camera: float
    station: Optional[float] = None
    satellite: Optional[float] = None
    weather: Optional[float] = None

class PredictionResult(BaseModel):
    pm25: float
    confidence: float = Field(ge=0, le=1)
    breakdown: PredictionBreakdown
    timestamp: datetime

class GlobalStatistics(BaseModel):
    total_stations: int
    total_policies: int
    average_pm25: float
    countries_count: int
    last_updated: datetime

# ==================== Sample Data ====================

# Sample stations data
SAMPLE_STATIONS = [
    {
        "id": "seoul_1",
        "name": "Seoul Center",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "country": "South Korea",
        "pm25": 28.5,
        "pm10": 45.2,
        "aqi": 85,
        "source": "WAQI",
        "last_updated": datetime.now()
    },
    {
        "id": "beijing_1",
        "name": "Beijing Center",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "country": "China",
        "pm25": 85.3,
        "pm10": 120.1,
        "aqi": 158,
        "source": "WAQI",
        "last_updated": datetime.now()
    },
    {
        "id": "tokyo_1",
        "name": "Tokyo Center",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "country": "Japan",
        "pm25": 18.7,
        "pm10": 32.4,
        "aqi": 65,
        "source": "WAQI",
        "last_updated": datetime.now()
    },
    {
        "id": "newyork_1",
        "name": "New York Center",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "country": "USA",
        "pm25": 12.3,
        "pm10": 25.6,
        "aqi": 51,
        "source": "EPA",
        "last_updated": datetime.now()
    },
    {
        "id": "london_1",
        "name": "London Center",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "country": "UK",
        "pm25": 15.8,
        "pm10": 28.9,
        "aqi": 59,
        "source": "DEFRA",
        "last_updated": datetime.now()
    },
    {
        "id": "paris_1",
        "name": "Paris Center",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "country": "France",
        "pm25": 22.4,
        "pm10": 38.7,
        "aqi": 72,
        "source": "Airparif",
        "last_updated": datetime.now()
    },
    {
        "id": "delhi_1",
        "name": "New Delhi Center",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "country": "India",
        "pm25": 156.8,
        "pm10": 245.3,
        "aqi": 207,
        "source": "CPCB",
        "last_updated": datetime.now()
    },
    {
        "id": "sydney_1",
        "name": "Sydney Center",
        "latitude": -33.8688,
        "longitude": 151.2093,
        "country": "Australia",
        "pm25": 8.9,
        "pm10": 18.2,
        "aqi": 37,
        "source": "NSW EPA",
        "last_updated": datetime.now()
    },
    {
        "id": "moscow_1",
        "name": "Moscow Center",
        "latitude": 55.7558,
        "longitude": 37.6173,
        "country": "Russia",
        "pm25": 31.2,
        "pm10": 52.8,
        "aqi": 91,
        "source": "Mosecom",
        "last_updated": datetime.now()
    },
    {
        "id": "cairo_1",
        "name": "Cairo Center",
        "latitude": 30.0444,
        "longitude": 31.2357,
        "country": "Egypt",
        "pm25": 68.5,
        "pm10": 112.3,
        "aqi": 154,
        "source": "EEAA",
        "last_updated": datetime.now()
    }
]

# Sample policies data
SAMPLE_POLICIES = [
    {
        "id": "kr_pol_1",
        "source": "Korea EPA",
        "country": "South Korea",
        "title": "Fine Dust Reduction Comprehensive Plan",
        "description": "National strategy to reduce PM2.5 by 35% by 2027",
        "url": "https://eng.me.go.kr/policies",
        "credibility_score": 0.95,
        "category": PolicyCategory.EMISSIONS,
        "implementation_date": datetime(2025, 1, 1),
        "last_updated": datetime.now()
    },
    {
        "id": "cn_pol_1",
        "source": "China MEE",
        "country": "China",
        "title": "Blue Sky Protection Campaign",
        "description": "Three-year action plan for air pollution control",
        "url": "https://english.mee.gov.cn/policies",
        "credibility_score": 0.88,
        "category": PolicyCategory.EMISSIONS,
        "implementation_date": datetime(2024, 6, 1),
        "last_updated": datetime.now()
    },
    {
        "id": "eu_pol_1",
        "source": "European Commission",
        "country": "EU",
        "title": "European Green Deal",
        "description": "Comprehensive plan for carbon neutrality by 2050",
        "url": "https://ec.europa.eu/green-deal",
        "credibility_score": 0.92,
        "category": PolicyCategory.INTERNATIONAL,
        "implementation_date": datetime(2024, 1, 1),
        "last_updated": datetime.now()
    },
    {
        "id": "us_pol_1",
        "source": "US EPA",
        "country": "USA",
        "title": "Clean Air Act Amendments",
        "description": "Updated national ambient air quality standards",
        "url": "https://www.epa.gov/clean-air-act",
        "credibility_score": 0.91,
        "category": PolicyCategory.MONITORING,
        "implementation_date": datetime(2024, 3, 15),
        "last_updated": datetime.now()
    },
    {
        "id": "in_pol_1",
        "source": "India CPCB",
        "country": "India",
        "title": "National Clean Air Programme",
        "description": "Reduction of PM concentration by 40% by 2026",
        "url": "https://ncap.cpcb.gov.in",
        "credibility_score": 0.85,
        "category": PolicyCategory.PUBLIC_HEALTH,
        "implementation_date": datetime(2024, 4, 1),
        "last_updated": datetime.now()
    }
]

# ==================== Helper Functions ====================

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in kilometers"""
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c

def generate_more_stations(count: int = 100) -> List[Dict]:
    """Generate additional random station data"""
    countries = ["USA", "China", "India", "Japan", "Germany", "UK", "France", 
                 "Brazil", "Canada", "Australia", "South Korea", "Mexico"]
    sources = ["WAQI", "EPA", "Local Monitor", "Government", "Research Station"]
    
    stations = []
    for i in range(count):
        station = {
            "id": f"station_{i+11}",
            "name": f"Station {i+11}",
            "latitude": random.uniform(-90, 90),
            "longitude": random.uniform(-180, 180),
            "country": random.choice(countries),
            "pm25": random.uniform(5, 200),
            "pm10": random.uniform(10, 300),
            "aqi": random.randint(20, 300),
            "source": random.choice(sources),
            "last_updated": datetime.now() - timedelta(minutes=random.randint(0, 60))
        }
        stations.append(station)
    
    return stations

# Generate full dataset
ALL_STATIONS = SAMPLE_STATIONS + generate_more_stations(90)

# ==================== API Endpoints ====================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "AirLens API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "stations": "/api/stations",
            "policies": "/api/policies",
            "predict": "/api/predict",
            "statistics": "/api/statistics",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.now()}

@app.get("/api/stations", response_model=StationsResponse)
async def get_stations(
    country: Optional[str] = None,
    limit: int = 100,
    skip: int = 0
):
    """Get air quality stations"""
    stations = ALL_STATIONS
    
    # Filter by country if specified
    if country:
        stations = [s for s in stations if s["country"].lower() == country.lower()]
    
    # Apply pagination
    stations = stations[skip:skip+limit]
    
    return StationsResponse(
        status="success",
        count=len(stations),
        data=[Station(**s) for s in stations]
    )

@app.get("/api/stations/nearby")
async def get_nearby_stations(
    lat: float,
    lon: float,
    radius: float = 50  # km
):
    """Get stations within radius of coordinates"""
    nearby_stations = []
    
    for station in ALL_STATIONS:
        distance = calculate_distance(
            lat, lon,
            station["latitude"], station["longitude"]
        )
        
        if distance <= radius:
            station_with_distance = station.copy()
            station_with_distance["distance_km"] = round(distance, 2)
            nearby_stations.append(station_with_distance)
    
    # Sort by distance
    nearby_stations.sort(key=lambda x: x["distance_km"])
    
    return {
        "status": "success",
        "count": len(nearby_stations),
        "center": {"latitude": lat, "longitude": lon},
        "radius_km": radius,
        "data": [Station(**s) for s in nearby_stations[:20]]  # Limit to 20 closest
    }

@app.get("/api/policies", response_model=PoliciesResponse)
async def get_policies(
    country: Optional[str] = None,
    category: Optional[str] = None
):
    """Get air quality policies"""
    policies = SAMPLE_POLICIES
    
    # Filter by country if specified
    if country:
        policies = [p for p in policies if p["country"].lower() == country.lower()]
    
    # Filter by category if specified
    if category:
        policies = [p for p in policies if p["category"].value.lower() == category.lower()]
    
    return PoliciesResponse(
        status="success",
        count=len(policies),
        data=[AirPolicy(**p) for p in policies]
    )

@app.post("/api/predict")
async def predict_pm25(
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None)
):
    """Predict PM2.5 from uploaded image"""
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read image data
    image_data = await file.read()
    
    # Simulate AI prediction (replace with actual model)
    # In production, this would use a real CNN-LSTM model
    pm25_value = random.uniform(10, 150)
    confidence_value = random.uniform(0.7, 0.95)
    
    # Create prediction breakdown
    breakdown = PredictionBreakdown(
        camera=0.7,
        station=0.2 if latitude and longitude else None,
        satellite=0.1,
        weather=None
    )
    
    # Create prediction result
    result = PredictionResult(
        pm25=round(pm25_value, 1),
        confidence=round(confidence_value, 3),
        breakdown=breakdown,
        timestamp=datetime.now()
    )
    
    return {
        "status": "success",
        "data": result.dict()
    }

@app.get("/api/statistics", response_model=GlobalStatistics)
async def get_statistics():
    """Get global statistics"""
    
    # Calculate statistics
    total_stations = len(ALL_STATIONS)
    total_policies = len(SAMPLE_POLICIES)
    
    # Average PM2.5
    pm25_values = [s["pm25"] for s in ALL_STATIONS]
    average_pm25 = sum(pm25_values) / len(pm25_values) if pm25_values else 0
    
    # Countries count
    countries = set(s["country"] for s in ALL_STATIONS)
    countries_count = len(countries)
    
    return GlobalStatistics(
        total_stations=total_stations,
        total_policies=total_policies,
        average_pm25=round(average_pm25, 2),
        countries_count=countries_count,
        last_updated=datetime.now()
    )

@app.get("/api/stations/{station_id}")
async def get_station_detail(station_id: str):
    """Get detailed information for a specific station"""
    
    station = next((s for s in ALL_STATIONS if s["id"] == station_id), None)
    
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    # Add historical data (simulated)
    historical_data = []
    for i in range(24):  # Last 24 hours
        historical_data.append({
            "timestamp": datetime.now() - timedelta(hours=i),
            "pm25": station["pm25"] + random.uniform(-10, 10),
            "pm10": station["pm10"] + random.uniform(-15, 15) if station.get("pm10") else None
        })
    
    return {
        "status": "success",
        "data": {
            **station,
            "historical": historical_data
        }
    }

# ==================== Run Server ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)