// Test Arduino USB connection and C++ trie hash fusion

const fs = require('fs');
const path = require('path');

// Test data input simulation
function testArduinoInput() {
    console.log('🧪 Testing Arduino USB input simulation...\n');
    
    // Simulate 12-digit voter IDs
    const testVoterIDs = [
        '123456789012',
        '987654321098',
        '555666777888',
        '111222333444',
        '999888777666'
    ];
    
    console.log('📱 Test Voter IDs:');
    testVoterIDs.forEach((id, index) => {
        console.log(`${index + 1}. ${id}`);
    });
    
    // Write to Arduino data file for testing
    const dataFile = path.join(__dirname, 'arduino_data.txt');
    
    testVoterIDs.forEach((voterID, index) => {
        setTimeout(() => {
            const arduinoMessage = `Received: ${voterID}`;
            fs.appendFileSync(dataFile, arduinoMessage + '\n');
            console.log(`✅ Simulated Arduino input ${index + 1}: ${arduinoMessage}`);
        }, (index + 1) * 2000); // 2 second intervals
    });
    
    console.log('\n🔄 Simulating Arduino inputs every 2 seconds...');
    console.log(`📁 Writing to: ${dataFile}`);
    console.log('🚀 Start the backend server to see the processing!\n');
}

// Test C++ module (if compiled)
function testCppModule() {
    try {
        console.log('🔧 Testing C++ trie hash fusion module...\n');
        
        // This will work after npm run build-cpp
        const trieHashFusion = require('./cpp/trie_hash_fusion');
        
        const testData = {
            voterInput: '123456789012',
            salt: 'test_salt_' + Date.now(),
            timestamp: Date.now()
        };
        
        console.log('📊 Test Data:', testData);
        
        const result = trieHashFusion.processVoterID(
            testData.voterInput,
            testData.salt,
            testData.timestamp
        );
        
        console.log('✅ C++ Processing Result:');
        console.log('- Voter Hash:', result.voterHash.substring(0, 16) + '...');
        console.log('- Nullifier Hash:', result.nullifierHash.substring(0, 16) + '...');
        console.log('- Trie Root:', result.trieRoot.substring(0, 16) + '...');
        console.log('- Merkle Proof Length:', result.merkleProof.length);
        
        const stats = trieHashFusion.getTrieStats();
        console.log('📈 Trie Stats:', stats);
        
    } catch (error) {
        console.log('⚠️ C++ module not compiled yet. Run: npm run build-cpp');
        console.log('Error:', error.message);
    }
}

// Main test function
function runTests() {
    console.log('🧪 Arduino USB + Trie Hash Fusion Test Suite\n');
    console.log('=' .repeat(50));
    
    // Test 1: Arduino input simulation
    testArduinoInput();
    
    // Test 2: C++ module (if available)
    setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        testCppModule();
    }, 1000);
    
    console.log('\n💡 Instructions:');
    console.log('1. Run: cd backend && npm install');
    console.log('2. Run: npm run build-cpp (to compile C++ module)');
    console.log('3. Run: npm start (to start the backend server)');
    console.log('4. Connect your Arduino via USB');
    console.log('5. Send 12-digit numbers from Arduino Bluetooth app');
    console.log('6. Or use the simulation endpoints for testing\n');
}

// Run tests
runTests();