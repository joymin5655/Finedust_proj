#!/bin/bash

# Info.plist 중복 오류 자동 해결 스크립트
# 작성일: 2025-11-06

set -e

echo "==========================================="
echo "  Info.plist 중복 오류 자동 해결"
echo "==========================================="
echo ""

PROJECT_DIR="/Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd"
PBXPROJ="$PROJECT_DIR/iOS_App_fd.xcodeproj/project.pbxproj"

cd "$PROJECT_DIR"

# 1. 백업 생성
echo "📦 Step 1: 백업 생성"
BACKUP_FILE="${PBXPROJ}.backup_$(date +%Y%m%d_%H%M%S)"
cp "$PBXPROJ" "$BACKUP_FILE"
echo "✅ 백업 완료: $(basename $BACKUP_FILE)"
echo ""

# 2. DerivedData 삭제
echo "🧹 Step 2: DerivedData 삭제"
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo "✅ DerivedData 삭제 완료"
echo ""

# 3. Xcode 종료
echo "🛑 Step 3: Xcode 종료"
killall -9 Xcode 2>/dev/null || echo "Xcode가 이미 종료되어 있습니다"
sleep 2
echo "✅ Xcode 종료 완료"
echo ""

# 4. project.pbxproj에서 Info.plist 참조 확인 및 제거
echo "🔍 Step 4: project.pbxproj 분석 중..."

# Info.plist의 fileRef UUID 찾기
INFO_PLIST_REF=$(grep -A 1 "path = Info.plist" "$PBXPROJ" | grep "fileRef =" | sed 's/.*fileRef = \([A-Z0-9]*\).*/\1/' | head -1)

if [ -z "$INFO_PLIST_REF" ]; then
    echo "⚠️  Info.plist fileRef를 찾을 수 없습니다"
else
    echo "   찾은 Info.plist fileRef: $INFO_PLIST_REF"
    
    # PBXResourcesBuildPhase에서 Info.plist 제거
    # 주석: Info.plist는 자동으로 처리되므로 Resources에 포함되면 안 됨
    
    # 임시 파일 생성
    TEMP_FILE="${PBXPROJ}.temp"
    
    # Info.plist를 참조하는 buildFile 엔트리 제거
    awk -v ref="$INFO_PLIST_REF" '
        BEGIN { skip = 0 }
        /\/\* Info.plist in Resources \*\/ = {isa = PBXBuildFile/ { skip = 1 }
        skip == 1 && /};/ { skip = 0; next }
        skip == 0 { print }
    ' "$PBXPROJ" > "$TEMP_FILE"
    
    # Resources 섹션에서 Info.plist 참조 제거
    awk '
        /PBXResourcesBuildPhase section/,/End PBXResourcesBuildPhase section/ {
            if (/Info.plist/ && /in Resources/) {
                next
            }
        }
        { print }
    ' "$TEMP_FILE" > "${TEMP_FILE}.2"
    
    mv "${TEMP_FILE}.2" "$PBXPROJ"
    rm -f "$TEMP_FILE"
    
    echo "✅ project.pbxproj 수정 완료"
fi

echo ""

# 5. 검증
echo "✅ Step 5: 수정 완료!"
echo ""
echo "==========================================="
echo "  다음 단계"
echo "==========================================="
echo ""
echo "1. Xcode 열기:"
echo "   open $PROJECT_DIR/iOS_App_fd.xcodeproj"
echo ""
echo "2. Clean Build Folder:"
echo "   Xcode 메뉴: Product > Clean Build Folder"
echo "   또는 단축키: Shift + Cmd + K"
echo ""
echo "3. Build:"
echo "   Xcode 메뉴: Product > Build"
echo "   또는 단축키: Cmd + B"
echo ""
echo "✅ 오류가 해결되었을 것입니다!"
echo ""
echo "백업 파일 위치: $BACKUP_FILE"
echo ""
