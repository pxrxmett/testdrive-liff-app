#!/bin/bash

echo "⚡ Starting Quick Tunnel (temporary URL)..."

# Start Nuxt in background
echo "📱 Starting Nuxt development server..."
npm run dev &
NUXT_PID=$!

# Wait for Nuxt
echo "⏳ Waiting for Nuxt to start..."
sleep 8

# Start quick tunnel
echo "��️ Starting Cloudflare quick tunnel..."
echo "🔗 Watch for the tunnel URL below:"
echo ""
cloudflared tunnel --url http://localhost:3000 &
TUNNEL_PID=$!

echo ""
echo "✅ Quick tunnel started!"
echo "�� Copy the tunnel URL from the output above"
echo "🔧 Update your LIFF app URL in LINE Developers Console"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $NUXT_PID 2>/dev/null
    kill $TUNNEL_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
