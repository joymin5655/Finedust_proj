#!/bin/bash

# 최종 빌드 검증 스크립트

echo "=========================================="
echo "  iOS_App_fd 빌드 준비 상태 검증"
echo "=========================================="
echo ""

PROJECT_DIR="/Users/joymin/Coding_proj/Finedust_proj/iOS_App_fd"
cd "$PROJECT_DIR"

# 1. Info.plist 확인
echo "1️⃣ Info.plist 존재 확인"
if [ -f "iOS_App_fd/Info.plist" ]; then
    echo "✅ Info.plist 존재: iOS_App_fd/Info.plist"
    plutil -lint iOS_App_fd/Info.plist > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Info.plist 형식 유효"
    else
        echo "❌ Info.plist 형식 오류"
    fi
else
    echo "❌ Info.plist 없음"
fi
echo ""

# 2. Build Settings 확인
echo "2️⃣ Build Settings 검증"
PBXPROJ="iOS_App_fd.xcodeproj/project.pbxproj"

echo "   GENERATE_INFOPLIST_FILE 설정:"
grep "GENERATE_INFOPLIST_FILE" "$PBXPROJ" | head -1 | sed 's/^[[:space:]]*/   /'

echo "   INFOPLIST_FILE 설정:"
if grep -q "INFOPLIST_FILE = iOS_App_fd/Info.plist" "$PBXPROJ"; then
    echo "   ✅ INFOPLIST_FILE = iOS_App_fd/Info.plist"
else
    echo "   ❌ INFOPLIST_FILE 미설정"
fi
echo ""

# 3. 필수 파일 확인
echo "3️⃣ 필수 파일 존재 확인"
REQUIRED_FILES=(
    "iOS_App_fd/App/ContentView.swift"
    "iOS_App_fd/Services/ML/MLService.swift"
    "iOS_App_fd/Services/Location/LocationService.swift"
    "iOS_App_fd/Models/PredictionResult.swift"
    "iOS_App_fd/ViewModels/StationViewModel.swift"
    "iOS_App_fd/ViewModels/PolicyViewModel.swift"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $(basename $file)"
    else
        echo "   ❌ $(basename $file) 없음"
    fi
done
echo ""

# 4. Import 검증
echo "4️⃣ CoreLocation Import 확인"
if grep -q "import CoreLocation" iOS_App_fd/App/ContentView.swift; then
    echo "   ✅ ContentView.swift에 CoreLocation 임포트됨"
else
    echo "   ❌ ContentView.swift에 CoreLocation 임포트 누락"
fi
echo ""

# 5. DerivedData 상태
echo "5️⃣ DerivedData 상태"
DERIVED_SIZE=$(du -sh ~/Library/Developer/Xcode/DerivedData 2>/dev/null | cut -f1)
echo "   DerivedData 크기: $DERIVED_SIZE"
echo ""

# 6. 백업 확인
echo "6️⃣ 백업 파일 확인"
BACKUP_COUNT=$(ls iOS_App_fd.xcodeproj/project.pbxproj.backup_* 2>/dev/null | wc -l | tr -d ' ')
echo "   백업 파일 개수: $BACKUP_COUNT"
if [ "$BACKUP_COUNT" -gt 0 ]; then
    echo "   최신 백업: $(ls -t iOS_App_fd.xcodeproj/project.pbxproj.backup_* 2>/dev/null | head -1 | xargs basename)"
fi
echo ""

# 최종 권장 사항
echo "=========================================="
echo "  다음 단계"
echo "=========================================="
echo ""
echo "Xcode에서:"
echo "1. Clean Build Folder (Shift + Cmd + K)"
echo "2. Build (Cmd + B)"
echo ""
echo "예상 결과:"
echo "✅ Build Succeeded"
echo ""
echo "만약 오류가 발생하면:"
echo "- 오류 메시지 스크린샷 공유"
echo "- 백업에서 복원 가능"
echo ""
