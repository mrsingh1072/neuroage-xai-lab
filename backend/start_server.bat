@echo off
REM Brain Age Prediction Backend Launcher
REM Windows batch script to easily start the Flask server

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║    Brain Age Prediction Backend Launcher               ║
echo ║         Starting Flask API Server                      ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [INFO] Python found:
python --version
echo.

REM Check if we're in the backend directory
if not exist "app.py" (
    echo [ERROR] app.py not found
    echo Please run this script from the backend directory
    echo Current directory: %cd%
    pause
    exit /b 1
)

echo [INFO] Backend files found ✓
echo.

REM Check if requirements are installed
echo [INFO] Checking dependencies...
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Dependencies not installed
    echo Installing dependencies from requirements.txt...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

echo [INFO] All dependencies available ✓
echo.

REM Check if model exists
if not exist "..\model\model.pth" (
    echo [WARNING] Model file not found at ..\model\model.pth
    echo The API will start but predictions will fail until the model is added
    echo.
    pause
)

REM Start the Flask server
echo [INFO] Starting Flask server...
echo [INFO] Server will be available at: http://localhost:5000
echo [INFO] Press Ctrl+C to stop the server
echo.
echo ═══════════════════════════════════════════════════════
echo.

python app.py

if errorlevel 1 (
    echo.
    echo [ERROR] Server failed to start
    pause
)
