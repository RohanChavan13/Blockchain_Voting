# 🗳️ Secure Campus Voting System Design - System Architecture & Implementation

## 📌 Executive Summary
A professional-grade, decentralized, and privacy-preserving electronic voting system designed for college campuses. This architecture integrates **Biometric Authentication (Fingerprint)** for secure identity verification with **Algorand Blockchain** for immutable, tamper-proof vote recording.

**Key Innovations:**
1.  **Sensor-Agnostic Identity**: Decouples physical biometric sensors from user identity by centralizing encrypted template storage.
2.  **Anonymous Token Issuance**: Utilizes a "Token Dispenser" pattern with blind signatures or ephemeral keys to break the link between voter identity and ballot choice.
3.  **Resilient Architecture**: Designed to survive sensor failure, network outages, and power loss without data corruption.

---

## 🏗️ 1. Concept & Architecture

### High-Level System Architecture Reference
```mermaid
graph TD
    User((User)) -->|Biometric Scan| Sensor[Fingerprint Sensor]
    Sensor -->|Raw Template/ID| Backend[Node.js Backend Authority]
    Backend -->|Auth Check| DB[(Secure Database)]
    Backend -->|Check Membership| Clubs[Club Management Module]
    
    subgraph "Blockchain Layer (Algorand)"
        SmartContract[Voting Smart Contract]
        VoteToken[ASA - Vote Token]
        BoxStorage[Nullifier Storage]
    end

    Backend -->|Issue Blind Token| Frontend[Web Interface]
    Frontend -->|Cast Vote (Anonymous)| SmartContract
    
    SmartContract -->|Store Vote| Ledger[(Immutable Ledger)]
```

### Core Components
1.  **Registration Station (Admin Controlled)**:
    *   **Hardware**: Fingerprint Sensor A (e.g., R305/R307) connected via USB/Serial to Admin PC or dedicated kiosk.
    *   **Software**: Node.js registration client.
    *   **Function**: Captures raw fingerprint templates (not images), encrypts them, and sends them to the Central Backend with User Metadata (Student ID, Name).

2.  **Central Authentication Backend (The "Authority")**:
    *   **Stack**: Node.js + Express.
    *   **Database**: PostgreSQL (Users, Clubs, Election Config) + Redis (Session/Rate Limiting).
    *   **Security**: Stores *Encrypted Templates*, not raw images. Manages the "Who is allowed to vote?" logic.
    *   **Sensor Management**: Handles the "Sync" process to push templates to replacement sensors.

3.  **Voting Station (Client)**:
    *   **Hardware**: Fingerprint Sensor B (or C, D...) connected to a local client (Raspberry Pi or Laptop).
    *   **Software**: React/HTML Frontend + Lightweight Node.js Bridge (for hardware comms).
    *   **Function**: Authenticates user -> Requests Voting Token -> Submits Vote to Blockchain.

4.  **Blockchain Layer (Algorand)**:
    *   **Smart Contract**: PyTeal logic.
    *   **Assets**: Algorand Standard Assets (ASA) representing Votes (1 Token = 1 Vote).
    *   **Storage**: Box Storage to track used "Nullifiers" (prevent double voting without revealing identity).

---

## 🔐 2. Security & Privacy Design

### 2.1 Threat Model & Mitigations
| Threat | Mitigation Strategy |
| :--- | :--- |
| **Replay Attack** (Re-using a scan) | **Challenge-Response**: Backend sends a random nonce. Sensor/Client must sign the nonce (if capable) or include a timestamp + nonce in the API request, signed by a session key. |
| **Sensor Replacement / Failure** | **Template Validated Restore**: Templates are stored in Backend DB. When a new sensor is connected, the Admin triggers a "Sync" to upload all valid templates to the new hardware, preserving User IDs. |
| **Admin Viewing Votes** | **Blind Token Issuance**: The backend issues a generic "Voting Token" (ASA) to a *fresh, ephemeral address* (or via Blind Signature) after checking eligibility. The vote transaction does not contain User ID. |
| **Double Voting** | **Nullifiers**: When a Token is issued, the User ID is marked "Has Voted" in the backend DB for that election. The Smart Contract also checks if the unique Token ID has been spent (Asset transfer). |
| **Network Outage** | **Offline Queue**: The voting client queues the signed transaction locally with a timestamp (if allowed by election rules) and broadcasts when online. *Note: For strict real-time, voting pauses.* |
| **Fake API Calls** | **HMAC Sig**: All hardware-to-backend communication includes an HMAC signature using a shared secret stored in the hardware bridge env. |

### 2.2 Privacy: The "Blind Token" Workflow
To ensure the Admin cannot see who voted for whom:
1.  **Auth**: User scans finger at Voting Station. Backend validates identity.
2.  **Eligibility**: Backend checks `Elections` table: Is active? Is member? Has voted?
3.  **Issuance**:
    *   If valid, Backend generates a temporary Algorand Account (KeyPair).
    *   Backend funds this account with min-balance + **1 Vote Token (ASA)**.
    *   Backend sends the *Private Key* of this temp account to the User's Browser (Client).
    *   Backend *immediately* discards the key from memory and logs "User X received a token" (but not *which* key).
4.  **Voting**:
    *   User's Browser uses the Private Key to sign a transaction sending the **1 Vote Token** to the Candidate's Address.
    *   The Blockchain sees: `TempAccount -> CandidateAddress`. No link to User X.

---

## 🗄️ 3. Database Schema (SQL - Recommended)

