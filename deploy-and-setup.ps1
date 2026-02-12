# Blockchain Voting System - Deployment Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Blockchain Voting System - Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check environment
Write-Host "Step 1: Checking environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with your private key" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 2: Compile contract
Write-Host "Step 2: Compiling contract..." -ForegroundColor Yellow
$compileResult = npx hardhat compile 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Compilation failed!" -ForegroundColor Red
    Write-Host $compileResult -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Contract compiled successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy to Sepolia
Write-Host "Step 3: Deploying to Sepolia..." -ForegroundColor Yellow
Write-Host "Using account: 0xEAFB6F9923d11496298993355bca0ca045e36aE7" -ForegroundColor Cyan
Write-Host ""

$deployResult = npx hardhat run scripts/deploy.js --network sepolia 2>&1
Write-Host $deployResult

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Deployment failed!" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "- Your private key in .env file" -ForegroundColor Yellow
    Write-Host "- Your Sepolia ETH balance" -ForegroundColor Yellow
    Write-Host "- Your internet connection" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Successful!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Copy the contract address above!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open frontend/js/config.js" -ForegroundColor White
Write-Host "2. Update CONTRACT_ADDRESS with your deployed address" -ForegroundColor White
Write-Host "3. Run: npx http-server frontend -p 8000" -ForegroundColor White
Write-Host "4. Open: http://localhost:8000" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
