@echo off
echo 🔌 Arduino Serial Bridge for Windows
echo.
echo This will help connect your Arduino to the backend
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python first.
    echo Download from: https://python.org
    pause
    exit /b 1
)

REM Install required packages
echo 📦 Installing required packages...
pip install pyserial requests

REM Run the bridge
echo.
echo 🚀 Starting Arduino bridge...
python arduino_bridge.py

pause