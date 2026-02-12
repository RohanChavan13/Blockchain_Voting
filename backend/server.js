const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Auth mode: 'aadhaar' or 'fingerprint' (defaulting to fingerprint for this setup)
const AUTH_MODE = ((process.env.AUTH_MODE || 'fingerprint') + '').trim().toLowerCase();
const isFingerprint = AUTH_MODE === 'fingerprint';
// Optional allowlist for fingerprint IDs (comma-separated in env)
// If not provided, auto-generate a contiguous range 1..FINGERPRINT_MAX_ID (default 10)
const FP_MAX = parseInt((process.env.FINGERPRINT_MAX_ID || '10').toString().trim(), 10);
const FP_EXPLICIT = ((process.env.FINGERPRINT_ALLOWLIST || '') + '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const FP_ALLOWLIST = FP_EXPLICIT.length > 0
  ? FP_EXPLICIT
  : Array.from({ length: Math.max(1, isFinite(FP_MAX) ? FP_MAX : 10) }, (_, i) => String(i + 1));
const VALID_FINGERPRINT_IDS_ALLOWLIST = new Set(FP_ALLOWLIST);

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 8080 });

// In-memory storage for voter IDs (in production, use a database)
const voterDatabase = new Map();
const trieStorage = new Map();
const processedData = new Set(); // Track processed Arduino data to prevent duplicates
const votedAadhaarIDs = new Set(); // Track Aadhaar IDs that have already voted
const votedFingerprintIDs = new Set(); // Track Fingerprint IDs that have already voted

// Arduino USB Connection
let arduinoProcess = null;
let isArduinoConnected = false;
let arduinoDataBuffer = '';

// Initialize Arduino USB connection
function initializeArduinoUSB() {
    try {
        console.log('🔌 Initializing Arduino USB connection...');
        
        // Create a simple USB data reader
        startArduinoDataListener();
        
        // Also create a file watcher for Arduino IDE serial output (if available)
        watchArduinoSerialOutput();
        
        isArduinoConnected = true;
        console.log('✅ Arduino USB connection initialized');
        
    } catch (error) {
        console.error('Failed to initialize Arduino USB:', error.message);
    }
}

// Start listening for Arduino data via USB
function startArduinoDataListener() {
    // Create a simple HTTP endpoint for Arduino data input
    // This allows direct data input from Arduino or simulation
    console.log('📡 Arduino data listener started');
}

// Watch for Arduino IDE serial monitor output file (if exists)
function watchArduinoSerialOutput() {
    const possiblePaths = [
        path.join(process.env.USERPROFILE || process.env.HOME, 'Documents', 'Arduino', 'serial_output.txt'),
        path.join(__dirname, 'arduino_data.txt'),
        '/tmp/arduino_serial.txt'
    ];
    
    possiblePaths.forEach(filePath => {
        // Create file if it doesn't exist
        if (!fs.existsSync(filePath)) {
            try {
                fs.writeFileSync(filePath, '');
                console.log(`📁 Created Arduino data file: ${filePath}`);
            } catch (error) {
                // Ignore errors for system paths we can't write to
            }
        }
        
        if (fs.existsSync(filePath)) {
            console.log(`📁 Watching Arduino output file: ${filePath}`);
            
            // Watch for file changes (reasonable interval)
            fs.watchFile(filePath, { interval: 200 }, (curr, prev) => {
                if (curr.mtime > prev.mtime) {
                    readArduinoFile(filePath);
                }
            });
        }
    });
}

// Read Arduino data from file
function readArduinoFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n').filter(line => line.trim());
        
        // Process only new lines that haven't been processed yet
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !processedData.has(trimmedLine)) {
                processedData.add(trimmedLine);
                handleArduinoData(trimmedLine);
            }
        });
    } catch (error) {
        console.error('Error reading Arduino file:', error.message);
    }
}

