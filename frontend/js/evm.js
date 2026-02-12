// EVM Simulator JavaScript
let selectedCandidate = null;
let voterSession = null;

// Local helper to avoid dependency on auth.js in this scope
function truncateHash(hash, start = 12, end = 10) {
    if (!hash || typeof hash !== 'string') return '';
    return hash.length > start + end ? `${hash.slice(0, start)}...${hash.slice(-end)}` : hash;
}

// Candidate data matching the EVM layout (contract has 5 candidates)
const candidates = [
    { id: 1, name: 'Candidate-1', symbol: 'α' },
    { id: 2, name: 'Candidate-2', symbol: 'β' },
    { id: 3, name: 'Candidate-3', symbol: 'γ' },
    { id: 4, name: 'Candidate-4', symbol: 'δ' },
    { id: 5, name: 'Candidate-5', symbol: 'ε' }
];

// Initialize EVM
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🗳️ EVM Simulator Initialized');
    
    // Check if demo mode is enabled
    const urlParams = new URLSearchParams(window.location.search);
    const demoMode = urlParams.get('demo') !== 'false';
    
    if (demoMode) {
        addDemoModeIndicator();
    }
    
    // Check voter session
    voterSession = authManager.getSessionData();
    if (!voterSession) {
        alert('Please authenticate first');
        window.location.href = 'index.html';
        return;
    }
    
    // Connect MetaMask
    if (!web3Manager.isMetaMaskInstalled()) {
        alert('MetaMask not installed!');
        return;
    }
    
    try {
        await web3Manager.connectWallet();
        console.log('✅ MetaMask connected to EVM');
    } catch (error) {
        alert('Please connect MetaMask: ' + error.message);
        return;
    }
    
    // Initialize vote buttons
    initializeVoteButtons();
    
    // Initialize modals
    initializeModals();
});

// Initialize vote buttons (single 1s beep on click)
function initializeVoteButtons() {
    const voteButtons = document.querySelectorAll('.vote-button:not(.disabled)');
    
    voteButtons.forEach((button) => {
        // Click selects candidate and plays a single loud 1s beep
        button.addEventListener('click', () => {
            playBeepSound();
            const candidateId = parseInt(button.dataset.candidate);
            selectCandidate(candidateId);
        });
    });
}

// Select candidate and play beep sound
function selectCandidate(candidateId) {
    // Beep is handled by press-and-hold; click alone won't replay to avoid double sound
    
    // Find candidate
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;
    
    selectedCandidate = candidate;
    
    // Update visual feedback
    updateButtonSelection(candidateId);
    
    // Show confirmation modal after short delay
    setTimeout(() => {
        showConfirmationModal(candidate);
    }, 300);
}

// Stronger, capped 1s voting beep
let normalBeepCtx = null, normalBeepOsc = null, normalBeepGain = null, normalBeepTimer = null;
function stopNormalBeep() {
    try {
        if (normalBeepTimer) { clearTimeout(normalBeepTimer); normalBeepTimer = null; }
        if (normalBeepGain && normalBeepCtx) {
            const t = normalBeepCtx.currentTime;
            try { normalBeepGain.gain.cancelScheduledValues(t); } catch(_) {}
            try { normalBeepGain.gain.setValueAtTime(normalBeepGain.gain.value || 0.01, t); } catch(_) {}
            try { normalBeepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08); } catch(_) {}
        }
        if (normalBeepOsc) { try { normalBeepOsc.stop(); } catch(_) {} }
        setTimeout(() => { try { if (normalBeepCtx) normalBeepCtx.close(); } catch(_) {} }, 120);
    } finally {
        normalBeepCtx = null; normalBeepOsc = null; normalBeepGain = null;
    }
}

