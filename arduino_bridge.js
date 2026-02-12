// Arduino Serial Bridge - Node.js version
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const https = require('https');
const http = require('http');

// Configuration
const BACKEND_URL = 'http://localhost:3001/api/arduino/number';
const BAUD_RATE = 9600;

// Find Arduino port
async function findArduinoPort() {
    try {
        const ports = await SerialPort.list();
        console.log('🔍 Available ports:');
        ports.forEach(port => {
            console.log(`  - ${port.path}: ${port.manufacturer || 'Unknown'}`);
        });
        
        // Try to find Arduino - prioritize COM14 per user
        let arduinoPort = ports.find(port => port.path === 'COM14');
        
        if (!arduinoPort) {
            // Fallback to other detection methods
            arduinoPort = ports.find(port => 
                port.manufacturer && (
                    port.manufacturer.includes('Arduino') ||
                    port.manufacturer.includes('FTDI') ||
                    port.manufacturer.includes('CH340')
                )
            );
        }
        
        if (arduinoPort) {
            console.log(`✅ Found Arduino on: ${arduinoPort.path}`);
            return arduinoPort.path;
        } else {
            console.log('❌ Arduino not found automatically');
            console.log('💡 Trying COM14 (user specified)...');
            return 'COM14'; // Use COM14 as specified by user
        }
    } catch (error) {
        console.error('Error listing ports:', error.message);
        return 'COM3'; // Default fallback
    }
}

// Send to backend using native http
function sendToBackend(number) {
    return new Promise((resolve) => {
        const data = JSON.stringify({ number: number.toString() });
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/arduino/number',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ Sent to backend: ${number}`);
                    resolve(true);
                } else {
                    console.log(`❌ Backend error: ${res.statusCode}`);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Failed to send to backend: ${error.message}`);
            resolve(false);
        });
        
        req.write(data);
        req.end();
    });
}

// Main function
async function main() {
    console.log('🔌 Arduino Serial Bridge Starting...');
    console.log(`🎯 Backend URL: ${BACKEND_URL}`);
    
    // Find Arduino port
    const portPath = await findArduinoPort();
    
    try {
        // Connect to Arduino
        const port = new SerialPort({
            path: portPath,
            baudRate: BAUD_RATE
        });
        
        const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
        
        port.on('open', () => {
            console.log(`📡 Connected to Arduino on ${portPath}`);
            console.log('📱 Send numbers from your Bluetooth app!');
        });
        
        parser.on('data', (data) => {
            const line = data.toString().trim();
            console.log(`📡 Arduino: ${line}`);
            
            // Extract numbers from the line
            const numbers = line.match(/\d+/g);
            
            if (numbers && numbers.length > 0) {
                const number = numbers[0]; // Take first number found
                console.log(`📱 Detected number: ${number}`);
                sendToBackend(number);
            }
        });
        
        port.on('error', (error) => {
            console.error(`❌ Serial port error: ${error.message}`);
            console.log('\n💡 Troubleshooting:');
            console.log('1. Check if Arduino is connected via USB');
            console.log('2. Close Arduino IDE Serial Monitor if open');
            console.log('3. Try different COM port (COM3, COM4, COM5)');
            console.log('4. Check Device Manager > Ports (COM & LPT)');
        });
        
    } catch (error) {
        console.error(`❌ Failed to connect: ${error.message}`);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Install: npm install serialport');
        console.log('2. Check Arduino connection');
        console.log('3. Close other programs using the port');
    }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping Arduino bridge...');
    process.exit(0);
});

// Start the bridge
main().catch(console.error);