// Handle incoming Arduino data
function handleArduinoData(data) {
    console.log('📡 Raw Arduino data:', data);
    
    // In fingerprint mode, if Arduino reports NO_MATCH, broadcast explicit error
    if (isFingerprint && typeof data === 'string' && /no[_\s-]?match/i.test(data)) {
        console.log('❌ Fingerprint NO_MATCH received');
        broadcastToClients({
            type: 'error',
            message: 'Fingerprint does not match'
        });
        return;
    }

    // Extract ANY number from Arduino message (flexible detection)
    // Support multiple formats and any length numbers
    const patterns = [
        /Received:\s*(\d+)/,           // "Received: 123456789012"
        /(\d+)/,                      // Just numbers "123456789012"
        /ID:\s*(\d+)/,                // "ID: 123456789012"
        /Voter:\s*(\d+)/,             // "Voter: 123456789012"
        /(\d{1,})/g                   // Any sequence of digits
    ];
    
    let voterIdInput = null;
    for (const pattern of patterns) {
        const match = data.match(pattern);
        if (match) {
            voterIdInput = match[1];
            break;
        }
    }
    
    if (voterIdInput) {
        if (isFingerprint) {
            console.log(`📱 Fingerprint ID received: ${voterIdInput}`);
        } else {
            if (voterIdInput.length < 12) {
                voterIdInput = voterIdInput.padStart(12, '0');
                console.log(`📱 Arduino number received (padded to 12 digits): ${voterIdInput}`);
            } else if (voterIdInput.length > 12) {
                voterIdInput = voterIdInput.substring(0, 12);
                console.log(`📱 Arduino number received (trimmed to 12 digits): ${voterIdInput}`);
            } else {
                console.log(`📱 Arduino number received: ${voterIdInput}`);
            }
        }
        
        // Broadcast received ID first
        broadcastToClients({
            type: 'voter_id_received',
            voterIdInput: voterIdInput,
            timestamp: Date.now(),
            source: isFingerprint ? 'fingerprint' : 'arduino_usb'
        });
        
        // Process voter ID (includes validation)
        processVoterID(voterIdInput);
        
    } else {
        console.log('⚠️ No number found in Arduino data:', data);
    }
}

// Valid Aadhaar IDs (only these are allowed)
const VALID_AADHAAR_IDS = [
    '111112222233',
    '222223333344',
    '333334444455',
    '444445555566',
    '555556666677',
    '111111111111',
    '222222222222',
    '333333333333',
    '444444444444',
    '555555555555',
    '666666666666',
    '777777777777',
    '888888888888',
    '999999999999',
    '000000000000',
    '121212121212',
    '232323232323',
    '343434343434',
    '454545454545',
    '565656565656',
    '676767676767',
    '787878787878',
    '898989898989',
    '909090909090',
    '112211221122',
    '223322332233',
    '334433443344',
    '445544554455',
    '556655665566',
    '667766776677'
];

