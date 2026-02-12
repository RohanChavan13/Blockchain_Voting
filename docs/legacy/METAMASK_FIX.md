# 🔧 MetaMask Connection Fix

## ⚠️ Error: "Failed to fetch" / RPC Error

This error means MetaMask can't connect to Sepolia network.

---

## ✅ SOLUTION - Fix MetaMask Network:

### Step 1: Open MetaMask

Click the MetaMask extension icon

### Step 2: Check Network

Look at the top - it should say "Sepolia test network"

If it says something else or shows an error:

### Step 3: Add/Fix Sepolia Network

1. Click the network dropdown (top of MetaMask)
2. Click "Add network" or "Add a network manually"
3. Enter these details:

```
Network Name: Sepolia
RPC URL: https://rpc.sepolia.org
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

4. Click "Save"
5. Select "Sepolia" network

### Step 4: Refresh Browser

- Close all tabs of localhost:8000
- Hard refresh: Ctrl+F5
- Open http://localhost:8000 again

---

## 🔄 Alternative: Use Different RPC

If Sepolia RPC is down, try these alternatives:

### Option 1: Alchemy (Recommended)
```
https://eth-sepolia.g.alchemy.com/v2/demo
```

### Option 2: Infura
```
https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
```

### Option 3: Public RPC
```
https://rpc2.sepolia.org
```

**How to change:**
1. Open MetaMask
2. Settings → Networks → Sepolia
3. Change RPC URL
4. Save

---

## ✅ Force MetaMask Connection Popup:

If MetaMask doesn't show connection popup:

### Method 1: Disconnect and Reconnect

1. Open MetaMask
2. Click the three dots (⋮)
3. Connected sites
4. Find localhost:8000
5. Click "Disconnect"
6. Refresh page
7. MetaMask will popup again

### Method 2: Lock and Unlock

1. Open MetaMask
2. Click account icon → Lock
3. Unlock MetaMask
4. Refresh page

### Method 3: Clear Site Permissions

1. MetaMask → Settings → Advanced
2. Clear activity and nonce data
3. Refresh page

---

## 🎯 After Fixing:

1. **Refresh page:** Ctrl+F5
2. **MetaMask popup** should appear
3. **Click "Connect"**
4. **Select your account**
5. **Click "Next" → "Connect"**
6. **Now try voting!**

---

## 💡 Quick Test:

To test if MetaMask works:

1. Open browser console (F12)
2. Paste this:
```javascript
ethereum.request({ method: 'eth_requestAccounts' })
```
3. Press Enter
4. **MetaMask should popup!**

If it doesn't popup, MetaMask has an issue.

---

## 🆘 Still Not Working?

### Check These:

1. ✅ MetaMask is unlocked
2. ✅ On Sepolia network
3. ✅ Have Sepolia ETH (check balance)
4. ✅ No other wallet extensions (Coinbase, etc.)
5. ✅ Browser allows popups from localhost
6. ✅ MetaMask is latest version

### Try This:

1. **Restart browser completely**
2. **Disable other wallet extensions**
3. **Try incognito/private mode**
4. **Update MetaMask to latest version**

---

## ✅ Success Checklist:

After fixing, you should see:

- ✅ MetaMask popup appears
- ✅ Can connect account
- ✅ Network shows "Sepolia"
- ✅ No RPC errors
- ✅ Can vote successfully

---

**Fix MetaMask network settings and try again!** 🚀
