# 🚀 Run Your Blockchain Voting Project

## Quick Start Command

### Option 1: Double-click the batch file
```
RUN_PROJECT.bat
```
Just double-click `RUN_PROJECT.bat` in Windows Explorer

### Option 2: Run from terminal
```bash
npx http-server frontend -p 8000 -o
```

### Option 3: PowerShell
```powershell
cd frontend
npx http-server -p 8000 -o
```

---

## What Happens

1. Server starts on port 8000
2. Browser opens automatically to http://localhost:8000
3. You'll see the authentication page
4. MetaMask will popup asking to connect

---

## Access URLs

- **Main Page:** http://localhost:8000
- **Voting Page:** http://localhost:8000/voting.html
- **Dashboard:** http://localhost:8000/dashboard.html
- **Receipt:** http://localhost:8000/receipt.html

---

## Your Deployed Contract

**Contract Address:** `0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC`

**View on Etherscan:**
- Contract: https://sepolia.etherscan.io/address/0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC
- Your Account: https://sepolia.etherscan.io/address/0xEAFB6F9923d11496298993355bca0ca045e36aE7

---

## Testing Flow

1. **Connect MetaMask** (popup appears automatically)
2. **Ensure Sepolia network** is selected
3. **Click "Scan Voter ID"** - Generates mock voter data
4. **Select a candidate** - Choose from A, B, C, D, or E
5. **Confirm vote** - Approve in MetaMask
6. **View receipt** - See transaction hash
7. **Check dashboard** - View live results

---

## Stop the Server

Press **Ctrl+C** in the terminal window

---

## Troubleshooting

### MetaMask not connecting?
- Make sure MetaMask is installed
- Switch to Sepolia test network
- Refresh the page

### Candidates not showing?
- Hard refresh: Ctrl+F5
- Clear browser cache
- Check browser console for errors

### Transaction failing?
- Check you have Sepolia ETH
- Verify you're on Sepolia network
- Try increasing gas limit

---

## 🎉 Ready to Test!

Run the command and start voting on the blockchain! 🗳️
