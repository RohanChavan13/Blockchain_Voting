@echo off
echo ========================================
echo Blockchain Voting System - Deployment
echo ========================================
echo.

echo Step 1: Checking environment...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file with your private key
    pause
    exit /b 1
)

echo Step 2: Compiling contract...
call npx hardhat compile
if errorlevel 1 (
    echo ERROR: Compilation failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Deploying to Sepolia...
echo This will use your account: 0xEAFB6F9923d11496298993355bca0ca045e36aE7
echo.
call npx hardhat run scripts/deploy.js --network sepolia

if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed!
    echo Please check:
    echo - Your private key in .env file
    echo - Your Sepolia ETH balance
    echo - Your internet connection
    pause
    exit /b 1
)

echo.
echo ========================================
echo Deployment Successful!
echo ========================================
echo.
echo IMPORTANT: Copy the contract address above!
echo.
echo Next steps:
echo 1. Open frontend/js/config.js
echo 2. Update CONTRACT_ADDRESS with your deployed address
echo 3. Run: npx http-server frontend -p 8000
echo 4. Open: http://localhost:8000
echo.
pause
