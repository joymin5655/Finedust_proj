#!/bin/bash

PROJECT_DIR="/Users/joymin/Coding_proj/Finedust_proj/Globe_fd"
PROJECT_FILE="$PROJECT_DIR/Globe_fd.xcodeproj"

echo "========================================="
echo "🔨 AirLens Build Script"
echo "========================================="
echo ""

# 1. Xcode 종료
echo "1️⃣  Closing Xcode..."
killall -9 Xcode 2>/dev/null || true
sleep 1

# 2. DerivedData 삭제
echo "2️⃣  Clearing DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 3. 프로젝트 클린
echo "3️⃣  Running xcodebuild clean..."
xcodebuild clean -project "$PROJECT_FILE" 2>/dev/null

# 4. Xcode 재열기
echo "4️⃣  Opening Xcode..."
open "$PROJECT_FILE"

echo ""
echo "✅ Build environment ready!"
echo ""
echo "📝 Next steps in Xcode:"
echo "   1. Wait for indexing to complete"
echo "   2. Cmd + Shift + K (Clean Build Folder)"
echo "   3. Cmd + B (Build)"
echo "   4. Cmd + R (Run)"
