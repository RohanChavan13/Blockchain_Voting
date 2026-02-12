# Algorand Smart Contract for CampusVote AI

This directory contains the Algorand Smart Contract (PyTeal) implementation for the Hackspiration '26 Hackathon submission.

## 📂 Files

- `voting.py`: The main smart contract logic written in PyTeal.
- `deploy.py`: Script to deploy the compiled contract to Algorand Localnet/Testnet.
- `requirements.txt`: Python dependencies.

## 🚀 Setup & Deployment

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Compile Contract
Generate the TEAL assembly code from the Python source:
```bash
python voting.py
```
This will create `vote_approval.teal` and `vote_clear.teal`.

### 3. Configure Deployment
Open `deploy.py` and replace `YOUR TWENTY FIVE WORD MNEMONIC HERE` with your Algorand wallet mnemonic.
- For Localnet/Sandbox, use the default accounts provided by `algokit localnet status`.
- For Testnet, create a wallet on Pera Algo Wallet, switch to Testnet, get funds from dispenser, and use its mnemonic.

### 4. Deploy
```bash
python deploy.py
```
The script will output the **Application ID**. Save this ID.

### ⚠️ IMPORTANT: Box Storage Funding

This contract uses **Box Storage** to track unique voters (nullifiers). 
Before any votes can be cast, you **MUST send some Algos (e.g., 2-5 ALGO)** to the Application Address to cover the Minimum Balance Requirement (MBR) for creating boxes.

1.  Get the Application Address from the App ID (using an explorer or SDK).
2.  Send 5 ALGO to that address.

## 🔗 Integration

Once deployed, update your frontend to call this Application ID using `algosdk` in JavaScript (instead of `ethers.js`).
