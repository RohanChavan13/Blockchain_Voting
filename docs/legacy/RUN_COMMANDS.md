# 🚀 COMMANDS TO RUN YOUR PROJECT

## ✅ Everything is Fixed and Ready!

---

## 📋 Quick Start (3 Commands)

### 1. Start the Frontend Server

```bash
npx http-server frontend -p 8000
```

**What this does:**
- Starts server on http://localhost:8000
- Serves your voting website
- Keep this terminal open

---

### 2. Open Your Browser

Go to: **http://localhost:8000**

---

### 3. Test the Full Flow

1. **MetaMask popup** → Click "Connect"
2. **Click "Scan Voter ID"** → Mock data generates
3. **Click "Proceed to Voting"** → See 5 candidates
4. **Click a candidate** → Confirmation dialog
5. **Click "Confirm Vote"** → MetaMask transaction
6. **Approve** → Vote recorded!
7. **Check dashboard** → See your vote counted

---

## 🎯 What Happens When You Vote:

1. **Merkle root updates** → Contract stores voter registry (costs ~0.0001 ETH)
2. **Vote transaction** → Your vote recorded (costs ~0.0001 ETH)
3. **Total cost per vote:** ~0.0002-0.0003 ETH (~$0.50 USD)

---

## 📊 View Results

### Dashboard:
http://localhost:8000/dashboard.html

Shows:
- Total votes
- Vote counts per candidate
- Charts (bar and donut)
- Real-time updates

### Etherscan:
https://sepolia.etherscan.io/address/0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC

Shows:
- All transactions
- Vote events
- Gas fees
- Contract state

---

## 🔄 Test Multiple Votes

To vote again (simulate different voter):

1. Press **F12** → Application → Session Storage → Clear
2. Refresh page
3. Click "Scan Voter ID" again (new voter!)
4. Vote again

Each scan = unique voter!

---

## 🛑 Stop the Server

Press **Ctrl+C** in the terminal

---

## ✅ Your Deployed Contract

**Address:** `0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC`

**Network:** Sepolia Testnet

**Your Account:** `0xEAFB6F9923d11496298993355bca0ca045e36aE7`

**View on Etherscan:**
- Contract: https://sepolia.etherscan.io/address/0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC
- Your Account: https://sepolia.etherscan.io/address/0xEAFB6F9923d11496298993355bca0ca045e36aE7

---

## 💡 Troubleshooting

### MetaMask not connecting?
- Refresh page
- Make sure you're on Sepolia network
- Check MetaMask is unlocked

### Transaction failing?
- Make sure you have enough Sepolia ETH (need ~0.001 ETH)
- Check you're on Sepolia network
- Try refreshing and voting again

### Dashboard not showing votes?
- Wait 15-30 seconds for blockchain confirmation
- Click the refresh button
- Check Etherscan to verify transaction confirmed

---

## 🎉 SUCCESS CHECKLIST

After running, you should see:

- ✅ Server running on port 8000
- ✅ Website opens in browser
- ✅ MetaMask connects
- ✅ Can scan voter ID
- ✅ Can see 5 candidates
- ✅ Can vote
- ✅ Transaction confirms
- ✅ Dashboard shows vote
- ✅ Etherscan shows transaction

---

## 🚀 READY TO RUN!

**Just run this command:**

```bash
npx http-server frontend -p 8000
```

**Then open:** http://localhost:8000

**That's it!** 🎊
