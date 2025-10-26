#!/bin/bash
# Verification script to check if you're using the fixed local version

echo "================================================"
echo "🔍 Verifying twspace-crawler version..."
echo "================================================"
echo ""

# Check current directory
echo "📂 Current directory:"
pwd
echo ""

# Check git branch
echo "🌿 Git branch:"
git branch | grep '*'
echo ""

# Check recent commits
echo "📝 Recent commits:"
git log --oneline -3
echo ""

# Check if our fix is present in the code
echo "🔧 Checking for master_master_playlist fix:"
if grep -q "master_master_playlist" dist/utils/PeriscopeUtil.js 2>/dev/null; then
    echo "✅ Fix FOUND in compiled code!"
    grep -A1 "master_master_playlist" dist/utils/PeriscopeUtil.js | head -2
else
    echo "❌ Fix NOT FOUND - you may need to rebuild!"
    echo "Run: npm run build"
fi
echo ""

# Check which version will be used
echo "🎯 Which version will be used:"
if [ -f "dist/index.js" ]; then
    echo "✅ LOCAL version (dist/index.js exists)"
    echo "   Use: node dist/index.js --id SPACE_ID"
    echo "   Or:  npx . --id SPACE_ID"
else
    echo "❌ No local build found!"
    echo "   Run: npm run build"
fi
echo ""

# Check if global version exists
if command -v twspace-crawler &> /dev/null; then
    echo "⚠️  GLOBAL version installed at: $(which twspace-crawler)"
    echo "   To use LOCAL version, use: node dist/index.js"
    echo "   NOT: twspace-crawler"
else
    echo "✅ No global version installed (good!)"
fi
echo ""

echo "================================================"
echo "📋 Summary:"
echo "================================================"
echo "To use the FIXED version, run from this directory:"
echo ""
echo "  node dist/index.js --id SPACE_ID"
echo "  or"
echo "  npx . --id SPACE_ID"
echo ""
echo "❌ DO NOT USE: twspace-crawler --id SPACE_ID"
echo "   (that uses the global/npm version without fixes)"
echo "================================================"