// Play beep sound (single 1s)
function playBeepSound() {
    try {
        // Stop any ongoing beep first
        stopNormalBeep();

        // Create beep sound using Web Audio API
        normalBeepCtx = new (window.AudioContext || window.webkitAudioContext)();
        normalBeepOsc = normalBeepCtx.createOscillator();
        normalBeepGain = normalBeepCtx.createGain();
        
        normalBeepOsc.connect(normalBeepGain);
        normalBeepGain.connect(normalBeepCtx.destination);
        
        // EVM-like tone: square ~1.5kHz, louder
        normalBeepOsc.frequency.setValueAtTime(1500, normalBeepCtx.currentTime);
        normalBeepOsc.type = 'square';
        
        // Loud gain with 1s cap
        normalBeepGain.gain.setValueAtTime(0.95, normalBeepCtx.currentTime);
        normalBeepGain.gain.exponentialRampToValueAtTime(0.01, normalBeepCtx.currentTime + 1.0);
        
        normalBeepOsc.start(normalBeepCtx.currentTime);
        // Safety stop and close at 1s
        normalBeepTimer = setTimeout(() => stopNormalBeep(), 1000);
        
        console.log('🔊 Beep sound played');
    } catch (error) {
        console.log('🔇 Could not play beep sound:', error);
        
        // Fallback: try HTML5 audio
        try {
            const beepSound = document.getElementById('beepSound');
            if (beepSound) {
                beepSound.currentTime = 0;
                // Attempt longer HTML5 audio if available
                beepSound.play();
                // Hard cap to 1 second
                setTimeout(() => { try { beepSound.pause(); beepSound.currentTime = 0; } catch(_) {} }, 1000);
            }
        } catch (fallbackError) {
            console.log('🔇 Fallback beep also failed:', fallbackError);
        }
    }
}

// Remove press-and-hold behavior entirely to prevent unlimited sound
let pressBeepCtx = null, pressBeepOsc = null, pressBeepGain = null, pressBeepTimer = null;
function startPressBeep() { /* disabled */ }
function stopPressBeep() { /* disabled */ }

// Stop any ongoing beeps when tab is hidden or page is unloading
document.addEventListener('visibilitychange', () => { if (document.hidden) stopPressBeep(); }, { passive: true });
window.addEventListener('beforeunload', () => { try { stopPressBeep(); } catch(_) {} });

// Update button selection visual
function updateButtonSelection(candidateId) {
    // Reset all buttons
    document.querySelectorAll('.vote-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Reset all red lights
    document.querySelectorAll('.red-light').forEach(light => {
        light.classList.remove('active');
    });
    
    // Highlight selected button
    const selectedButton = document.querySelector(`[data-candidate="${candidateId}"] .vote-button`);
    const selectedLight = document.querySelector(`[data-candidate="${candidateId}"] .red-light`);
    
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
    
    if (selectedLight) {
        selectedLight.classList.add('active');
    }
}

// Show confirmation modal
function showConfirmationModal(candidate) {
    const modal = document.getElementById('confirmModal');
    const candidateName = document.getElementById('selectedCandidateName');
    const candidateSymbol = document.getElementById('selectedCandidateSymbol');
    
    candidateName.textContent = candidate.name;
    candidateSymbol.textContent = `(${candidate.symbol})`;
    
    modal.classList.remove('hidden');
}

// Initialize modal event listeners
function initializeModals() {
    // Confirm modal buttons
    document.getElementById('cancelVote').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.add('hidden');
        resetSelection();
    });
    
    document.getElementById('confirmVote').addEventListener('click', async () => {
        document.getElementById('confirmModal').classList.add('hidden');
        await castVote();
    });
    
    // Success modal buttons
    document.getElementById('backToHome').addEventListener('click', () => {
        authManager.clearSession();
        window.location.href = 'index.html';
    });
    
    document.getElementById('viewDashboard').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
}

// Reset selection
function resetSelection() {
    selectedCandidate = null;
    document.querySelectorAll('.vote-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelectorAll('.red-light').forEach(light => {
        light.classList.remove('active');
    });
}

