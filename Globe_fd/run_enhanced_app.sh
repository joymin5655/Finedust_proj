#!/bin/bash

# AirLens - Complete Build and Run Script
# Enhanced Version with Modern UI
# Created on 2025-11-05

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_DIR="/Users/joymin/Coding_proj/Finedust_proj/Globe_fd"
XCODE_PROJECT="Globe_fd.xcodeproj"
BACKEND_SCRIPT="main.py"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   AirLens Enhanced iOS App${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if process is running
is_running() {
    pgrep -f "$1" > /dev/null
}

# Step 1: Environment Check
echo -e "${YELLOW}Step 1: Checking environment...${NC}"

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Python 3: $(python3 --version)${NC}"
fi

if ! command_exists xcodebuild; then
    echo -e "${RED}❌ Xcode not found. Please install Xcode from App Store.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Xcode: $(xcodebuild -version | head -n1)${NC}"
fi

# Step 2: Install Python dependencies
echo ""
echo -e "${YELLOW}Step 2: Installing Python dependencies...${NC}"

pip3 install fastapi uvicorn --quiet 2>/dev/null || {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip3 install fastapi uvicorn
}
echo -e "${GREEN}✅ Python dependencies installed${NC}"

# Step 3: Kill existing backend processes
echo ""
echo -e "${YELLOW}Step 3: Cleaning up existing processes...${NC}"

if is_running "python.*main.py"; then
    echo -e "${YELLOW}Stopping existing backend...${NC}"
    pkill -f "python.*main.py" || true
    sleep 2
fi
echo -e "${GREEN}✅ Cleanup complete${NC}"

# Step 4: Start backend server
echo ""
echo -e "${YELLOW}Step 4: Starting backend server...${NC}"

cd "$PROJECT_DIR"

# Create main.py if it doesn't exist
if [ ! -f "$BACKEND_SCRIPT" ]; then
    echo -e "${YELLOW}Creating backend server...${NC}"
    cat > main.py << 'EOF'
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/stations")
async def get_stations(country: str = None, limit: int = 100):
    stations = [
        {
            "id": "seoul_1",
            "name": "Seoul Center",
            "latitude": 37.5665,
            "longitude": 126.9780,
            "country": "South Korea",
            "pm25": random.uniform(10, 50),
            "pm10": random.uniform(20, 80),
            "source": "WAQI",
            "last_updated": datetime.now().isoformat()
        },
        {
            "id": "beijing_1",
            "name": "Beijing Center",
            "latitude": 39.9042,
            "longitude": 116.4074,
            "country": "China",
            "pm25": random.uniform(30, 100),
            "pm10": random.uniform(50, 150),
            "source": "WAQI",
            "last_updated": datetime.now().isoformat()
        },
        {
            "id": "tokyo_1",
            "name": "Tokyo Center",
            "latitude": 35.6762,
            "longitude": 139.6503,
            "country": "Japan",
            "pm25": random.uniform(5, 30),
            "pm10": random.uniform(10, 50),
            "source": "WAQI",
            "last_updated": datetime.now().isoformat()
        },
        {
            "id": "delhi_1",
            "name": "New Delhi",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "country": "India",
            "pm25": random.uniform(50, 150),
            "pm10": random.uniform(80, 200),
            "source": "CPCB",
            "last_updated": datetime.now().isoformat()
        },
        {
            "id": "london_1",
            "name": "London Center",
            "latitude": 51.5074,
            "longitude": -0.1278,
            "country": "United Kingdom",
            "pm25": random.uniform(8, 35),
            "pm10": random.uniform(15, 60),
            "source": "DEFRA",
            "last_updated": datetime.now().isoformat()
        }
    ]
    
    if country:
        stations = [s for s in stations if s["country"].lower() == country.lower()]
    
    return {
        "status": "success",
        "count": len(stations[:limit]),
        "data": stations[:limit]
    }

@app.get("/api/policies")
async def get_policies(country: str = None):
    policies = [
        {
            "id": "kr_1",
            "source": "Korea EPA",
            "country": "South Korea",
            "title": "Fine Dust Reduction Comprehensive Plan",
            "description": "National strategy to reduce PM2.5 levels by 35% by 2027",
            "url": "https://example.com/kr-policy",
            "credibility_score": 0.95
        },
        {
            "id": "cn_1",
            "source": "China MEE",
            "country": "China",
            "title": "Blue Sky Protection Campaign",
            "description": "Three-year action plan for air pollution prevention",
            "url": "https://example.com/cn-policy",
            "credibility_score": 0.90
        },
        {
            "id": "jp_1",
            "source": "Japan MOE",
            "country": "Japan",
            "title": "Air Quality Standards Update 2025",
            "description": "Revised environmental quality standards for air pollutants",
            "url": "https://example.com/jp-policy",
            "credibility_score": 0.93
        },
        {
            "id": "who_1",
            "source": "WHO",
            "country": "Global",
            "title": "Global Air Quality Guidelines 2025",
            "description": "Updated WHO guidelines for air quality and health",
            "url": "https://example.com/who-guidelines",
            "credibility_score": 0.98
        }
    ]
    
    if country:
        policies = [p for p in policies if p["country"].lower() == country.lower()]
    
    return {
        "status": "success",
        "count": len(policies),
        "data": policies
    }

@app.post("/api/predict")
async def predict_pm25(file: UploadFile = File(...)):
    # Mock prediction for demo
    return {
        "data": {
            "pm25": random.uniform(10, 80),
            "confidence": random.uniform(0.7, 0.95),
            "breakdown": {
                "camera": random.uniform(10, 80),
                "station": random.uniform(10, 80),
                "satellite": random.uniform(10, 80)
            },
            "timestamp": datetime.now().isoformat()
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF
fi

# Start backend in background
python3 main.py &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running at http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    exit 1
fi

# Step 5: Open Xcode project
echo ""
echo -e "${YELLOW}Step 5: Opening Xcode project...${NC}"

if [ -d "$PROJECT_DIR/$XCODE_PROJECT" ]; then
    open "$PROJECT_DIR/$XCODE_PROJECT"
    echo -e "${GREEN}✅ Xcode project opened${NC}"
else
    echo -e "${RED}❌ Xcode project not found at $PROJECT_DIR/$XCODE_PROJECT${NC}"
    exit 1
fi

# Step 6: Build instructions
echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   Build Instructions${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${GREEN}Xcode is now open. To run the app:${NC}"
echo ""
echo "1. Select your target device (iPhone simulator or device)"
echo "2. Press Cmd+R or click the Play button"
echo "3. Wait for build to complete"
echo ""
echo -e "${YELLOW}Backend Status:${NC}"
echo "- API: http://localhost:8000"
echo "- Health: http://localhost:8000/health"
echo "- Docs: http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}To stop the backend server:${NC}"
echo "kill $BACKEND_PID"
echo ""
echo -e "${GREEN}✅ Setup complete! Happy coding!${NC}"

# Keep backend running
echo ""
echo -e "${YELLOW}Backend server is running. Press Ctrl+C to stop.${NC}"
wait $BACKEND_PID
