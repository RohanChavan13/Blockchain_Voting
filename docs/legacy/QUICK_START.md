# 🚀 Quick Start - 5 Minutes to Running System

## What You Have

✅ Sepolia testnet account with 0.05 ETH  
✅ Complete blockchain voting system code  
✅ Smart contract ready to deploy  
✅ Frontend with glassmorphism UI  

## What You Need to Do (5 Steps)

### 1️⃣ Install Dependencies (1 minute)

```bash
npm install
```

### 2️⃣ Create .env File (30 seconds)

Create a file named `.env` in the root folder:

```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_metamask_private_key_here
```

**Get your private key:**
- Open MetaMask → Three dots → Account Details → Export Private Key

### 3️⃣ Deploy Contract (1 minute)

```bash
npm run deploy
```

**Copy the contract address from the output!**

### 4️⃣ Update Config (30 seconds)

Open `frontend/js/config.js` and replace:

```javascript
CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",
```

With your actual contract address:

```javascript
CONTRACT_ADDRESS: "0xYourContractAddressHere",
```

### 5️⃣ Run Frontend (30 seconds)

```bash
npx http-server frontend -p 8000
```

Or use VS Code Live Server extension.

## 🎉 Done! Open Browser

Go to: `http://localhost:8000`

## How to Use

1. **Click "Scan Voter ID"** → Generates mock voter data
2. **Select a candidate** → Choose from 5 candidates
3. **Confirm vote** → Approve in MetaMask
4. **View results** → Check dashboard for live counts

## Key Features

- 🔘 **One-click voter ID generation** (no hardware needed)
- 🗳️ **5 default candidates** (A, B, C, D, E)
- ⛓️ **Sepolia blockchain** (your testnet)
- 🎨 **Glassmorphism UI** (modern design)
- 📊 **Live dashboard** (real-time charts)
- 🔒 **Double-vote prevention** (blockchain enforced)

## Test Multiple Votes

1. Vote once
2. Press F12 → Application → Session Storage → Clear
3. Refresh page
4. Click "Scan Voter ID" again (new voter)
5. Vote again

Each scan = new unique voter!

## Troubleshooting

**"npm not found"** → Install Node.js  
**"Insufficient funds"** → Get more Sepolia ETH from faucet  
**"Wrong network"** → Switch MetaMask to Sepolia  
**"Already voted"** → Clear session storage and scan again  

## What Happens When You Click "Scan"

1. Generates random mock voter ID
2. Creates cryptographic hash (keccak256)
3. Checks if already voted on blockchain
4. Stores session data
5. Redirects to voting page

## Architecture

```
Browser → MetaMask → Sepolia Testnet → Smart Contract
   ↓
Mock Scan → Hash → Merkle Proof → Vote Transaction
```

## Files You Created

```
blockchain-voting-system/
├── contracts/VotingWithMerkle.sol    ← Smart contract
├── frontend/
│   ├── index.html                     ← Auth page
│   ├── voting.html                    ← Voting page
│   ├── dashboard.html                 ← Results page
│   ├── css/styles.css                 ← Glassmorphism design
│   └── js/
│       ├── config.js                  ← Contract address HERE
│       ├── auth.js                    ← Mock scan logic
│       ├── voting.js                  ← Voting logic
│       ├── dashboard.js               ← Charts & results
│       ├── merkle.js                  ← Proof generation
│       └── web3.js                    ← Blockchain connection
├── scripts/deploy.js                  ← Deployment script
└── package.json                       ← Dependencies
```

## Ready to Deploy?

Follow the 5 steps above and you'll have a working blockchain voting system in 5 minutes! 🎉

For detailed troubleshooting, see `DEPLOYMENT_GUIDE.md`