// Cast vote on blockchain
async function castVote() {
    console.log('🚀 NEW CASTVOTE FUNCTION LOADED - V4');
    if (!selectedCandidate) return;
    
    // Check if we should use demo mode (for testing without blockchain issues)
    const urlParams = new URLSearchParams(window.location.search);
    const demoMode = urlParams.get('demo') !== 'false'; // Default to demo mode
    
    if (demoMode) {
        console.log('🧪 Demo mode: Simulating vote without blockchain');
        await simulateVote();
        return;
    }
    
    try {
        console.log('🗳️ Casting vote for:', selectedCandidate.name);
        console.log('🔍 Demo mode check:', demoMode);
        
        // Get contract
        const contract = web3Manager.getContract();
        if (!contract) {
            throw new Error('Contract not initialized');
        }
        
        console.log('✅ Contract obtained successfully');
        
        // Test contract connection
        console.log('📝 Preparing vote transaction...');
        console.log('Candidate ID:', selectedCandidate.id);
        
        const contractAddress = await contract.getAddress();
        console.log('Contract address:', contractAddress);
        
        // Get contract merkle root
        const merkleRoot = await contract.merkleRoot();
        console.log('Contract Merkle Root:', merkleRoot);
        
        let nullifierToUse, leafToUse, proof;
        
        if (merkleRoot === "0x" + "0".repeat(64)) {
            // Zero merkle root case - special handling
            // For zero root, the leaf must also be zero and proof must be empty
            leafToUse = "0x" + "0".repeat(64);
            proof = [];
            
            // Generate a unique nullifier for this vote
            const uniqueString = voterSession.voterHash + 
                                selectedCandidate.id + 
                                Date.now() + 
                                Math.random().toString();
            nullifierToUse = ethers.keccak256(ethers.toUtf8Bytes(uniqueString));
            
            console.log('🔍 Zero root detected - using zero leaf and empty proof');
        } else {
            // Non-empty merkle tree - use session data
            nullifierToUse = voterSession.nullifierHash;
            leafToUse = voterSession.leaf || voterSession.voterHash;
            proof = voterSession.proof || [];
            
            console.log('🔍 Non-zero root - using session data');
        }
        
        console.log('📝 Transaction parameters:');
        console.log('Candidate ID:', selectedCandidate.id);
        console.log('Nullifier:', nullifierToUse);
        console.log('Leaf:', leafToUse);
        console.log('Proof:', proof);
        
        // Validate candidate ID first
        const candidateCount = await contract.candidateCount();
        console.log('Contract candidate count:', candidateCount.toString());
        
        if (selectedCandidate.id < 1 || selectedCandidate.id > candidateCount) {
            throw new Error(`Invalid candidate ID: ${selectedCandidate.id}. Must be 1-${candidateCount}`);
        }
        
        // Check nullifier usage
        const isUsed = await contract.nullifierUsed(nullifierToUse);
        console.log('Nullifier already used?', isUsed);
        if (isUsed) {
            throw new Error('Already voted with this ID');
        }
        
        // Verify Merkle proof locally
        let computedHash = leafToUse;
        for (let i = 0; i < proof.length; i++) {
            const proofElement = proof[i];
            if (computedHash <= proofElement) {
                computedHash = ethers.keccak256(ethers.concat([computedHash, proofElement]));
            } else {
                computedHash = ethers.keccak256(ethers.concat([proofElement, computedHash]));
            }
        }
        console.log('Computed hash:', computedHash);
        console.log('Expected root:', merkleRoot);
        
        if (computedHash !== merkleRoot) {
            throw new Error(`Merkle proof verification failed. Computed: ${computedHash}, Expected: ${merkleRoot}`);
        }
        
        // DIRECT TRANSACTION APPROACH - bypassing potential contract call issues
        console.log('🔧 Using direct transaction approach...');
        
        // Get signer directly
        const signer = web3Manager.getSigner();
        console.log('Signer address:', await signer.getAddress());
        
        // Encode function data manually
        const iface = new ethers.Interface([
            "function vote(uint256 candidateId, bytes32 nullifierHash, bytes32 leaf, bytes32[] proof)"
        ]);
        
        const txData = iface.encodeFunctionData('vote', [
            selectedCandidate.id,
            nullifierToUse,
            leafToUse,
            proof
        ]);
        
        console.log('Encoded transaction data:', txData.substring(0, 50) + '...');
        console.log('Data length:', txData.length);
        
        // Estimate gas for the raw transaction
        const gasEstimate = await signer.estimateGas({
            to: contractAddress,
            data: txData
        });
        
        console.log('Gas estimate:', gasEstimate.toString());
        
        // Send raw transaction
        console.log('Sending raw transaction...');
        const tx = await signer.sendTransaction({
            to: contractAddress,
            data: txData,
            gasLimit: gasEstimate + 50000n
        });
        
        console.log('⏳ Transaction submitted:', tx.hash);
        
        const receipt = await tx.wait();
        
        console.log('✅ Vote cast successfully!');
        
        // Mark voter as voted in backend
        await markVoterAsVoted(tx.hash);
        
        // Show success modal
        showSuccessModal(tx.hash, receipt.blockNumber);
        
    } catch (error) {
        console.error('❌ Voting error:', error);
        
        let errorMessage = 'Failed to cast vote. ';
        
        if (error.code === 'ACTION_REJECTED') {
            errorMessage += 'Transaction rejected by user.';
        } else if (error.message.includes('Invalid candidate ID')) {
            errorMessage += 'Invalid candidate selection.';
        } else if (error.message.includes('Already voted')) {
            errorMessage += 'This fingerprint ID has already been used to vote.';
        } else if (error.message.includes('Merkle proof verification failed')) {
            errorMessage += 'Voter verification failed. Please try authenticating again.';
        } else if (error.message.includes('Transaction would revert')) {
            errorMessage += 'Transaction validation failed. ' + error.message;
        } else if (error.code === 'CALL_EXCEPTION') {
            errorMessage += 'Smart contract rejected the vote. This could be due to:\n';
            errorMessage += '• Already voted with this ID\n';
            errorMessage += '• Invalid voter credentials\n';
            errorMessage += '• Network issues\n\n';
            errorMessage += 'Please try again or contact support.';
        } else if (error.message.includes('insufficient funds')) {
            errorMessage += 'Insufficient ETH balance for transaction fees.';
        } else {
            errorMessage += `Technical error: ${error.message}`;
        }
        
        // Show user-friendly error dialog
        showErrorModal(errorMessage);
        resetSelection();
    }
}

