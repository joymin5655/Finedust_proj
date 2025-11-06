#!/bin/bash

# 추가 문제 해결 스크립트

echo "==========================================="
echo "  추가 문제 진단 및 해결"
echo "==========================================="
echo ""

PROJECT_DIR="/Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd"
cd "$PROJECT_DIR"

# 1. Info.plist 위치 확인
echo "1️⃣ Info.plist 위치 확인"
find . -name "Info.plist" -type f
echo ""

# 2. Info.plist 내용 확인
echo "2️⃣ Info.plist 유효성 검사"
if plutil -lint iOS_App_fd/Info.plist 2>/dev/null; then
    echo "✅ Info.plist 형식 정상"
else
    echo "❌ Info.plist 형식 오류!"
fi
echo ""

# 3. Build Settings 확인
echo "3️⃣ GENERATE_INFOPLIST_FILE 설정 확인"
grep "GENERATE_INFOPLIST_FILE" iOS_App_fd.xcodeproj/project.pbxproj | sort -u
echo ""

# 4. DerivedData 크기 확인
echo "4️⃣ DerivedData 상태"
DERIVED_SIZE=$(du -sh ~/Library/Developer/Xcode/DerivedData 2>/dev/null | cut -f1)
echo "DerivedData 크기: $DERIVED_SIZE"
echo ""

# 5. Xcode 프로세스 확인
echo "5️⃣ Xcode 프로세스"
if pgrep -x "Xcode" > /dev/null; then
    echo "⚠️  Xcode가 실행 중입니다"
    echo "   Clean을 위해 Xcode를 재시작하는 것을 권장합니다"
else
    echo "✅ Xcode가 실행되지 않음"
fi
echo ""

# 6. 권장 조치
echo "==========================================="
echo "  권장 조치 사항"
echo "==========================================="
echo ""
echo "1. Xcode 완전 재시작:"
echo "   killall -9 Xcode && sleep 2 && open iOS_App_fd.xcodeproj"
echo ""
echo "2. Clean Build Folder:"
echo "   Xcode > Product > Clean Build Folder (Shift+Cmd+K)"
echo ""
echo "3. DerivedData 재삭제:"
echo "   rm -rf ~/Library/Developer/Xcode/DerivedData/*"
echo ""
echo "4. Build 재시도:"
echo "   Cmd + B"
echo ""
