@echo off
echo ===================================================
echo   🚀 Starting CampusVote AI (Hackspiration '26)
echo ===================================================

echo.
echo [1/5] Fixing Python Dependencies...
python -m pip install pyteal py-algorand-sdk > nul 2>&1
echo [OK] Dependencies installed.

echo.
echo [2/5] Compiling Algorand Smart Contract...
cd algorand
python voting.py
echo [OK] Attempted Compilation.
cd ..

echo.
echo [3/5] Starting Backend API (New Window)...
start "CampusVote Backend" cmd /c "cd backend && npm install && node server.js && pause"

echo.
echo [4/5] Starting Frontend Web Server (New Window)...
start "CampusVote Frontend" cmd /c "npx http-server frontend -p 8000"

echo.
echo [5/5] Opening Browser...
timeout /t 3 > nul
start http://localhost:8000

echo.
echo ===================================================
echo   ✅ System Online!
echo   1. Backend is running on port 3001
echo   2. Frontend is running on port 8000
echo   3. AI Auth is ready to test
echo ===================================================
pause