// Mark voter as voted in backend
async function markVoterAsVoted(txHash) {
    try {
        const response = await fetch('http://localhost:3001/api/mark-voted', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                voterHash: voterSession.voterHash,
                txHash: txHash
            })
        });
        
        if (response.ok) {
            console.log('✅ Voter marked as voted in backend');
        } else {
            console.warn('⚠️ Failed to mark voter as voted in backend');
        }
    } catch (error) {
        console.error('Error marking voter as voted:', error);
    }
}

// Show error modal
function showErrorModal(message) {
    // Create error modal if it doesn't exist
    let errorModal = document.getElementById('errorModal');
    if (!errorModal) {
        errorModal = document.createElement('div');
        errorModal.id = 'errorModal';
        errorModal.className = 'modal';
        errorModal.innerHTML = `
            <div class="modal-content">
                <div class="error-icon">❌</div>
                <h2>Voting Error</h2>
                <div class="error-details">
                    <p id="errorModalText"></p>
                </div>
                <div class="modal-actions">
                    <button id="closeErrorModal" class="btn btn-primary">Close</button>
                    <button id="retryVote" class="btn btn-secondary">Try Again</button>
                </div>
            </div>
        `;
        document.body.appendChild(errorModal);
        
        // Add event listeners
        document.getElementById('closeErrorModal').addEventListener('click', () => {
            errorModal.classList.add('hidden');
        });
        
        document.getElementById('retryVote').addEventListener('click', () => {
            errorModal.classList.add('hidden');
            resetSelection();
        });
    }
    
    document.getElementById('errorModalText').textContent = message;
    errorModal.classList.remove('hidden');
}

