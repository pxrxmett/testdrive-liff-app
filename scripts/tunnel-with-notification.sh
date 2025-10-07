#!/bin/bash

CURRENT_URL_FILE=".current_tunnel_url"

# Start Nuxt
npm run dev &
NUXT_PID=$!
sleep 8

# Start tunnel and capture new URL
cloudflared tunnel --url http://localhost:4000 2>&1 | tee tunnel.log &
TUNNEL_PID=$!

sleep 10
NEW_URL=$(grep -o 'https://.*\.trycloudflare\.com' tunnel.log | head -1)

if [ -f "$CURRENT_URL_FILE" ]; then
    OLD_URL=$(cat "$CURRENT_URL_FILE")
    if [ "$NEW_URL" != "$OLD_URL" ]; then
        echo ""
        echo "🚨 URL CHANGED! 🚨"
        echo "Old: $OLD_URL"
        echo "New: $NEW_URL"
        echo "Update your LINE LIFF App URL!"
        echo ""
    fi
fi

echo "$NEW_URL" > "$CURRENT_URL_FILE"

cleanup() {
    kill $NUXT_PID $TUNNEL_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
