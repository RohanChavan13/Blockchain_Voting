// Fingerprint Serial Bridge (R307 via Arduino Uno)
// Reads serial lines (e.g., "VOTER: 7") and forwards the numeric ID to the backend

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios');

// Configuration
const PORT_PATH = 'COM14'; // Your Arduino COM port
const BAUD_RATE = 9600;    // Must match your Arduino sketch
const BACKEND_URL = 'http://localhost:3001/api/arduino/number';

// Open serial port
const port = new SerialPort({ path: PORT_PATH, baudRate: BAUD_RATE });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => {
  console.log(`📡 Serial connected on ${PORT_PATH} @ ${BAUD_RATE}`);
  console.log('↳ Expecting lines like: "VOTER: <id>"');
});

port.on('error', (err) => {
  console.error('❌ Serial port error:', err.message);
  console.log('Tips: Close Arduino IDE Serial Monitor, verify COM14, check Device Manager.');
});

async function sendToBackend(id) {
  try {
    const payload = { number: String(id) };
    const resp = await axios.post(BACKEND_URL, payload, { timeout: 5000 });
    console.log('✅ Sent to backend:', payload, '→', resp.status);
  } catch (err) {
    console.error('❌ Error posting to backend:', err.message);
  }
}

parser.on('data', async (raw) => {
  const line = String(raw).trim();
  if (!line) return;
  console.log('🔎 Serial:', line);

  // Prefer explicit "VOTER: <id>" format
  if (line.toUpperCase().startsWith('VOTER:')) {
    const fpId = line.split(':')[1]?.trim();
    if (fpId) {
      console.log('🆔 Fingerprint ID:', fpId);
      return sendToBackend(fpId);
    }
  }

  // Fallback: pick first number sequence from the line
  const match = line.match(/\d+/);
  if (match) {
    const num = match[0];
    console.log('🆔 Detected numeric ID:', num);
    return sendToBackend(num);
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping fingerprint bridge...');
  try { port.close(); } catch (_) {}
  process.exit(0);
});