### `Users` Table
*   `user_id` (PK, UUID): Internal unique identifier.
*   `student_id` (String, Unique): Official college ID.
*   `full_name` (String).
*   `fingerprint_template_enc` (Text): Base64 encoded, encrypted fingerprint template from Sensor. **Crucial for sensor restoration.**
*   `created_at` (Timestamp).

### `Clubs` Table
*   `club_id` (PK, UUID).
*   `name` (String): e.g., "Computer Science Club", "Music Society".
*   `admin_id` (FK -> Users).

### `ClubMemberships` Table
*   `user_id` (FK).
*   `club_id` (FK).
*   **Snapshot Logic**: This table defines the *electorate* before the election starts.

### `Elections` Table
*   `election_id` (PK, UUID).
*   `club_id` (FK).
*   `start_time`, `end_time`.
*   `is_active` (Boolean).
*   `contract_app_id` (Int): Algorand Application ID.

### `VoteRecords` Table (Privacy-Preserving)
*   `election_id` (FK).
*   `user_id` (FK).
*   `has_obtained_token` (Boolean, Default: False).
*   `token_issued_at` (Timestamp).
*   *Note: This strictly tracks "Who showed up", NOT "Who they voted for".*

---

## 🔄 4. Process Flows

### 4.1 Fingerprint Registration (Sensor A)
1.  **Admin Mode**: Admin logs in to Registration Client.
2.  **User Entry**: Admin enters Student ID & Name.
3.  **Scan**: User places finger on Sensor A.
    *   Sensor generates a **Template** (e.g., 512-byte hex string). *Do not just save the internal ID (e.g., 1).*
4.  **Storage**:
    *   Client sends `(Student Data, Template)` to Backend.
    *   Backend encrypts `Template` -> `EncTemplate`.
    *   Backend stores user and `EncTemplate` in DB.
    *   *(Optional)* Backend uploads Template to Sensor A's internal library to verify immediately.

### 4.2 Handling Sensor Failure (The "Swap" Scenario)
*Scenario: Sensor A breaks. Sensor B is plugged in (and is empty).*
1.  **Detection**: Backend/Bridge detects new device serial or empty library.
2.  **Restoration**: Admin triggers **"Sync Templates"** command.
3.  **Download**: Backend fetches all valid `EncTemplates` from DB.
4.  **Decrypt & Upload**: Backend decrypts and pushes templates to Sensor B using the sensor's `storeTemplate` command.
5.  **Mapping**: Backend updates any cache mapping `Internal_Sensor_ID` to `User_ID`.
6.  **Result**: Users can now vote on Sensor B without re-registering.

### 4.3 Voting Flow (Day of Election)
1.  **Select**: User selects "CS Club Election" on the kiosk.
2.  **Authenticate**: User scans finger.
    *   Sensor matches finger -> Returns `Internal_ID`.
    *   Backend maps `Internal_ID` -> `User_ID`.
3.  **Validation**:
    *   Backend: `SELECT * FROM ClubMemberships WHERE user_id = ? AND club_id = ?`
    *   Backend: `SELECT * FROM VoteRecords WHERE user_id = ? AND election_id = ?`
4.  **Token Dispense**:
    *   If eligible, Backend creates ephemeral account `Temp_Acc`.
    *   Backend transfers **1 Vote Token** to `Temp_Acc`.
    *   Backend inserts row into `VoteRecords` (`user_id`, `has_obtained_token` = true).
    *   Backend returns `Temp_Acc.PrivateKey` to Client.
5.  **Cast**:
    *   Client signs transaction: `Send 1 Vote Token from Temp_Acc to Candidate_Y`.
    *   Client broadcasts to Algorand Node.
6.  **Confirmation**: Client shows "Vote Submitted" and wipes key from memory.

---

## 🧪 5. Testing & Failure Scenarios

### 5.1 Biometric Edge Cases
*   **Test Case**: *User finger is wet/dirty.* -> **Expected**: Sensor fails match. Retry 3x. Fallback to PIN (if policy allows) or deny.
*   **Test Case**: *Sensor disconnected during scan.* -> **Expected**: Client detects timeout, shows "Hardware Error", alerts Admin.

### 5.2 Election Logic
*   **Test Case**: *User in multiple clubs.* -> **Expected**: System shows list of *available* elections for that user.
*   **Test Case**: *Double Voting.* -> **Expected**: Second attempt fails at "Validation" step (Backend sees `has_obtained_token = true`).

### 5.3 Infrastructure Failure / Disaster Recovery
*   **Scenario**: *Power fails during vote cast.*
    *   **Recovery**: The blockchain transaction is atomic. If it didn't confirm, the user checks status. The backend sees `has_obtained_token=true`.
    *   *Correction*: If backend marked "Issued" but client crashed before casting?
    *   **Fix**: Implement a "Check Status" endpoint. If User authenticates and DB says "Token Issued" but Blockchain says "Temp_Account has unused Token", strictly RE-SEND the private key (cached for 5 mins) or allow user to recover the session.
*   **Scenario**: *Blockchain Congestion.*
    *   **Mitigation**: Client submits asynchronously. The UI shows "Vote Pending Confirmation".

---

## 🚀 Hackathon Implementation Strategy (Quick Wins)

For the hackathon, implement the critical path:
1.  **Mock the "Sync"**: Implement a `restore_templates(sensor)` function in `arduino_bridge.js` that iterates through a JSON file of templates and sends them to the sensor.
2.  **Simulate Privacy**: Use a standard Algorand logical breakdown. Don't build complex ZKP. Just use the "Ephemeral Account" method—it's visually impressive and easy to verify (Judges can see the new account creation on AlgoExplorer).
3.  **Visuals**: Show a real-time "Election Monitor" dashboard that listens to the Algorand address and updates charts instantly when a vote block is confirmed.

