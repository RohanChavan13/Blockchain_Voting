// Voting interface - Algorand Integration

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

    // Connect to Algorand Node
    try {
        await algorandManager.init();
        console.log('Algorand Node connected');
    } catch (error) {
        alert('Failed to connect to Algorand Network: ' + error.message);
        return;
    }

    // Check session
    voterSession = authManager.getSessionData();
    if (!voterSession) {
        alert('Please authenticate first');
        window.location.href = 'index.html';
        return;
    }

    // Check for Ephemeral Key
    if (!voterSession.ephemeralAccount || !voterSession.ephemeralAccount.mnemonic) {
        console.warn('⚠️ No ephemeral key found in session.');
        alert('Security Error: No voting token found. Please re-authenticate.');
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
        card.addEventListener('click', (e) => selectCandidate(candidate, e));
        grid.appendChild(card);
    });
}

function selectCandidate(candidate, event) {
    selectedCandidate = candidate;
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }
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

        document.getElementById('txStatusTitle').textContent = 'Submitting Vote...';
        document.getElementById('txStatusMessage').textContent = 'Signing transaction with ephemeral key...';

        // --- ALGOREND VOTE SUBMISSION ---
        const mnemonic = voterSession.ephemeralAccount.mnemonic;

        console.log(`🗳️ Casting vote for Candidate ${selectedCandidate.id} (${selectedCandidate.name})`);

        const result = await algorandManager.submitVote(
            mnemonic,
            selectedCandidate.id,
            voterSession.nullifierHash
        );

        document.getElementById('txStatusTitle').textContent = 'Vote Confirmed!';
        document.getElementById('txStatusMessage').textContent = `Confirmed in Round ${result.round}`;
        document.getElementById('txHashDisplay').classList.remove('hidden');

        const explorerLink = algorandManager.getExplorerLink(result.txId);
        const linkElem = document.getElementById('txHashLink');
        linkElem.href = explorerLink;
        linkElem.textContent = authManager.truncateHash(result.txId, 12, 10);

        // Wait for admin sync before clearing
        await showSuccess(result.txId, result.round, voterSession);

        // Clear sensitive key from memory/storage immediately
        authManager.clearSession();

    } catch (error) {
        console.error('Voting error:', error);
        document.getElementById('transactionStatus').classList.add('hidden');

        let msg = 'Failed to cast vote. ' + error.message;
        alert(msg);
    }
});

async function showSuccess(txHash, blockNum, session) {
    document.getElementById('transactionStatus').classList.add('hidden');
    const success = document.getElementById('successSection');
    success.classList.remove('hidden');

    document.getElementById('successTxLink').href = algorandManager.getExplorerLink(txHash);
    document.getElementById('successTxLink').textContent = authManager.truncateHash(txHash, 12, 10);
    document.getElementById('blockNumber').textContent = blockNum.toString();

    // Mark voter as voted in backend to prevent double voting
    try {
        if (session && session.voterHash) {
            const response = await fetch('http://localhost:3001/api/mark-voted', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    voterHash: session.voterHash,
                    txHash: txHash
                })
            });
            if (response.ok) console.log('✅ Backend marked as voted');
        }
    } catch (error) {
        console.error('Error marking backend:', error);
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
    authManager.clearSession();
    window.location.href = 'index.html';
});
