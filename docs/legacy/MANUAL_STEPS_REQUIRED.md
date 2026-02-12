# 🔧 Manual Steps Required - Deployment Checklist

## ⚠️ IMPORTANT: You Need to Do These Steps

I've created all the code, but there are a few manual steps you need to complete to deploy to Sepolia testnet.

---

## Step 1: Install Node.js Dependencies ⏱️ 2 minutes

**What to do:**

Open your terminal in the project folder and run:

```bash
npm install
```

**What this does:**
- Installs Hardhat (for deploying smart contracts)
- Installs ethers.js and other dependencies
- Creates `node_modules` folder

**Expected output:**
```
added 500+ packages in 30s
```

---

## Step 2: Create .env File with Your Private Key ⏱️ 1 minute

**What to do:**

1. Create a new file named `.env` in the root folder (same level as package.json)

2. Copy this content into `.env`:

```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=paste_your_metamask_private_key_here
```

3. **Get your MetaMask private key:**
   - Open MetaMask extension
   - Click the three dots (⋮) menu
   - Click "Account details"
   - Click "Export Private Key"
   - Enter your MetaMask password
   - Copy the private key
   - Paste it in the `.env` file (replace `paste_your_metamask_private_key_here`)

**⚠️ SECURITY WARNING:**
- NEVER share your private key with anyone
- NEVER commit the `.env` file to Git (it's already in .gitignore)
- This is your testnet account, but still keep it secure

**Your .env file should look like:**
```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=0abc123def456...your_actual_key_here
```

---

## Step 3: Deploy Smart Contract to Sepolia ⏱️ 1 minute

**What to do:**

Run this command in your terminal:

```bash
npm run deploy
```

**What this does:**
- Compiles the smart contract
- Deploys it to Sepolia testnet using your account
- Uses your 0.05 ETH for gas fees (costs ~$0.01)

**Expected output:**
```
Deploying VotingWithMerkle contract to Sepolia...
Deploying with account: 0xYourAddress
Account balance: 0.05 ETH
VotingWithMerkle deployed to: 0x1234567890abcdef...

=== SAVE THIS INFORMATION ===
Contract Address: 0x1234567890abcdef1234567890abcdef12345678
Network: Sepolia Testnet
Etherscan: https://sepolia.etherscan.io/address/0x1234567890abcdef...
=============================
```

**📝 IMPORTANT:** Copy the contract address! You'll need it in the next step.

**If you get an error:**
- "Insufficient funds" → Get more Sepolia ETH from https://sepoliafaucet.com/
- "Invalid private key" → Check your `.env` file
- "Network error" → Check your internet connection

---

## Step 4: Update Contract Address in Frontend ⏱️ 30 seconds

**What to do:**

1. Open the file: `frontend/js/config.js`

2. Find this line (around line 4):
```javascript
CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",
```

3. Replace it with your actual contract address from Step 3:
```javascript
CONTRACT_ADDRESS: "0x1234567890abcdef1234567890abcdef12345678",
```

4. Save the file

**Example:**
```javascript
const CONFIG = {
    // Contract configuration
    CONTRACT_ADDRESS: "0xYourActualContractAddressFromStep3",  // ← UPDATE THIS
    
    // Network configuration
    NETWORK: {
        NAME: "Sepolia",
        // ... rest of config
```

---

## Step 5: Start the Frontend Server ⏱️ 30 seconds

**What to do:**

Choose ONE of these options:

### Option A: Using npx (Recommended)

```bash
npx http-server frontend -p 8000
```

### Option B: Using Python (if you have Python installed)

```bash
cd frontend
python -m http.server 8000
```

### Option C: Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `frontend/index.html`
3. Select "Open with Live Server"

**Expected output:**
```
Starting up http-server, serving frontend
Available on:
  http://127.0.0.1:8000
  http://192.168.1.x:8000
```

---

## Step 6: Open in Browser and Test ⏱️ 2 minutes

**What to do:**

1. Open your browser and go to: `http://localhost:8000`

2. You should see the authentication page with "Scan Voter ID" button

3. **Connect MetaMask:**
   - MetaMask popup should appear
   - Click "Connect"
   - Make sure you're on Sepolia testnet

4. **Test the voting flow:**
   - Click "Scan Voter ID" button
   - Wait for mock data generation (~2 seconds)
   - Click "Proceed to Voting"
   - Select a candidate
   - Click "Confirm Vote"
   - Approve transaction in MetaMask
   - Wait for confirmation (~15 seconds)
   - View your receipt!

5. **Check the dashboard:**
   - Navigate to Dashboard
   - You should see 1 vote for your selected candidate
   - Charts should display the results

---

## ✅ Success Checklist

Mark each item as you complete it:

- [ ] Step 1: Ran `npm install` successfully
- [ ] Step 2: Created `.env` file with private key
- [ ] Step 3: Deployed contract with `npm run deploy`
- [ ] Step 4: Updated contract address in `config.js`
- [ ] Step 5: Started frontend server
- [ ] Step 6: Opened `http://localhost:8000` in browser
- [ ] Connected MetaMask to Sepolia
- [ ] Clicked "Scan Voter ID" successfully
- [ ] Cast a vote successfully
- [ ] Saw transaction confirmed on blockchain
- [ ] Viewed vote on dashboard
- [ ] Verified transaction on Etherscan

---

## 🆘 Troubleshooting

### Problem: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/ (download LTS version)

---

### Problem: "Insufficient funds for gas"

**Solution:** 
1. Go to https://sepoliafaucet.com/
2. Enter your wallet address
3. Request Sepolia ETH
4. Wait 1-2 minutes
5. Try deploying again

---

### Problem: "MetaMask not detected"

**Solution:**
1. Install MetaMask extension: https://metamask.io/
2. Create or import wallet
3. Switch to Sepolia testnet
4. Refresh the page

---

### Problem: "Wrong network" in MetaMask

**Solution:**
1. Open MetaMask
2. Click network dropdown at top
3. Select "Sepolia test network"
4. If you don't see it:
   - Click "Show/hide test networks"
   - Enable "Show test networks"
   - Select Sepolia

---

### Problem: "Transaction failed"

**Solution:**
- Check you have enough Sepolia ETH (need ~0.001 ETH per vote)
- Check contract address is correct in `config.js`
- Check you're on Sepolia network
- Try increasing gas limit in MetaMask

---

### Problem: "Already voted" error

**Solution:** This is expected! Each voter hash can only vote once. To test again:
1. Press F12 to open browser console
2. Go to "Application" tab
3. Click "Session Storage" → your site
4. Click "Clear All"
5. Refresh page
6. Click "Scan Voter ID" again (generates new voter)

---

## 📞 Need Help?

If you're stuck on any step:

1. **Check the error message** - Most errors tell you what's wrong
2. **Check browser console** - Press F12 and look for red errors
3. **Check MetaMask** - Look at transaction details
4. **Verify contract address** - Make sure it's correct in `config.js`
5. **Check network** - Must be on Sepolia testnet

---

## 🎉 What Happens After Deployment?

Once you complete all steps:

✅ Your smart contract is live on Sepolia blockchain  
✅ Anyone can view it on Etherscan  
✅ You can cast votes that are permanently recorded  
✅ Dashboard shows real-time results  
✅ All transactions are publicly verifiable  

---

## 📊 Testing Multiple Votes

To simulate multiple voters:

1. Vote once
2. Clear session storage (F12 → Application → Session Storage → Clear)
3. Refresh page
4. Click "Scan Voter ID" again (new voter)
5. Vote again
6. Repeat as needed

Each scan generates a unique voter, so you can test the full system!

---

## 🚀 Ready to Deploy?

Follow the 6 steps above in order. Each step should take less than 2 minutes.

**Total time: ~10 minutes for first deployment**

Let me know when you complete each step and I can help if you encounter any issues!
