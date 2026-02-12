@echo off
echo 🚀 Starting Arduino Blockchain Voting Backend...
echo.

echo 📦 Installing dependencies...
call npm install

echo.
echo 🔧 Building C++ module...
call npm run build-cpp

echo.
echo 🚀 Starting backend server...
echo 💡 Backend will run on http://localhost:3001
echo 🔌 WebSocket will run on ws://localhost:8080
echo.
echo 📱 Connect your Arduino and send 12-digit IDs via Bluetooth!
echo.

call npm start