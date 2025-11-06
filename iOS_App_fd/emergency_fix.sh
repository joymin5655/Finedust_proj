#!/bin/bash

# 긴급 문제 해결 스크립트

echo "========================================"
echo "  긴급 문제 해결"
echo "========================================"
echo ""

PROJECT_DIR="/Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd"
cd "$PROJECT_DIR"

echo "1️⃣ 완전 초기화 옵션"
echo ""
read -p "DerivedData와 Xcode를 완전히 초기화하시겠습니까? (y/n): " CONFIRM

if [ "$CONFIRM" = "y" ]; then
    echo ""
    echo "⏳ 초기화 중..."
    
    # Xcode 완전 종료
    killall -9 Xcode 2>/dev/null
    sleep 2
    
    # DerivedData 삭제
    rm -rf ~/Library/Developer/Xcode/DerivedData/*
    echo "✅ DerivedData 삭제 완료"
    
    # Xcode 캐시 삭제
    rm -rf ~/Library/Caches/com.apple.dt.Xcode
    echo "✅ Xcode 캐시 삭제 완료"
    
    echo ""
    echo "✅ 초기화 완료!"
    echo ""
    echo "다음 단계:"
    echo "1. 맥 재시작 (권장)"
    echo "2. Xcode 열기"
    echo "3. Clean Build Folder"
    echo "4. Build"
else
    echo "취소됨"
fi

echo ""
echo "2️⃣ 백업에서 복원"
echo ""
LATEST_BACKUP=$(ls -t iOS_App_fd.xcodeproj/project.pbxproj.backup_* 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
    echo "최신 백업: $(basename $LATEST_BACKUP)"
    read -p "이 백업으로 복원하시겠습니까? (y/n): " RESTORE
    
    if [ "$RESTORE" = "y" ]; then
        cp "$LATEST_BACKUP" iOS_App_fd.xcodeproj/project.pbxproj
        echo "✅ 복원 완료"
        echo ""
        echo "Xcode를 재시작하세요"
    fi
fi
