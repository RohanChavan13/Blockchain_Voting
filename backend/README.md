# Arduino Blockchain Voting Backend

This backend integrates Arduino Bluetooth input with blockchain voting using C++ trie hash fusion.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Install Build Tools (Windows)
```bash
# Install Visual Studio Build Tools or Visual Studio Community
# Install Python 3.x
npm install -g node-gyp
```

### 3. Compile C++ Module
```bash
npm run build-cpp
```

### 4. Start Backend Server
```bash
npm start
```

### 5. Test Arduino Connection
```bash
node test_arduino.js
```

## 🔌 Arduino Setup

### Hardware Requirements
- Arduino Uno/Nano/ESP32
- HC-05/HC-06 Bluetooth module
- USB cable for connection to laptop

### Arduino Code
Upload this code to your Arduino:

```cpp
#include <SoftwareSerial.h>

SoftwareSerial BTSerial(10, 11); // RX, TX

void setup() {
  Serial.begin(9600);
  BTSerial.begin(9600);
  Serial.println("Bluetooth ready...");
}

void loop() {
  if (BTSerial.available()) {
    String msg = BTSerial.readStringUntil('\n');
    Serial.print("Received: ");
    Serial.println(msg);
  }
}
```

### Bluetooth App Setup
1. Install "Arduino Bluetooth Control" app on your phone
2. Pair with HC-05/HC-06 module (PIN: 1234 or 0000)
3. Send 12-digit numbers (e.g., 123456789012)

## 📡 Backend Integration

### Direct USB Connection
The backend reads Arduino data via:
1. **WebSocket API**: Real-time data streaming
2. **HTTP Endpoints**: Direct data input
3. **File Watching**: Monitor arduino_data.txt

### API Endpoints

#### Arduino Status
```
GET /api/arduino/status
```

#### Direct Data Input
```
POST /api/arduino/data
Content-Type: application/json
{
  "data": "Received: 123456789012"
}
```

#### Verify Voter
```
POST /api/verify-voter
Content-Type: application/json
{
  "voterHash": "0x..."
}
```

#### Get All Voters
```
GET /api/voters
```

### WebSocket Events
Connect to `ws://localhost:8080` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Arduino data:', data);
};
```

## 🔧 C++ Trie Hash Fusion

### Features
- **Multi-layer Hash Fusion**: SHA256 + Keccak256 + Blake2b
- **Merkle Trie Structure**: Efficient voter verification
- **Nullifier Hashes**: Prevents double voting
- **Cryptographic Security**: Enterprise-grade hashing

### C++ Module Functions
```javascript
const trieHashFusion = require('./cpp/trie_hash_fusion');

// Process voter ID
const result = trieHashFusion.processVoterID(voterInput, salt, timestamp);

// Verify voter
const exists = trieHashFusion.verifyVoter(voterHash);

// Get trie statistics
const stats = trieHashFusion.getTrieStats();
```

## 🧪 Testing

### Simulate Arduino Input
```bash
# Method 1: HTTP API
curl -X POST http://localhost:3001/api/simulate-arduino \
  -H "Content-Type: application/json" \
  -d '{"voterIdInput": "123456789012"}'

# Method 2: File input
echo "Received: 123456789012" >> arduino_data.txt
```

### Test C++ Module
```bash
node test_arduino.js
```

## 🔄 Data Flow

1. **Arduino Bluetooth** → Receives 12-digit ID from phone app
2. **Arduino USB** → Sends data to laptop via Serial/USB
3. **Backend Server** → Processes data with C++ trie hash fusion
4. **WebSocket** → Broadcasts to frontend in real-time
5. **Frontend** → Auto-authenticates voter and enables voting
6. **Blockchain** → Records vote with Merkle proof verification

## 🛠️ Troubleshooting

### C++ Compilation Issues
```bash
# Windows: Install Visual Studio Build Tools
# Linux: sudo apt-get install build-essential
# macOS: xcode-select --install

# Clear and rebuild
npm run clean
npm run build-cpp
```

### Arduino Connection Issues
1. Check COM port in Device Manager (Windows)
2. Ensure Arduino IDE Serial Monitor is closed
3. Try different USB ports/cables
4. Verify baud rate (9600)

### WebSocket Connection Issues
1. Check if port 8080 is available
2. Disable firewall/antivirus temporarily
3. Try different ports in server.js

## 📊 Monitoring

### Backend Logs
```bash
npm start
# Watch for:
# ✅ Arduino connected
# 📱 12-digit Voter ID received
# ✅ Voter processed and stored
```

### Frontend Integration
The frontend automatically connects to the backend and shows:
- Arduino connection status
- Real-time voter ID reception
- Automatic authentication flow

## 🔐 Security Features

1. **Trie Hash Fusion**: Multi-algorithm cryptographic hashing
2. **Nullifier Hashes**: Prevents double voting attempts
3. **Merkle Proofs**: Cryptographic verification of voter eligibility
4. **Temporal Salting**: Time-based hash uniqueness
5. **WebSocket Security**: Real-time secure communication

## 📈 Production Deployment

For production use:
1. Replace mock data with real voter database
2. Implement proper authentication/authorization
3. Use HTTPS/WSS for secure connections
4. Add rate limiting and input validation
5. Deploy with Docker/Kubernetes
6. Monitor with logging/metrics systems