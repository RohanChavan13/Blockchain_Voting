# 🎤 Hackspiration '26: CampusVote AI - Methodology & Security Pitch

## 💡 The Problem
In modern campus elections, **hardware failure** (fingerprint sensors breaking) and **privacy concerns** (admins seeing votes) are critical blockers. Existing systems either compromise on security (weak ID checks) or privacy (linking ID to vote).

## 🛡️ Our Solution: "Bio-Secure Ephemeral Voting"
We built **CampusVote AI**, a decentralized voting platform that decouples **Authentication** from **Authorization**.

### 1. Hardware-Agnostic Biometrics (The "Sensor Swap" Logic)
*   **The Challenge**: Fingerprint sensors break. Replacement sensors have empty memory, locking out registered users.
*   **Our Fix**: We implemented a **Template Sync Protocol**.
    *   Fingerprints are stored as **Encrypted Templates** in a central secure database, not just on the sensor.
    *   If a sensor fails, the Admin triggers a **"Hot Swap Restore"**: The backend decrypts and pushes all valid templates to the *new* sensor instantly.
    *   **Result**: Zero downtime. Users don't need to re-register.

### 2. Privacy-First "Ephemeral Tokens"
*   **The Challenge**: How to verify a user is eligible without tracking *who* they voted for?
*   **Our Fix**: **The Token Dispenser Model**.
    1.  **Auth**: User proves identity (Fingerprint).
    2.  **Check**: Backend verifies Club Membership & "Has Not Voted" status.
    3.  **Dispense**: Backend creates a **One-Time-Use Algorand Account**, funds it with **1 Vote Token**, and hands the private key to the User's browser.
    4.  **Vote**: The User's browser signs the transaction *locally*.
    5.  **Forget**: The backend *immediately* discards the key mapping.
    *   **Result**: The Blockchain sees `Ephemeral_Account -> Candidate`, making the vote mathematically untraceable to the Student ID.

### 3. Club-Based Classification (Scalability)
*   **Logic**: Using a relational model, students belong to multiple Clubs (Hash-Map in memory for Hackathon speed).
*   **Snapshot**: We create an "Election Electorate" snapshot at start time, locking the eligibility list to prevent last-minute stuffing.

## 🏗️ Tech Stack
*   **Authentication**: R305 Fingerprint Sensor + Node.js (Serial)
*   **Backend**: Node.js + WebSocket (Real-time status)
*   **Blockchain**: Algorand (PyTeal Smart Contracts + Box Storage for Nullifiers)
*   **Frontend**: React (Responsive & fast)

## ✅ Why It Wins
*   **Resilient**: Survives hardware failure (unlike peers).
*   **Private**: True secret ballot on a public ledger.
*   **Realistic**: Modeling real-world constraints (Club memberships, double-voting prevention).
