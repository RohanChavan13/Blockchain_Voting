// Authentication module - Arduino Backend Integration

class AuthManager {
    constructor() {
        this.backendUrl = 'http://localhost:3001';
        this.websocket = null;
        this.initWebSocket();
    }

    // Initialize WebSocket connection to Arduino backend
    initWebSocket() {
        try {
            this.websocket = new WebSocket('ws://localhost:8080');

            this.websocket.onopen = () => {
                console.log('🔌 Connected to Arduino backend');
                this.showNotification('Connected to Arduino backend', 'success');
            };

            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleBackendMessage(data);
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.websocket.onclose = () => {
                console.log('🔌 Disconnected from Arduino backend');
                // Attempt to reconnect after 3 seconds
                setTimeout(() => this.initWebSocket(), 3000);
            };
        } catch (error) {
            console.error('Failed to connect to Arduino backend:', error);
        }
    }

    // Handle messages from Arduino backend
    handleBackendMessage(data) {
        console.log('📡 Arduino Backend message:', data);

        switch (data.type) {
            case 'voter_id_received':
                this.handleArduinoVoterID(data.voterIdInput);
                break;
            case 'voter_processed':
                this.handleVoterProcessed(data);
                break;
            case 'status':
                console.log('Backend status:', data);
                break;
            case 'error':
                this.handleArduinoError(data);
                break;
        }
    }

    // Handle Arduino voter ID input
    async handleArduinoVoterID(voterIdInput) {
        console.log('📱 Arduino Voter ID received:', voterIdInput);

        // Show notification to user
        this.showNotification(`Fingerprint ID received: ${voterIdInput} - Processing...`, 'success');

        // Update status text if on auth page
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = `Processing fingerprint ID: ${voterIdInput}...`;
        }

        // The backend will automatically process and send voter_processed event
    }

    // Handle processed voter data from backend
    async handleVoterProcessed(data) {
        console.log('✅ Voter processed by Arduino backend:', data);

        if (data.isEligible) {
            try {
                // Must fetch ephemeral token from API
                const response = await fetch(`${this.backendUrl}/api/verify-voter`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ voterHash: data.voterHash })
                });

                if (!response.ok) {
                    throw new Error('Failed to retrieve voting token');
                }

                const verifData = await response.json();
                console.log('🔑 Ephemeral Token Received:', verifData.ephemeralAccount ? 'YES' : 'NO');

                // Store Session
                this.storeSessionData(
                    verifData.voterHash,
                    verifData.nullifierHash,
                    verifData.voterHash,
                    verifData.ephemeralAccount // The Mnemonic
                );

                // Update UI if on auth page
                const voterInfo = document.getElementById('voterInfo');
                const voterHashDisplay = document.getElementById('voterHashDisplay');
                const statusSection = document.getElementById('statusSection');

                if (voterInfo && voterHashDisplay) {
                    statusSection?.classList.add('hidden');
                    voterInfo.classList.remove('hidden');
                    voterHashDisplay.textContent = this.truncateHash(data.voterHash);

                    this.hideCancelOption();
                }

                this.showNotification('✅ Authenticated & Token Received! Redirecting...', 'success');

                setTimeout(() => { window.location.href = 'voting.html'; }, 1500);

            } catch (error) {
                console.error('Error getting vote token:', error);
                this.showError(error.message);
                const scanButton = document.getElementById('scanButton');
                if (scanButton) scanButton.disabled = false;
            }
        } else {
            this.showError('Voter not eligible or already voted');
            const scanButton = document.getElementById('scanButton');
            if (scanButton) {
                scanButton.disabled = false;
            }
        }
    }

    // Show notification to user
    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);

        // Create notification element if it doesn't exist
        let notification = document.getElementById('arduino-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'arduino-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(notification);
        }

        // Set color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        notification.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }

    // Handle Arduino-specific errors
    handleArduinoError(data) {
        console.log('❌ Arduino Error:', data);

        const statusSection = document.getElementById('statusSection');
        const errorSection = document.getElementById('errorSection');
        const errorText = document.getElementById('errorText');
        const scanButton = document.getElementById('scanButton');
        const statusText = document.getElementById('statusText');

        // Hide status and show error
        if (statusSection) statusSection.classList.add('hidden');
        if (errorSection && errorText) {
            const msg = data && data.message ? data.message : 'Authentication failed';
            errorText.textContent = msg;
            if (data.voterIdInput) {
                errorText.textContent += ` (Received: ${data.voterIdInput})`;
            }
            errorSection.classList.remove('hidden');
        }
        // Reflect error in status text as well (in case error section is off-screen)
        if (statusText) {
            statusText.textContent = `Authentication failed: ${data && data.message ? data.message : 'Fingerprint does not match'}`;
        }

        // Re-enable scan button
        if (scanButton) scanButton.disabled = false;

        // Hide cancel option
        this.hideCancelOption();

        // Show error notification
        this.showNotification(data && data.message ? data.message : 'Fingerprint does not match', 'error');
    }

    // Show error message
    showError(message) {
        this.showNotification(message, 'error');

        const errorSection = document.getElementById('errorSection');
        const errorText = document.getElementById('errorText');

        if (errorSection && errorText) {
            errorText.textContent = message;
            errorSection.classList.remove('hidden');
        }
    }

    // Test Arduino connection
    async testArduinoConnection() {
        try {
            const response = await fetch(`${this.backendUrl}/api/arduino/status`);
            const status = await response.json();
            console.log('Arduino status:', status);
            return status;
        } catch (error) {
            console.error('Failed to check Arduino status:', error);
            return { connected: false, error: error.message };
        }
    }

    // Generate Mock Data (Browser Native - No Ethers.js)
    async generateMockVoterData() {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Hash Helper (SHA-256)
    async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Store Session
    storeSessionData(voterHash, nullifierHash, leaf, ephemeralAccount) {
        sessionStorage.setItem('voterSession', JSON.stringify({
            voterHash,
            nullifierHash,
            leaf,
            ephemeralAccount, // New: Store the Algorand Mnemonic or Key Object
            timestamp: Date.now()
        }));
    }

    getSessionData() {
        const data = sessionStorage.getItem('voterSession');
        if (!data) return null;
        const session = JSON.parse(data);
        // Session valid for 30 mins
        if (Date.now() - session.timestamp > 1800000) {
            this.clearSession();
            return null;
        }
        return session;
    }

    clearSession() {
        sessionStorage.removeItem('voterSession');
    }

    truncateHash(hash, start = 10, end = 8) {
        if (!hash || hash.length < start + end) return hash;
        return `${hash.substring(0, start)}...${hash.substring(hash.length - end)}`;
    }
}

