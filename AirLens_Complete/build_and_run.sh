#!/bin/bash

# AirLens iOS Build and Run Script
# Created on 2025-11-06

echo "📱 AirLens iOS App Build & Run"
echo "=================================="

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed"
    echo "Please install Xcode from the App Store"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project settings
PROJECT_NAME="AirLens"
SCHEME_NAME="AirLens"
CONFIGURATION="Debug"
DESTINATION="platform=iOS Simulator,name=iPhone 15 Pro,OS=17.0"

# Clean build folder
echo "🧹 Cleaning build folder..."
xcodebuild clean -project "$PROJECT_NAME.xcodeproj" \
    -scheme "$SCHEME_NAME" \
    -configuration "$CONFIGURATION" \
    -quiet

# Build the project
echo "🔨 Building project..."
xcodebuild build -project "$PROJECT_NAME.xcodeproj" \
    -scheme "$SCHEME_NAME" \
    -configuration "$CONFIGURATION" \
    -destination "$DESTINATION" \
    -quiet

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build succeeded${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Install and run on simulator
echo "📲 Installing on simulator..."
xcodebuild install -project "$PROJECT_NAME.xcodeproj" \
    -scheme "$SCHEME_NAME" \
    -configuration "$CONFIGURATION" \
    -destination "$DESTINATION" \
    -quiet

# Open simulator
echo "🚀 Launching app..."
xcrun simctl boot "iPhone 15 Pro" 2>/dev/null || true
open -a Simulator

# Launch the app
BUNDLE_ID="com.airlens.app"
xcrun simctl launch booted "$BUNDLE_ID"

echo ""
echo "=================================="
echo -e "${GREEN}✅ App launched successfully!${NC}"
echo "=================================="
echo ""
echo "📱 Simulator: iPhone 15 Pro"
echo "🔧 Configuration: $CONFIGURATION"
echo "📦 Bundle ID: $BUNDLE_ID"
echo ""
echo "Tips:"
echo "  - Press Cmd+R in Xcode to rebuild"
echo "  - Press Cmd+Shift+H to go home"
echo "  - Press Cmd+D to open debug menu"