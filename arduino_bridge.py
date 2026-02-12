#!/usr/bin/env python3
"""
Arduino Serial Bridge - Reads from Arduino and sends to backend
"""

import serial
import requests
import time
import json
import sys

# Configuration
BACKEND_URL = "http://localhost:3001/api/arduino/number"
BACKEND_RAW_URL = "http://localhost:3001/api/arduino/data"
ARDUINO_PORT = "COM14"  # Default to your Arduino port (COM14)
BAUD_RATE = 9600

def find_arduino_port():
    """Try to find Arduino on common ports"""
    # Force strict port usage
    try:
        ser = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=1)
        print(f"✅ Found Arduino on {ARDUINO_PORT}")
        return ser
    except Exception as e:
        print(f"❌ Could not open {ARDUINO_PORT}: {e}")
        print("➡️  Please verify in Device Manager that the Arduino is on COM14 and close any Serial Monitor.")
        return None

def send_to_backend(number):
    """Send number to backend API"""
    try:
        data = {"number": str(number)}
        response = requests.post(BACKEND_URL, json=data, timeout=5)
        if response.status_code == 200:
            print(f"✅ Sent to backend: {number}")
            return True
        else:
            print(f"❌ Backend error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to send to backend: {e}")
        return False

def send_raw_to_backend(raw_line):
    """Send raw data line to backend (used for NO_MATCH and diagnostics)"""
    try:
        data = {"data": str(raw_line)}
        response = requests.post(BACKEND_RAW_URL, json=data, timeout=5)
        if response.status_code == 200:
            print(f"✅ Sent raw to backend: {raw_line}")
            return True
        else:
            print(f"❌ Backend raw error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to send raw to backend: {e}")
        return False

def main():
    print("🔌 Arduino Serial Bridge Starting...")
    print(f"🎯 Backend URL: {BACKEND_URL}")
    
    # Find Arduino
    arduino = find_arduino_port()
    if not arduino:
        print("\n💡 To find your Arduino port:")
        print("1. Open Device Manager")
        print("2. Look under 'Ports (COM & LPT)'")
        print("3. Find 'Arduino Uno (COMx)' or similar")
        print("4. Update ARDUINO_PORT in this script")
        return
    
    print(f"📡 Listening for fingerprint data on {arduino.port}...")
    print("👉 Place finger on sensor. Expect lines like 'VOTER: <id>' or any numeric template ID.")

    # Clear any stale bytes to avoid partial/garbled frames
    try:
        arduino.reset_input_buffer()
    except Exception:
        pass

    try:
        while True:
            if arduino.in_waiting > 0:
                # Read a line as bytes and decode robustly
                raw = arduino.readline()
                if not raw:
                    continue
                line = raw.decode('utf-8', errors='ignore').strip()

                if line:
                    print(f"📡 Arduino: {line}")

                    # If Arduino reports NO_MATCH, notify backend to show error immediately
                    if 'NO_MATCH' in line.upper():
                        send_raw_to_backend(line)
                        continue

                    # Extract numbers (fingerprint template ID) from the line
                    import re
                    numbers = re.findall(r'\d+', line)

                    for number in numbers:
                        if len(number) > 0:  # Any number length
                            print(f"📱 Detected number: {number}")
                            send_to_backend(number)
                            break  # Process only first number found
            
            time.sleep(0.1)  # Small delay
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping Arduino bridge...")
    except Exception as e:
        # Log and keep running instead of crashing on transient errors
        print(f"❌ Error: {e}")
    finally:
        if arduino:
            arduino.close()
        print("👋 Arduino bridge stopped")

if __name__ == "__main__":
    main()