const authManager = new AuthManager();

// Only run on index.html
if (document.getElementById('scanButton')) {
    const scanButton = document.getElementById('scanButton');
    const statusSection = document.getElementById('statusSection');
    const statusText = document.getElementById('statusText');
    const voterInfo = document.getElementById('voterInfo');
    const voterHashDisplay = document.getElementById('voterHashDisplay');
    const proceedButton = document.getElementById('proceedButton');
    const errorSection = document.getElementById('errorSection');
    const errorText = document.getElementById('errorText');
    const retryButton = document.getElementById('retryButton');

    // No MetaMask check needed for Algorand

    scanButton.addEventListener('click', async () => {
        try {
            scanButton.disabled = true;
            statusSection.classList.remove('hidden');
            voterInfo.classList.add('hidden');
            errorSection.classList.add('hidden');
            statusText.textContent = 'Waiting for Arduino input...';

            // Check Arduino backend connection
            const arduinoStatus = await authManager.testArduinoConnection();

            if (arduinoStatus.connected) {
                statusText.textContent = '👉 Place finger on the R307 sensor...';
                authManager.showNotification('Ready for fingerprint input! Waiting for match...', 'info');

                authManager.showCancelOption();
                console.log('⏳ Waiting for Arduino input... No timeout set.');

            } else {
                statusText.textContent = 'Arduino not connected. Please start backend server.';
                authManager.showError('Arduino backend not connected. Please ensure backend is running.');
                scanButton.disabled = false;
            }

        } catch (error) {
            console.error('Error:', error);
            statusSection.classList.add('hidden');
            errorSection.classList.remove('hidden');
            errorText.textContent = error.message || 'Failed to authenticate';
        }
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'btn btn-secondary';
    cancelButton.style.marginLeft = '10px';
    cancelButton.addEventListener('click', () => {
        statusSection.classList.add('hidden');
        scanButton.disabled = false;
        authManager.showNotification('Arduino input cancelled', 'info');
    });

    authManager.showCancelOption = () => {
        if (!document.getElementById('cancelArduinoButton')) {
            cancelButton.id = 'cancelArduinoButton';
            scanButton.parentNode.appendChild(cancelButton);
        }
    };

    authManager.hideCancelOption = () => {
        const existingCancel = document.getElementById('cancelArduinoButton');
        if (existingCancel) {
            existingCancel.remove();
        }
    };

    proceedButton.addEventListener('click', () => {
        window.location.href = 'voting.html'; // Changed from evm.html
    });

    retryButton.addEventListener('click', () => {
        errorSection.classList.add('hidden');
        statusSection.classList.add('hidden');
        scanButton.disabled = false;
    });
}
