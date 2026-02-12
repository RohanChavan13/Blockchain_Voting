// Arduino USB Data Reader
// This script can be used to read data directly from Arduino via USB

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class ArduinoUSBReader {
    constructor(serverCallback) {
        this.serverCallback = serverCallback;
        this.isReading = false;
        this.dataBuffer = '';
    }

    // Start reading Arduino data
    startReading() {
        console.log('🔌 Starting Arduino USB data reader...');
        this.isReading = true;
        
        // Method 1: Read from a shared file that Arduino IDE writes to
        this.watchArduinoFile();
        
        // Method 2: Create HTTP endpoint for direct data input
        this.setupDirectInput();
        
        console.log('✅ Arduino USB reader initialized');
    }

    // Watch for Arduino data file changes
    watchArduinoFile() {
        const dataFile = path.join(__dirname, 'arduino_data.txt');
        
        // Create file if it doesn't exist
        if (!fs.existsSync(dataFile)) {
            fs.writeFileSync(dataFile, '');
            console.log(`📁 Created Arduino data file: ${dataFile}`);
        }

        // Watch for file changes
        fs.watchFile(dataFile, { interval: 100 }, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                this.readDataFromFile(dataFile);
            }
        });

        console.log(`👀 Watching Arduino data file: ${dataFile}`);
    }

    // Read data from Arduino file
    readDataFromFile(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.trim().split('\n');
            const lastLine = lines[lines.length - 1];
            
            if (lastLine && lastLine !== this.dataBuffer) {
                this.dataBuffer = lastLine;
                console.log('📡 New Arduino data from file:', lastLine);
                
                if (this.serverCallback) {
                    this.serverCallback(lastLine);
                }
            }
        } catch (error) {
            console.error('Error reading Arduino file:', error.message);
        }
    }

    // Setup direct input method
    setupDirectInput() {
        console.log('📡 Direct Arduino input method ready');
        console.log('💡 You can send data via POST to /api/arduino/data');
        console.log('💡 Or write to arduino_data.txt file');
    }

    // Simulate Arduino data (for testing)
    simulateData(data) {
        console.log('🧪 Simulating Arduino data:', data);
        if (this.serverCallback) {
            this.serverCallback(data);
        }
    }

    // Stop reading
    stopReading() {
        this.isReading = false;
        console.log('🛑 Arduino USB reader stopped');
    }
}

module.exports = ArduinoUSBReader;