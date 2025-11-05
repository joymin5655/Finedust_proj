#!/bin/bash

# AirLens 프로젝트 빠른 실행 스크립트

echo "🚀 ============================================="
echo "   AirLens 실행 준비"
echo "============================================="
echo ""

# 프로젝트 경로
PROJECT_PATH="/Users/joymin/Coding_proj/Finedust_proj/Globe_fd"

# Derived Data 정리
echo "🧹 Derived Data 정리 중..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Globe_fd-* 2>/dev/null
echo "✅ Derived Data 정리 완료"
echo ""

# 백엔드 서버 확인
echo "🖥️  백엔드 서버 확인 중..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ 백엔드 서버 실행 중"
else
    echo "⚠️  백엔드 서버가 실행되지 않았습니다"
    echo ""
    echo "새 터미널에서 다음 명령어를 실행하세요:"
    echo "cd ~/Desktop/airlens-backend"
    echo "./run.sh"
    echo ""
fi

# Xcode 열기
echo "🎯 Xcode 프로젝트 열기..."
open "$PROJECT_PATH/Globe_fd.xcodeproj"

echo ""
echo "✅ ============================================="
echo "   준비 완료!"
echo "============================================="
echo ""
echo "📝 다음 단계:"
echo "1. Xcode가 열리면 Shift + Cmd + K (Clean)"
echo "2. Cmd + B (Build)"
echo "3. Cmd + R (Run)"
echo ""
echo "🎨 예상 결과:"
echo "- 0 errors, 0 warnings"
echo "- 프리미엄 UI"
echo "- 4개 탭 모두 작동"
echo ""
