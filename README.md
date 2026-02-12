# 🗳️ CampusVote AI: Bio-Secure Blockchain Voting

### 🏆 Hackspiration '26 Project Submission
**Tracks:** Blockchain (Algorand), AI/ML, Verified Compute

> A next-generation decentralized voting system that combines **AI Face Liveness Detection** and **Biometric Fingerprint Security** with the **Algorand Blockchain** for trusted campus elections.

---

## 🚀 Key Features (Why we built this)

1.  **🤖 AI Face Verification ("Bio-Secure AI Guard")**:
    *   Prevents proxy voting using `face-api.js` for real-time liveness detection.
    *   Ensures only a physical human is present before unlocking the ballot, adding a critical security layer.

2.  **⛓️ Algorand Smart Contract**:
    *   Core voting logic migrated to **PyTeal** (Algorand Python SDK) for high-speed, finality-guaranteed voting.
    *   Uses **Box Storage** to track unique voter nullifiers efficiently.

3.  **👆 Dual-Factor Authentication**:
    *   Requires both **Face ID** (AI) AND **Fingerprint** (Hardware) to cast a vote.

---

## 🛠️ Instructions for Judges (How to Run)

We have created a **One-Click Script** to launch the entire demo environment.

### Prerequisites
*   Node.js (v16+)
*   Python (3.x)

### 1️⃣ Quick Start (Recommended)
Simply run the included batch script in the root directory:

```powershell
.\run_hackathon.bat
```

This script will automatically:
1.  Install necessary Python dependencies (`pyteal`, `py-algorand-sdk`).
2.  Compile the Algorand Smart Contract (`vote_approval.teal`).
3.  Launch the **Backend API** (Fingerprint Server).
4.  Launch the **Frontend Web App** (AI Interface).
5.  Open your browser to the voting page.

### 2️⃣ Manual Setup (If script fails)
If you prefer manual control:

**Backend:**
```bash
cd backend
npm install
node server.js
```

**Frontend:**
```bash
# In a new terminal
npx http-server frontend -p 8000
```

**Smart Contract (Algorand):**
```bash
cd algorand
pip install -r requirements.txt
python voting.py
# Use deploy.py to deploy to Testnet if needed
```

---

## 📂 Project Structure

*   `/frontend`: The AI-powered web interface (HTML/JS/CSS).
    *   `/js/ai-auth.js`: The core logic for Face Liveness Detection.
*   `/algorand`: The Python Smart Contracts for Algorand.
    *   `voting.py`: The main PyTeal contract logic.
*   `/backend`: Node.js server handling fingerprint hardware communication.
*   `/contracts`: Legacy Ethereum contracts (for reference).

---

## 🔗 Live Demo / Video
[Insert Link Here if applicable]

---

**Team:** Metaminds
**Hackathon:** Hackspiration '26
