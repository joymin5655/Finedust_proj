#!/bin/bash

# AirLens 프로젝트 검증 스크립트

echo "🔍 AirLens Project Validation"
echo "=============================="
echo ""

# Check project structure
echo "📁 Checking project structure..."

if [ -d "app" ]; then
    echo "✅ app/ directory exists"
else
    echo "❌ app/ directory missing"
    exit 1
fi

if [ -f "README.md" ]; then
    echo "✅ README.md exists"
else
    echo "❌ README.md missing"
    exit 1
fi

if [ -f "index.html" ]; then
    echo "✅ Root index.html exists (redirect)"
else
    echo "❌ Root index.html missing"
    exit 1
fi

echo ""
echo "📄 Checking HTML files in app/..."

html_files=("index.html" "globe.html" "camera.html" "settings.html" "about.html" "research.html" "404.html")

for file in "${html_files[@]}"; do
    if [ -f "app/$file" ]; then
        echo "✅ app/$file exists"
    else
        echo "❌ app/$file missing"
    fi
done

echo ""
echo "📁 Checking resource directories..."

resource_dirs=("css" "js" "data" "assets" "public")

for dir in "${resource_dirs[@]}"; do
    if [ -d "app/$dir" ]; then
        echo "✅ app/$dir/ exists"
    else
        echo "❌ app/$dir/ missing"
    fi
done

echo ""
echo "🗑️  Checking cleaned up files..."

if [ ! -d "airlens-react" ]; then
    echo "✅ airlens-react/ removed"
else
    echo "⚠️  airlens-react/ still exists"
fi

if [ ! -d "node_modules" ]; then
    echo "✅ node_modules/ removed"
else
    echo "⚠️  node_modules/ still exists"
fi

echo ""
echo "📊 Project Statistics:"
echo "  HTML files: $(find app -name '*.html' | wc -l)"
echo "  CSS files:  $(find app/css -name '*.css' 2>/dev/null | wc -l)"
echo "  JS files:   $(find app/js -name '*.js' 2>/dev/null | wc -l)"
echo "  Data files: $(find app/data -name '*.json' 2>/dev/null | wc -l)"

echo ""
echo "✅ Validation complete!"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: ./commit-changes.sh"
echo "  2. Run: git push origin main"
echo "  3. Check: https://github.com/joymin5655/Finedust_proj/actions"
