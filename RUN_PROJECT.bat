@echo off
echo ========================================
echo Starting Blockchain Voting System
echo ========================================
echo.
echo Opening frontend on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
cd frontend
npx http-server -p 8000 -o
