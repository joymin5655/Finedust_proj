#!/bin/bash
#
# create_xcode_project.sh
# Xcode 프로젝트 생성 자동화 스크립트
#

set -e  # 에러 발생 시 즉시 중단

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_NAME="AirLens"
PROJECT_DIR="/Users/joymin/Coding_proj/Finedust_proj/AirLens-iOS"
BUNDLE_ID="com.yourname.AirLens"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  AirLens iOS 프로젝트 생성 스크립트${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Xcode 설치 확인
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Xcode가 설치되어 있지 않습니다.${NC}"
    echo "App Store에서 Xcode를 설치해주세요."
    exit 1
fi

echo -e "${GREEN}✅ Xcode 설치 확인됨${NC}"
xcodebuild -version

# 프로젝트 디렉토리로 이동
cd "$PROJECT_DIR"

echo ""
echo -e "${YELLOW}📋 Xcode에서 프로젝트를 수동으로 생성해야 합니다:${NC}"
echo ""
echo "1. Xcode 실행"
echo "2. File > New > Project"
echo "3. iOS > App 선택"
echo "4. 다음 정보 입력:"
echo "   - Product Name: ${PROJECT_NAME}"
echo "   - Team: 본인의 Apple Developer 계정"
echo "   - Organization Identifier: ${BUNDLE_ID%.*}"
echo "   - Interface: SwiftUI"
echo "   - Language: Swift"
echo "5. 저장 위치: ${PROJECT_DIR}"
echo ""
echo -e "${YELLOW}6. 프로젝트 생성 후:${NC}"
echo "   - 기존 ContentView.swift 삭제"
echo "   - Project Navigator에서 프로젝트 우클릭"
echo "   - 'Add Files to AirLens...' 선택"
echo "   - ${PROJECT_DIR}/AirLens 폴더의 모든 파일 추가"
echo "   - 'Copy items if needed' 체크 해제"
echo "   - 'Create groups' 선택"
echo ""

# 파일 확인
echo -e "${BLUE}📁 프로젝트 파일 확인:${NC}"
echo ""

if [ -d "${PROJECT_DIR}/AirLens" ]; then
    echo -e "${GREEN}✅ AirLens 폴더 존재${NC}"
    
    # 주요 파일 확인
    FILES_TO_CHECK=(
        "AirLens/AirLensApp.swift"
        "AirLens/Info.plist"
        "AirLens/Models/DataModels.swift"
        "AirLens/Views/CameraView.swift"
        "AirLens/Views/AnimatedGlobeView.swift"
        "AirLens/Services/GeminiAPIService.swift"
    )
    
    for file in "${FILES_TO_CHECK[@]}"; do
        if [ -f "${PROJECT_DIR}/${file}" ]; then
            echo -e "${GREEN}  ✅ ${file}${NC}"
        else
            echo -e "${RED}  ❌ ${file} (누락)${NC}"
        fi
    done
else
    echo -e "${RED}❌ AirLens 폴더를 찾을 수 없습니다${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  중요: Info.plist에서 GEMINI_API_KEY를 실제 API 키로 변경하세요!${NC}"
echo ""
echo -e "${BLUE}API 키 발급: https://ai.google.dev/${NC}"
echo ""

# 다음 단계 안내
echo -e "${GREEN}✅ 모든 파일이 준비되었습니다!${NC}"
echo ""
echo -e "${BLUE}다음 단계:${NC}"
echo "1. 위 안내에 따라 Xcode 프로젝트 생성"
echo "2. Info.plist에 API 키 설정"
echo "3. 프로젝트 빌드 (Cmd + B)"
echo "4. 실행 (Cmd + R)"
echo ""
echo -e "${GREEN}🎉 Happy Coding!${NC}"
