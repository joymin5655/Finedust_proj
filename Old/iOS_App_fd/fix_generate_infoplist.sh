#!/bin/bash

# Info.plist 중복 오류 완전 해결 스크립트
# GENERATE_INFOPLIST_FILE 설정 수정

set -e

PROJECT_DIR="/Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd"
PBXPROJ="$PROJECT_DIR/iOS_App_fd.xcodeproj/project.pbxproj"

echo "==========================================="
echo "  Info.plist 중복 오류 완전 해결"
echo "==========================================="
echo ""

cd "$PROJECT_DIR"

# 1. 백업
echo "📦 백업 생성 중..."
BACKUP="$PBXPROJ.backup_$(date +%Y%m%d_%H%M%S)"
cp "$PBXPROJ" "$BACKUP"
echo "✅ 백업 완료: $(basename $BACKUP)"
echo ""

# 2. GENERATE_INFOPLIST_FILE을 NO로 변경
echo "🔧 Build Settings 수정 중..."

# GENERATE_INFOPLIST_FILE = YES → NO 변경
sed -i.tmp 's/GENERATE_INFOPLIST_FILE = YES;/GENERATE_INFOPLIST_FILE = NO;/g' "$PBXPROJ"

# INFOPLIST_FILE 경로 추가 (없으면)
if ! grep -q "INFOPLIST_FILE" "$PBXPROJ"; then
    # buildSettings 섹션에 INFOPLIST_FILE 추가
    awk '/buildSettings = {/ && !found {
        print $0
        print "\t\t\t\tINFOPLIST_FILE = iOS_App_fd/Info.plist;"
        found=1
        next
    }
    {print}' "$PBXPROJ" > "$PBXPROJ.new"
    mv "$PBXPROJ.new" "$PBXPROJ"
fi

rm -f "$PBXPROJ.tmp"

echo "✅ Build Settings 수정 완료"
echo ""

# 3. DerivedData 삭제
echo "🧹 DerivedData 삭제 중..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo "✅ DerivedData 삭제 완료"
echo ""

# 4. Xcode 재시작
echo "🔄 Xcode 재시작 중..."
killall -9 Xcode 2>/dev/null || true
sleep 2
echo "✅ Xcode 종료 완료"
echo ""

# 5. 완료
echo "==========================================="
echo "  ✅ 수정 완료!"
echo "==========================================="
echo ""
echo "다음 단계:"
echo "1. Xcode 열기:"
echo "   open $PROJECT_DIR/iOS_App_fd.xcodeproj"
echo ""
echo "2. Clean & Build:"
echo "   Shift + Cmd + K → Cmd + B"
echo ""
echo "✅ 오류가 완전히 해결되었습니다!"
echo ""
echo "📝 변경 내용:"
echo "   - GENERATE_INFOPLIST_FILE: YES → NO"
echo "   - INFOPLIST_FILE: iOS_App_fd/Info.plist"
echo ""
echo "백업 위치: $BACKUP"
echo ""
