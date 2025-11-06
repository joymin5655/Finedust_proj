#!/bin/bash

# Info.plist 경로 추가 스크립트

PROJECT_DIR="/Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd"
PBXPROJ="$PROJECT_DIR/iOS_App_fd.xcodeproj/project.pbxproj"

echo "=== Info.plist 경로 설정 ==="

# 백업
BACKUP="$PBXPROJ.backup_$(date +%Y%m%d_%H%M%S)"
cp "$PBXPROJ" "$BACKUP"
echo "✅ 백업: $(basename $BACKUP)"

# INFOPLIST_FILE 추가
# Debug와 Release 설정에 INFOPLIST_FILE 추가
awk '
/buildSettings = \{/ {
    print
    in_settings = 1
    next
}
in_settings && /GENERATE_INFOPLIST_FILE = NO;/ {
    print
    print "\t\t\t\tINFOPLIST_FILE = iOS_App_fd/Info.plist;"
    in_settings = 0
    next
}
{print}
' "$PBXPROJ" > "$PBXPROJ.new"

mv "$PBXPROJ.new" "$PBXPROJ"

echo "✅ INFOPLIST_FILE 경로 추가 완료"
echo ""
echo "설정된 경로: iOS_App_fd/Info.plist"