// Show success modal
function showSuccessModal(txHash, blockNumber) {
    const modal = document.getElementById('successModal');
    const txLink = document.getElementById('successTxLink');
    const blockNum = document.getElementById('blockNumber');
    
    txLink.href = web3Manager.getEtherscanLink(txHash);
    txLink.textContent = truncateHash(txHash, 12, 10);
    
    blockNum.textContent = blockNumber.toString();
    
    // Store vote receipt
    sessionStorage.setItem('voteReceipt', JSON.stringify({
        txHash,
        candidateId: selectedCandidate.id,
        candidateName: selectedCandidate.name,
        candidateSymbol: selectedCandidate.symbol,
        timestamp: Date.now(),
        blockNumber: blockNumber
    }));
    
    modal.classList.remove('hidden');
    
    // Clear session after successful vote
    setTimeout(() => {
        authManager.clearSession();
    }, 1000);
}

// Simulate vote for demo mode
async function simulateVote() {
    try {
        console.log('🧪 Demo Mode: Simulating realistic blockchain vote...');
        
        // Show realistic processing steps
        updateVotingStatus('Connecting to blockchain...', 500);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        updateVotingStatus('Validating fingerprint credentials...', 1000);
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        updateVotingStatus('Generating cryptographic proof...', 1500);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        updateVotingStatus('Broadcasting to Sepolia network...', 2000);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        updateVotingStatus('Waiting for block confirmation...', 2500);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate realistic transaction hash
        const fakeHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const fakeBlockNumber = Math.floor(Math.random() * 1000) + 9540300;
        
        console.log('✅ Demo vote successful!');
        console.log('📝 Transaction Hash:', fakeHash);
        console.log('📦 Block Number:', fakeBlockNumber);
        
        // Mark voter as voted in backend
        await markVoterAsVoted(fakeHash);
        
        // Show success modal
        showSuccessModal(fakeHash, fakeBlockNumber);
        
    } catch (error) {
        console.error('❌ Demo vote error:', error);
        showErrorModal('Demo mode error: ' + error.message);
        resetSelection();
    }
}

// Update voting status during demo
function updateVotingStatus(message, delay) {
    // This could update a status display if we had one
    console.log(`🔄 ${message}`);
}

// Add demo mode indicator
function addDemoModeIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'demoModeIndicator';
    indicator.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #1f2937;
            padding: 12px 20px;
            border-radius: 25px;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
            z-index: 1000;
            border: 2px solid #d97706;
            animation: demoPulse 2s infinite;
        ">
            🧪 DEMO MODE
            <button onclick="toggleMode()" style="
                margin-left: 10px;
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 15px;
                padding: 4px 8px;
                font-size: 0.7rem;
                cursor: pointer;
                color: #1f2937;
                font-weight: 600;
            ">
                Switch to Blockchain
            </button>
        </div>
        <style>
            @keyframes demoPulse {
                0%, 100% { transform: scale(1); opacity: 0.9; }
                50% { transform: scale(1.05); opacity: 1; }
            }
        </style>
    `;
    document.body.appendChild(indicator);
    
    console.log('🧪 Demo mode indicator added');
}

// Toggle between demo and blockchain mode
function toggleMode() {
    const currentUrl = new URL(window.location);
    const currentDemo = currentUrl.searchParams.get('demo') !== 'false';
    
    if (currentDemo) {
        // Switch to blockchain mode
        currentUrl.searchParams.set('demo', 'false');
    } else {
        // Switch to demo mode
        currentUrl.searchParams.delete('demo');
    }
    
    window.location.href = currentUrl.toString();
}

// Make toggleMode available globally
window.toggleMode = toggleMode;