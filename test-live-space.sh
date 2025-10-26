#!/bin/bash
# Test script for downloading from LIVE Twitter Spaces

SPACE_ID="1OwGWeqzEQRxQ"

echo "================================================"
echo "🎙️  Testing LIVE Space Download"
echo "================================================"
echo ""
echo "Space ID: $SPACE_ID"
echo ""

# Check if tokens are set
if [ -z "$TWITTER_AUTH_TOKEN" ] || [ -z "$TWITTER_CSRF_TOKEN" ]; then
    echo "❌ ERROR: Twitter tokens not set!"
    echo ""
    echo "You need to set your Twitter authentication tokens:"
    echo ""
    echo "1. Open Twitter.com in your browser and log in"
    echo "2. Press F12 to open Developer Tools"
    echo "3. Go to Application → Cookies → https://twitter.com"
    echo "4. Copy the values for:"
    echo "   - auth_token"
    echo "   - ct0"
    echo ""
    echo "Then run these commands:"
    echo ""
    echo '  export TWITTER_AUTH_TOKEN="your_auth_token_here"'
    echo '  export TWITTER_CSRF_TOKEN="your_ct0_here"'
    echo ""
    echo "Then run this script again:"
    echo "  ./test-live-space.sh"
    echo ""
    exit 1
fi

echo "✅ Twitter tokens are set"
echo ""

# Check if build exists
if [ ! -f "dist/index.js" ]; then
    echo "⚠️  No build found, building now..."
    npm run build
    echo ""
fi

echo "================================================"
echo "🚀 Starting download from LIVE space..."
echo "================================================"
echo ""
echo "This will download whatever is currently available"
echo "from the live space (not the full space)."
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Run the downloader with --force to download from live space
node dist/index.js --id "$SPACE_ID" --force
