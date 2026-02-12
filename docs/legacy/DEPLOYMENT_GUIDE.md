# Blockchain Voting System - Deployment Guide

## 🚀 Quick Start Guide

Since you already have Sepolia testnet set up with 0.05 ETH, follow these steps to deploy and run your voting system.

## Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install:
- Hardhat (for smart contract deployment)
- ethers.js (for blockchain interactions)
- Other required dependencies

## Step 2: Configure Environment

1. Create a `.env` file in the root directory:

```bash
copy .env.example .env
```

2. Edit `.env` and add your MetaMask private key:

```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_metamask_private_key_here
```

**⚠️ IMPORTANT:** 
- Never share your private key
- Never commit the `.env` file to Git
- To get your private key from MetaMask:
  1. Open MetaMask
  2. Click the three dots menu
  3. Account Details → Export Private Key
  4. Enter your password and copy the key

## Step 3: Deploy Smart Contract to Sepolia

Run the deployment script:

```bash
npm run deploy
```

You should see output like:

```
Deploying VotingWithMerkle contract to Sepolia...
Deploying with account: 0xYourAddress
Account balance: 0.05 ETH
VotingWithMerkle deployed to: 0xContractAddress123...

=== SAVE THIS INFORMATION ===
Contract Address: 0xContractAddress123...
Network: Sepolia Testnet
Etherscan: https://sepolia.etherscan.io/address/0xContractAddress123...
=============================
```

**📝 COPY THE CONTRACT ADDRESS** - You'll need it in the next step!

## Step 4: Update Frontend Configuration

1. Open `frontend/js/config.js`

2. Find this line:
```javascript
CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",
```

3. Replace it with your deployed contract address:
```javascript
CONTRACT_ADDRESS: "0xYourActualContractAddress",
```

4. Save the file

## Step 5: Run the Frontend

You have several options to run the frontend:

### Option A: Using Python (if installed)

```bash
cd frontend
python -m http.server 8000
```

### Option B: Using Node.js http-server

```bash
npx http-server frontend -p 8000
```

### Option C: Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `frontend/index.html`
3. Select "Open with Live Server"

## Step 6: Test the System

1. **Open your browser** and go to `http://localhost:8000`

2. **Connect MetaMask**:
   - Make sure MetaMask is set to Sepolia testnet
   - The page should show "Connected to Sepolia"

3. **Authenticate as a Voter**:
   - Click the "Scan Voter ID" button
   - Wait for mock data generation
   - You'll see your voter hash displayed

4. **Cast a Vote**:
   - Click "Proceed to Voting"
   - Select one of the 5 candidates
   - Confirm your selection
   - Approve the transaction in MetaMask
   - Wait for confirmation (10-15 seconds)

5. **View Results**:
   - Navigate to the Dashboard
   - See live vote counts and charts
   - Verify your transaction on Etherscan

## 📋 Manual Steps Required

### You Need To Do:

1. ✅ **Install Node.js dependencies**: `npm install`
2. ✅ **Create `.env` file** with your private key
3. ✅ **Deploy contract**: `npm run deploy`
4. ✅ **Update `config.js`** with contract address
5. ✅ **Start local server** for frontend
6. ✅ **Connect MetaMask** to Sepolia in browser

### System Does Automatically:

- ✅ Generate mock voter data when scan button clicked
- ✅ Create cryptographic hashes
- ✅ Build Merkle proofs
- ✅ Submit transactions to blockchain
- ✅ Display live results

## 🔧 Troubleshooting

### Problem: "npm: command not found"

**Solution**: Install Node.js from https://nodejs.org/

### Problem: "Insufficient funds for gas"

**Solution**: Get more Sepolia ETH from a faucet:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### Problem: "MetaMask not detected"

**Solution**: 
1. Install MetaMask extension
2. Refresh the page
3. Click "Connect Wallet"

### Problem: "Wrong network"

**Solution**:
1. Open MetaMask
2. Click network dropdown
3. Select "Sepolia test network"
4. If not visible, enable "Show test networks" in MetaMask settings

### Problem: "Transaction failed"

**Solution**:
- Check you have enough Sepolia ETH
- Try increasing gas limit
- Check contract address is correct in config.js
- View error details in MetaMask

### Problem: "Already voted" error

**Solution**: This is expected! Each voter hash can only vote once. To test again:
1. Clear browser session storage (F12 → Application → Session Storage → Clear)
2. Click "Scan Voter ID" again to generate a new voter hash

## 📊 Testing Multiple Votes

To simulate multiple voters:

1. Cast a vote
2. Clear session storage (F12 → Application → Session Storage → Clear)
3. Refresh the page
4. Click "Scan Voter ID" again (generates new voter)
5. Cast another vote
6. Repeat as needed

Each scan generates a unique voter hash, so you can test multiple votes.

## 🎯 What's Working

- ✅ Mock voter ID generation (no hardware needed)
- ✅ Cryptographic hash creation
- ✅ Merkle proof generation and verification
- ✅ Smart contract deployment on Sepolia
- ✅ Vote submission to blockchain
- ✅ Double-vote prevention
- ✅ Live dashboard with charts
- ✅ Transaction verification on Etherscan
- ✅ Responsive UI with glassmorphism design

## 📱 Accessing from Mobile

1. Find your computer's local IP address:
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` (look for inet)

2. On your phone's browser, go to:
   ```
   http://YOUR_IP_ADDRESS:8000
   ```

3. Connect MetaMask mobile app

## 🔐 Security Notes

- Private keys are never exposed in the frontend
- Voter hashes are cryptographically secure
- No PII is stored on blockchain
- Session data is cleared after voting
- All transactions are publicly verifiable

## 📈 Next Steps

After basic testing works:

1. Test with multiple voters
2. Check dashboard updates in real-time
3. Verify transactions on Etherscan
4. Test on different browsers
5. Test on mobile devices

## 🆘 Need Help?

If you encounter issues:

1. Check browser console (F12) for errors
2. Check MetaMask for transaction details
3. Verify contract address in config.js
4. Ensure Sepolia testnet is selected
5. Check you have sufficient Sepolia ETH

## 🎉 Success Checklist

- [ ] Dependencies installed
- [ ] Contract deployed to Sepolia
- [ ] Contract address updated in config.js
- [ ] Frontend running on localhost
- [ ] MetaMask connected to Sepolia
- [ ] Successfully scanned voter ID
- [ ] Successfully cast a vote
- [ ] Transaction confirmed on blockchain
- [ ] Dashboard showing vote counts
- [ ] Transaction visible on Etherscan

Once all items are checked, your blockchain voting system is fully operational! 🚀
