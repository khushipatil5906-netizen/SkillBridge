#!/bin/sh
set -e

echo "=========================================================="
echo "   🚀 Starting SkillBridge Unified Docker Platform        "
echo "=========================================================="

# Start Nginx in background
nginx

echo "✅ Nginx reverse proxy running on port 80"
echo "✅ Starting FastAPI ML backend on http://0.0.0.0:8000"

# Start FastAPI server in foreground
exec python run_server.py
