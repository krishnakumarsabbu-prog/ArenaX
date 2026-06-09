#!/bin/bash
# Start the XTest Python backend server
# The frontend Vite dev server is managed separately by the harness

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "[XTest] Starting FastAPI backend on port 8000..."
cd "$BACKEND_DIR"
python3 -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