// Process voter ID using simple hash functions (Arduino integration)
function processVoterID(voterIdInput) {
    try {
        // Check if this voter ID was already processed recently (prevent duplicates)
        const recentProcessKey = `processed_${voterIdInput}`;
        if (processedData.has(recentProcessKey)) {
            if (isFingerprint) {
                console.log('❌ Duplicate fingerprint scan detected:', voterIdInput);
                broadcastToClients({
                    type: 'error',
                    message: 'Duplicate fingerprint scan detected. Please proceed or try a different voter.',
                    voterIdInput: voterIdInput
                });
            } else {
                console.log('⚠️ Voter ID already processed recently:', voterIdInput);
            }
            return;
        }
        
        if (!isFingerprint) {
            const existingVoter = Array.from(voterDatabase.values()).find(voter => 
                voter.aadhaarId === voterIdInput && !voter.hasVoted
            );
            if (existingVoter) {
                console.log('⚠️ Aadhaar ID already has active session:', voterIdInput);
                broadcastToClients({
                    type: 'voter_processed',
                    voterHash: existingVoter.voterHash,
                    nullifierHash: existingVoter.nullifierHash,
                    isEligible: existingVoter.isEligible
                });
                return;
            }
        } else {
            // Fingerprint: if already authenticated and not voted, treat as duplicate attempt
            const existingFp = Array.from(voterDatabase.values()).find(voter => 
                voter.fingerprintId === voterIdInput && !voter.hasVoted
            );
            if (existingFp) {
                console.log('❌ Duplicate fingerprint scan: active session exists for', voterIdInput);
                broadcastToClients({
                    type: 'error',
                    message: 'Duplicate fingerprint scan detected. This fingerprint is already authenticated.',
                    voterIdInput: voterIdInput
                });
                return;
            }
        }
        
        if (!isFingerprint) {
            if (!VALID_AADHAAR_IDS.includes(voterIdInput)) {
                console.log('❌ Invalid Aadhaar ID:', voterIdInput);
                broadcastToClients({
                    type: 'error',
                    message: 'Incorrect Aadhaar ID. Please check your ID and try again.',
                    voterIdInput: voterIdInput
                });
                return;
            }
        }
        
        if (isFingerprint) {
            // Enforce allowlist if provided
            if (VALID_FINGERPRINT_IDS_ALLOWLIST.size > 0 && !VALID_FINGERPRINT_IDS_ALLOWLIST.has(voterIdInput)) {
                console.log('❌ Unauthorized fingerprint detected:', voterIdInput);
                broadcastToClients({
                    type: 'error',
                    message: 'Fingerprint does not match',
                    voterIdInput: voterIdInput
                });
                return;
            }
            if (votedFingerprintIDs.has(voterIdInput)) {
                console.log('❌ Vote already casted for Fingerprint ID:', voterIdInput);
                broadcastToClients({
                    type: 'error',
                    message: 'Vote already casted for this Fingerprint ID.',
                    voterIdInput: voterIdInput
                });
                return;
            }
        } else {
            if (votedAadhaarIDs.has(voterIdInput)) {
                console.log('❌ Vote already casted for Aadhaar ID:', voterIdInput);
                broadcastToClients({
                    type: 'error',
                    message: 'Vote already casted for this Aadhaar ID.',
                    voterIdInput: voterIdInput
                });
                return;
            }
        }
        
        if (isFingerprint) {
            console.log('✅ Fingerprint ID accepted:', voterIdInput);
        } else {
            console.log('✅ Valid Aadhaar ID accepted:', voterIdInput);
        }
        
        // Mark as processed for next 30 seconds
        processedData.add(recentProcessKey);
        setTimeout(() => {
            processedData.delete(recentProcessKey);
        }, 30000);

        // Generate voter data
        const voterData = {
            input: voterIdInput,
            timestamp: Date.now(),
            salt: crypto.randomBytes(16).toString('hex')
        };

        // Simple hash generation (compatible with frontend)
        const combinedData = `${voterIdInput}|${voterData.timestamp}|${voterData.salt}`;
        const voterHash = '0x' + crypto.createHash('sha256').update(combinedData).digest('hex');
        const nullifierHash = '0x' + crypto.createHash('sha256').update(voterHash + '|nullifier').digest('hex');

        const voterRecord = {
            ...voterData,
            voterHash: voterHash,
            nullifierHash: nullifierHash,
            aadhaarId: isFingerprint ? undefined : voterIdInput,
            fingerprintId: isFingerprint ? voterIdInput : undefined,
            isEligible: true,
            hasVoted: false,
            createdAt: new Date().toISOString()
        };

        // Store in database
        voterDatabase.set(voterRecord.voterHash, voterRecord);
        
        // Mark this Aadhaar ID as having been processed (but not yet voted)
        // Will be marked as voted when actual vote is cast on blockchain

        console.log('✅ Arduino Voter ID processed:', {
            input: voterIdInput,
            hash: voterRecord.voterHash.substring(0, 16) + '...',
            eligible: voterRecord.isEligible
        });

        // Broadcast processed data
        broadcastToClients({
            type: 'voter_processed',
            voterHash: voterRecord.voterHash,
            nullifierHash: voterRecord.nullifierHash,
            isEligible: voterRecord.isEligible
        });

    } catch (error) {
        console.error('Error processing Arduino voter ID:', error);
        broadcastToClients({
            type: 'error',
            message: 'Failed to process Arduino voter ID: ' + error.message
        });
    }
}

