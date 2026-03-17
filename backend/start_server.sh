#!/bin/bash
# Brain Age Prediction Backend Launcher
# Linux/Mac shell script to easily start the Flask server

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║    Brain Age Prediction Backend Launcher               ║"
echo "║         Starting Flask API Server                      ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

echo "[INFO] Python found:"
python3 --version
echo ""

# Check if we're in the backend directory
if [ ! -f "app.py" ]; then
    echo "[ERROR] app.py not found"
    echo "Please run this script from the backend directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "[INFO] Backend files found ✓"
echo ""

# Check if requirements are installed
echo "[INFO] Checking dependencies..."
python3 -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "[WARNING] Dependencies not installed"
    echo "Installing dependencies from requirements.txt..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install dependencies"
        exit 1
    fi
fi

echo "[INFO] All dependencies available ✓"
echo ""

# Check if model exists
if [ ! -f "../model/model.pth" ]; then
    echo "[WARNING] Model file not found at ../model/model.pth"
    echo "The API will start but predictions will fail until the model is added"
    echo ""
fi

# Start the Flask server
echo "[INFO] Starting Flask server..."
echo "[INFO] Server will be available at: http://localhost:5000"
echo "[INFO] Press Ctrl+C to stop the server"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

python3 app.py

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Server failed to start"
    exit 1
fi
