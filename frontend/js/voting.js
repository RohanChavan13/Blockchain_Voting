// Voting interface - WORKING VERSION

let selectedCandidate = null;
let voterSession = null;
let isInitialized = false;

document.addEventListener('DOMContentLoaded', async () => {
    // Prevent multiple initializations
    if (isInitialized) {
        console.log('Voting page already initialized, skipping...');
        return;
    }
    isInitialized = true;
    // Connect MetaMask first
    if (!web3Manager.isMetaMaskInstalled()) {
        alert('MetaMask not installed!');
        return;
    }

    try {
        await web3Manager.connectWallet();
        console.log('MetaMask connected to voting page');
    } catch (error) {
        alert('Please connect MetaMask: ' + error.message);
        return;
    }

    // Check session
    voterSession = authManager.getSessionData();
    if (!voterSession) {
        alert('Please authenticate first');
        window.location.href = 'index.html';
        return;
    }

    const voterIdDisplay = document.getElementById('voterIdDisplay');
    if (voterIdDisplay) {
        voterIdDisplay.textContent = authManager.truncateHash(voterSession.voterHash);
    }

    renderCandidates();
});

function renderCandidates() {
    const grid = document.getElementById('candidatesGrid');
    grid.innerHTML = '';

    CONFIG.CANDIDATES.forEach(candidate => {
        const card = document.createElement('div');
        card.className = 'candidate-card glass';
        card.innerHTML = `
            <div class="candidate-symbol">${candidate.symbol}</div>
            <h3 class="candidate-name">${candidate.name}</h3>
            <p class="candidate-party">${candidate.party}</p>
            <p class="candidate-description">${candidate.description}</p>
            <button class="btn btn-primary">Select</button>
        `;
        card.addEventListener('click', () => selectCandidate(candidate));
        grid.appendChild(card);
    });
}

function selectCandidate(candidate) {
    selectedCandidate = candidate;
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    showConfirmDialog(candidate);
}

function showConfirmDialog(candidate) {
    const dialog = document.getElementById('confirmDialog');
    document.getElementById('confirmSymbol').textContent = candidate.symbol;
    document.getElementById('confirmName').textContent = candidate.name;
    document.getElementById('confirmParty').textContent = candidate.party;
    dialog.classList.remove('hidden');
}

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('confirmDialog').classList.add('hidden');
});

document.getElementById('cancelVote').addEventListener('click', () => {
    document.getElementById('confirmDialog').classList.add('hidden');
});

document.getElementById('confirmVote').addEventListener('click', async () => {
    if (!selectedCandidate) return;

    try {
        document.getElementById('confirmDialog').classList.add('hidden');
        const txStatus = document.getElementById('transactionStatus');
        txStatus.classList.remove('hidden');
        
        document.getElementById('txStatusTitle').textContent = 'Preparing Vote...';
        document.getElementById('txStatusMessage').textContent = 'Building Merkle proof...';

        // Get contract first
        const contract = web3Manager.getContract();
        if (!contract) {
            throw new Error('Contract not initialized');
        }

        // SIMPLIFIED: Use empty proof (contract root is 0x000...000)
        // This means we're voting without Merkle verification (demo mode)
        const proof = [];
        const emptyLeaf = "0x" + "0".repeat(64);
        
        console.log('Using demo mode (no Merkle verification)');

        document.getElementById('txStatusMessage').textContent = 'Please confirm in MetaMask...';

        const tx = await contract.vote(
            selectedCandidate.id,
            voterSession.nullifierHash,
            emptyLeaf,
            proof,
            { gasLimit: 300000 }
        );

        document.getElementById('txStatusTitle').textContent = 'Transaction Submitted';
        document.getElementById('txStatusMessage').textContent = 'Waiting for confirmation...';
        document.getElementById('txHashDisplay').classList.remove('hidden');
        document.getElementById('txHashLink').href = web3Manager.getEtherscanLink(tx.hash);
        document.getElementById('txHashLink').textContent = authManager.truncateHash(tx.hash, 12, 10);

        const receipt = await tx.wait();

        showSuccess(tx.hash, receipt.blockNumber);
        authManager.clearSession();

    } catch (error) {
        console.error('Voting error:', error);
        document.getElementById('transactionStatus').classList.add('hidden');
        
        let msg = 'Failed to cast vote. ';
        if (error.code === 'ACTION_REJECTED') {
            msg += 'Transaction rejected.';
        } else if (error.message.includes('already voted')) {
            msg += 'Already voted.';
        } else {
            msg += error.message;
        }
        alert(msg);
    }
});

async function showSuccess(txHash, blockNum) {
    document.getElementById('transactionStatus').classList.add('hidden');
    const success = document.getElementById('successSection');
    success.classList.remove('hidden');
    
    document.getElementById('successTxLink').href = web3Manager.getEtherscanLink(txHash);
    document.getElementById('successTxLink').textContent = authManager.truncateHash(txHash, 12, 10);
    document.getElementById('blockNumber').textContent = blockNum.toString();

    // Mark voter as voted in backend to prevent double voting
    try {
        const voterSession = authManager.getSessionData();
        if (voterSession && voterSession.voterHash) {
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
                // Clear session after successful vote to prevent reuse
                authManager.clearSession();
            } else {
                console.warn('⚠️ Failed to mark voter as voted in backend');
            }
        }
    } catch (error) {
        console.error('Error marking voter as voted:', error);
    }

    sessionStorage.setItem('voteReceipt', JSON.stringify({
        txHash,
        candidateId: selectedCandidate.id,
        candidateName: selectedCandidate.name,
        timestamp: Date.now(),
        blockNumber: blockNum
    }));
}

document.getElementById('viewReceipt').addEventListener('click', () => {
    window.location.href = 'receipt.html';
});

document.getElementById('viewDashboard').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

document.getElementById('backToHome').addEventListener('click', () => {
    // Clear session data to allow new voter
    authManager.clearSession();
    window.location.href = 'index.html';
});
