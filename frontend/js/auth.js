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
        // No need to make additional API calls here
    }

    // Handle processed voter data from backend
    handleVoterProcessed(data) {
        console.log('✅ Voter processed by Arduino backend:', data);
        
        if (data.isEligible) {
            // Store the processed voter data
            const voterSession = {
                voterHash: data.voterHash,
                nullifierHash: data.nullifierHash,
                leaf: data.voterHash, // Use voterHash as leaf for simplicity
                timestamp: Date.now(),
                source: 'arduino_backend'
            };
            
            this.storeSessionData(voterSession.voterHash, voterSession.nullifierHash, voterSession.leaf);
            
            // Update UI if on auth page
            const voterInfo = document.getElementById('voterInfo');
            const voterHashDisplay = document.getElementById('voterHashDisplay');
            const statusSection = document.getElementById('statusSection');
            const scanButton = document.getElementById('scanButton');
            
            if (voterInfo && voterHashDisplay) {
                statusSection?.classList.add('hidden');
                voterInfo.classList.remove('hidden');
                voterHashDisplay.textContent = this.truncateHash(data.voterHash);
                voterHashDisplay.title = data.voterHash;
                
                // Re-enable the scan button and hide cancel option
                if (scanButton) {
                    scanButton.disabled = false;
                }
                this.hideCancelOption();
            }
            
            this.showNotification('✅ Arduino voter authenticated! Ready to vote!', 'success');
            const isIndex = document.getElementById('scanButton');
            if (isIndex) {
                setTimeout(() => { window.location.href = 'evm.html?demo=false'; }, 700);
            }
        } else {
            this.showError('Voter not eligible or already voted');
            
            // Re-enable scan button on error
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
    generateMockVoterData() {
        const randomBytes = new Uint8Array(16);
        crypto.getRandomValues(randomBytes);
        return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    createVoterHash(mockVoterId) {
        const timestamp = Date.now().toString();
        const salt = this.generateSalt();
        const data = `${mockVoterId}|${timestamp}|${salt}`;
        return ethers.keccak256(ethers.toUtf8Bytes(data));
    }

    generateSalt() {
        const saltBytes = new Uint8Array(16);
        crypto.getRandomValues(saltBytes);
        return Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    createNullifierHash(voterHash) {
        return ethers.keccak256(ethers.toUtf8Bytes(`${voterHash}|nullifier`));
    }

    createLeaf(voterHash) {
        return ethers.keccak256(ethers.toUtf8Bytes(voterHash));
    }

    storeSessionData(voterHash, nullifierHash, leaf) {
        sessionStorage.setItem('voterSession', JSON.stringify({
            voterHash, nullifierHash, leaf, timestamp: Date.now()
        }));
    }

    getSessionData() {
        const data = sessionStorage.getItem('voterSession');
        if (!data) return null;
        const session = JSON.parse(data);
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

    document.addEventListener('DOMContentLoaded', async () => {
        if (!web3Manager.isMetaMaskInstalled()) {
            alert('MetaMask not installed!');
            return;
        }
        
        try {
            await web3Manager.connectWallet();
            console.log('MetaMask connected');
        } catch (error) {
            console.error('MetaMask error:', error);
        }
    });

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
                
                // Show cancel option
                authManager.showCancelOption();
                
                // Wait indefinitely for Arduino input (WebSocket will handle the response)
                // No timeout - only proceed when Arduino sends data
                console.log('⏳ Waiting for Arduino input... No timeout set.');
                
            } else {
                // Only use fallback if Arduino is not connected at all
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

    // Add cancel button functionality for waiting state
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'btn btn-secondary';
    cancelButton.style.marginLeft = '10px';
    cancelButton.addEventListener('click', () => {
        statusSection.classList.add('hidden');
        scanButton.disabled = false;
        authManager.showNotification('Arduino input cancelled', 'info');
    });
    
    // Add cancel button next to scan button when waiting
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
        // Force blockchain mode (disable demo) so MetaMask opens
        window.location.href = 'evm.html?demo=false';
    });

    retryButton.addEventListener('click', () => {
        errorSection.classList.add('hidden');
        // Reset UI to waiting state
        statusSection.classList.add('hidden');
        scanButton.disabled = false;
    });
}
