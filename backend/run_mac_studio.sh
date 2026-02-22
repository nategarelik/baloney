#!/bin/bash
# Baloney Backend — Mac Studio Native Launch Script
# Runs with Apple Silicon MPS acceleration (no Docker needed)
#
# Prerequisites:
#   pip install -r requirements.txt
#   pip install torch torchvision  (from PyPI — includes MPS support)
#
# Usage:
#   chmod +x run_mac_studio.sh
#   ./run_mac_studio.sh

set -e

echo "╔══════════════════════════════════════════════╗"
echo "║  Baloney AI Detection — Mac Studio Backend   ║"
echo "║  9-model ensemble on Apple Silicon MPS       ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Ensure we're in the backend directory
cd "$(dirname "$0")"

# Check for Apple Silicon MPS
python3 -c "import torch; print(f'PyTorch {torch.__version__}'); print(f'MPS available: {torch.backends.mps.is_available()}')"

echo ""
echo "Starting server on port 8000..."
echo "  Health check: http://localhost:8000/health"
echo "  Text detect:  POST http://localhost:8000/api/analyze"
echo "  Image detect: POST http://localhost:8000/api/analyze-image-b64"
echo ""

# Run with hot-reload in development
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info