// Broadcast to WebSocket clients
function broadcastToClients(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// API Routes

// Get voter by hash
app.get('/api/voter/:hash', (req, res) => {
    const voterHash = req.params.hash;
    const voter = voterDatabase.get(voterHash);
    
    if (!voter) {
        return res.status(404).json({ error: 'Voter not found' });
    }
    
    res.json({
        voterHash: voter.voterHash,
        nullifierHash: voter.nullifierHash,
        isEligible: voter.isEligible,
        hasVoted: voter.hasVoted,
        createdAt: voter.createdAt
    });
});

// Verify voter eligibility
app.post('/api/verify-voter', (req, res) => {
    const { voterHash } = req.body;
    const voter = voterDatabase.get(voterHash);
    
    if (!voter) {
        return res.status(404).json({ 
            error: 'Voter not found',
            isEligible: false 
        });
    }
    
    res.json({
        isEligible: voter.isEligible && !voter.hasVoted,
        voterHash: voter.voterHash,
        nullifierHash: voter.nullifierHash,
        trieRoot: voter.trieRoot,
        merkleProof: voter.merkleProof
    });
});

// Mark voter as voted
app.post('/api/mark-voted', (req, res) => {
    const { voterHash, txHash } = req.body;
    const voter = voterDatabase.get(voterHash);
    
    if (!voter) {
        return res.status(404).json({ error: 'Voter not found' });
    }
    
    voter.hasVoted = true;
    voter.voteTxHash = txHash;
    voter.votedAt = new Date().toISOString();
    
    if (isFingerprint) {
        if (voter.fingerprintId) {
            votedFingerprintIDs.add(voter.fingerprintId);
            console.log('🗳️ Fingerprint ID marked as voted:', voter.fingerprintId);
        }
    } else {
        if (voter.aadhaarId) {
            votedAadhaarIDs.add(voter.aadhaarId);
            console.log('🗳️ Aadhaar ID marked as voted:', voter.aadhaarId);
        }
    }
    
    voterDatabase.set(voterHash, voter);
    
    res.json({ success: true, message: 'Voter marked as voted' });
});

// Get all voters (admin endpoint)
app.get('/api/voters', (req, res) => {
    const voters = Array.from(voterDatabase.values()).map(voter => ({
        voterHash: voter.voterHash.substring(0, 10) + '...',
        aadhaarId: voter.aadhaarId,
        fingerprintId: voter.fingerprintId,
        input: voter.input,
        isEligible: voter.isEligible,
        hasVoted: voter.hasVoted,
        createdAt: voter.createdAt,
        votedAt: voter.votedAt
    }));
    
    res.json(voters);
});

// Get voted Aadhaar IDs (admin endpoint)
app.get('/api/voted-aadhaar', (req, res) => {
    res.json({
        votedAadhaarIDs: Array.from(votedAadhaarIDs),
        count: votedAadhaarIDs.size
    });
});

// Get voted Fingerprint IDs (admin endpoint)
app.get('/api/voted-fingerprint', (req, res) => {
    res.json({
        votedFingerprintIDs: Array.from(votedFingerprintIDs),
        count: votedFingerprintIDs.size
    });
});

// Test endpoint to manually mark Aadhaar as voted (for testing)
app.post('/api/test-mark-voted', (req, res) => {
    const { aadhaarId } = req.body;
    if (aadhaarId) {
        votedAadhaarIDs.add(aadhaarId);
        console.log('🧪 Test: Manually marked Aadhaar as voted:', aadhaarId);
        res.json({ success: true, message: `Aadhaar ${aadhaarId} marked as voted` });
    } else {
        res.status(400).json({ error: 'Aadhaar ID required' });
    }
});

// Test Arduino connection
app.get('/api/arduino/status', (req, res) => {
    res.json({
        connected: isArduinoConnected,
        connectionType: 'USB Direct',
        votersCount: voterDatabase.size,
        lastDataReceived: arduinoDataBuffer ? new Date().toISOString() : null,
        authMode: AUTH_MODE,
        fingerprintMode: isFingerprint,
        fingerprintAllowlistEnabled: VALID_FINGERPRINT_IDS_ALLOWLIST.size > 0,
        fingerprintAllowlistCount: VALID_FINGERPRINT_IDS_ALLOWLIST.size
    });
});

// Direct Arduino data input endpoint (for USB connection)
app.post('/api/arduino/data', (req, res) => {
    const { data } = req.body;
    
    if (!data) {
        return res.status(400).json({ error: 'No data provided' });
    }
    
    console.log('📡 Direct Arduino USB data received:', data);
    arduinoDataBuffer = data;
    handleArduinoData(data);
    
    res.json({ 
        success: true, 
        message: 'Arduino data processed',
        timestamp: new Date().toISOString()
    });
});

// Simple number input endpoint (for any number from Arduino)
app.post('/api/arduino/number', (req, res) => {
    const { number } = req.body;
    
    if (!number) {
        return res.status(400).json({ error: 'No number provided' });
    }
    
    console.log('📱 Arduino number received directly:', number);
    
    // Process as Arduino data
    const arduinoMessage = `Received: ${number}`;
    handleArduinoData(arduinoMessage);
    
    res.json({ 
        success: true, 
        message: 'Arduino number processed',
        processedNumber: number,
        timestamp: new Date().toISOString()
    });
});

// Simulate Arduino input (for testing without hardware)
app.post('/api/simulate-arduino', (req, res) => {
    const { voterIdInput } = req.body;
    // In fingerprint mode allow any numeric string; Aadhaar mode requires 12 digits
    if (!voterIdInput || !(isFingerprint ? /^\d+$/.test(voterIdInput) : /^\d{12}$/.test(voterIdInput))) {
        return res.status(400).json({ 
            error: isFingerprint ? 'Invalid fingerprint ID. Must be numeric.' : 'Invalid voter ID. Must be 12 digits.' 
        });
    }
    
    console.log('🧪 Simulating Arduino input:', voterIdInput);
    handleArduinoData(`Received: ${voterIdInput}`);
    
    res.json({ success: true, message: 'Arduino input simulated' });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('🔌 WebSocket client connected');
    
    ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
    });
    
    // Send current status
    ws.send(JSON.stringify({
        type: 'status',
        arduinoConnected: isArduinoConnected,
        connectionType: 'USB Direct',
        votersCount: voterDatabase.size
    }));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server running on ws://localhost:8080`);
    console.log(`🔐 Auth mode: ${AUTH_MODE} (fingerprintMode=${isFingerprint})`);
    
    // Initialize Arduino USB connection
    initializeArduinoUSB();
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    if (arduinoProcess) {
        arduinoProcess.kill();
    }
    process.exit(0);
});