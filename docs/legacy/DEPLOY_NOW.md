# 🚀 Deploy to Sepolia NOW - Final Step

## Your Account
**Address:** `0xEAFB6F9923d11496298993355bca0ca045e36aE7`  
**Network:** Sepolia Testnet  
**Balance:** 0.05 ETH ✅

---

## Option 1: Deploy Using Command Line (Recommended)

### Step 1: Add Your Private Key

Open the `.env` file and replace `YOUR_PRIVATE_KEY_HERE` with your actual private key:

```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_actual_private_key_from_metamask
```

**How to get your private key from MetaMask:**
1. Open MetaMask
2. Click three dots (⋮) → Account details
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key
6. Paste it in `.env` file

### Step 2: Deploy Contract

Run this command:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected Output:**
```
Deploying VotingWithMerkle contract to Sepolia...
Deploying with account: 0xEAFB6F9923d11496298993355bca0ca045e36aE7
Account balance: 0.05 ETH
VotingWithMerkle deployed to: 0xYourContractAddress

=== SAVE THIS INFORMATION ===
Contract Address: 0xYourContractAddress
Network: Sepolia Testnet
Etherscan: https://sepolia.etherscan.io/address/0xYourContractAddress
=============================
```

### Step 3: Update Frontend Config

Copy the contract address from the output above, then:

1. Open `frontend/js/config.js`
2. Find line 4: `CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",`
3. Replace with: `CONTRACT_ADDRESS: "0xYourContractAddress",`
4. Save the file

### Step 4: Start Frontend

```bash
npx http-server frontend -p 8000
```

Then open: `http://localhost:8000`

---

## Option 2: Deploy Using Remix IDE (No Private Key Needed Locally)

If you prefer not to put your private key in a file:

### Step 1: Open Remix

Go to: https://remix.ethereum.org/

### Step 2: Create Contract File

1. Click "File Explorer" (📁 icon)
2. Create new file: `VotingWithMerkle.sol`
3. Copy the entire content from `contracts/VotingWithMerkle.sol`
4. Paste into Remix

### Step 3: Compile

1. Click "Solidity Compiler" (🔧 icon)
2. Select compiler version: `0.8.19`
3. Click "Compile VotingWithMerkle.sol"

### Step 4: Deploy

1. Click "Deploy & Run Transactions" (🚀 icon)
2. Environment: Select "Injected Provider - MetaMask"
3. MetaMask will popup - connect your account
4. Make sure MetaMask is on Sepolia network
5. Constructor parameters:
   - `_ROOT`: `0x0000000000000000000000000000000000000000000000000000000000000000`
   - `_CANDIDATECOUNT`: `5`
6. Click "Deploy"
7. Confirm transaction in MetaMask
8. Wait for confirmation (~15 seconds)
9. Copy the deployed contract address

### Step 5: Update Frontend Config

Same as Option 1, Step 3 above.

---

## Option 3: I Can Help Deploy (Need Private Key)

If you want me to deploy it for you:

1. Provide your private key (I'll use it only for deployment)
2. I'll deploy the contract
3. I'll update the config file automatically
4. You can then start the frontend

**Note:** Only share private keys for testnet accounts, never mainnet!

---

## After Deployment

Once deployed, you need to:

1. ✅ Update `frontend/js/config.js` with contract address
2. ✅ Start frontend server: `npx http-server frontend -p 8000`
3. ✅ Open browser: `http://localhost:8000`
4. ✅ Connect MetaMask (Sepolia network)
5. ✅ Test voting!

---

## Quick Test Commands

After deployment, test everything:

```bash
# Start frontend
npx http-server frontend -p 8000

# In browser:
# 1. Go to http://localhost:8000
# 2. Click "Scan Voter ID"
# 3. Vote for a candidate
# 4. Check dashboard
```

---

## What Gets Deployed

- **Contract Name:** VotingWithMerkle
- **Network:** Sepolia Testnet
- **Initial Root:** 0x000...000 (empty tree)
- **Candidates:** 5 (hardcoded in frontend)
- **Admin:** Your account (0xEAFB6F9923d11496298993355bca0ca045e36aE7)
- **Gas Cost:** ~0.001 ETH (~$0.01)

---

## Choose Your Option

**Option 1** - Fastest, requires private key in .env  
**Option 2** - Safest, uses MetaMask directly  
**Option 3** - I deploy for you, need private key  

Which option do you prefer?
