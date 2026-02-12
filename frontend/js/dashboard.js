// Dashboard for live voting results

let barChart = null;
let donutChart = null;
let autoRefreshInterval = null;

// Local helpers (avoid dependency on auth.js)
function truncateHash(hash, start = 10, end = 8) {
    if (!hash || typeof hash !== 'string') return '';
    return hash.length > start + end ? `${hash.slice(0, start)}...${hash.slice(-end)}` : hash;
}

// DOM elements
const totalVotesEl = document.getElementById('totalVotes');
const totalVotersEl = document.getElementById('totalVoters');
const turnoutPercentEl = document.getElementById('turnoutPercent');
const blockchainStatusEl = document.getElementById('blockchainStatus');
const resultsTableBody = document.getElementById('resultsTableBody');
const contractLink = document.getElementById('contractLink');
const currentBlockEl = document.getElementById('currentBlock');
const merkleRootEl = document.getElementById('merkleRoot');
const etherscanLink = document.getElementById('etherscanLink');
const refreshButton = document.getElementById('refreshButton');
const lastUpdateTime = document.getElementById('lastUpdateTime');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Set up contract links
    contractLink.href = web3Manager.getEtherscanAddressLink(CONFIG.CONTRACT_ADDRESS);
    contractLink.textContent = truncateHash(CONFIG.CONTRACT_ADDRESS, 10, 8);
    etherscanLink.href = web3Manager.getEtherscanAddressLink(CONFIG.CONTRACT_ADDRESS);

    // Connect MetaMask first
    try {
        if (web3Manager.isMetaMaskInstalled()) {
            await web3Manager.connectWallet();
        }
    } catch (error) {
        console.log('MetaMask not connected, using read-only mode');
    }

    // Initial load
    await loadDashboardData();

    // Set up auto-refresh
    autoRefreshInterval = setInterval(loadDashboardData, CONFIG.UI.AUTO_REFRESH_INTERVAL);

    // Manual refresh button
    refreshButton.addEventListener('click', loadDashboardData);
});

// Load all dashboard data
async function loadDashboardData() {
    try {
        // Show loading state
        refreshButton.disabled = true;
        refreshButton.textContent = '🔄 Loading...';

        // Get contract
        let contract = null;
        try {
            contract = await web3Manager.getReadOnlyContract();
        } catch (e) {
            console.warn('Read-only contract init failed, continuing in placeholder mode:', e.message);
        }

        // Determine candidate list dynamically from chain (fallback to CONFIG)
        let onChainCount = CONFIG.CANDIDATES.length;
        try {
            if (contract && contract.candidateCount) {
                const cnt = await contract.candidateCount();
                onChainCount = Number(cnt);
            }
        } catch (e) {
            console.warn('candidateCount() failed, using CONFIG.CANDIDATES length');
        }

        const baseCandidates = Array.from({ length: onChainCount }, (_, i) => {
            const idx = i + 1;
            const conf = CONFIG.CANDIDATES.find(c => c.id === idx);
            return conf || { id: idx, name: `Candidate-${idx}`, party: '—', symbol: '' };
        });

        // Fetch vote counts for all candidates
        const voteCounts = await Promise.all(
            baseCandidates.map(async (candidate) => {
                try {
                    const count = contract ? await contract.getVotes(candidate.id) : 0;
                    return { ...candidate, votes: Number(count) };
                } catch (err) {
                    console.warn(`getVotes failed for candidate ${candidate.id}:`, err.message);
                    return { ...candidate, votes: 0 };
                }
            })
        );

        // Calculate total votes
        const totalVotes = voteCounts.reduce((sum, c) => sum + c.votes, 0);

        // Get blockchain info
        let merkleRoot = '--';
        try { merkleRoot = contract ? await contract.merkleRoot() : '--'; } catch { /* ignore */ }
        const networkStatus = await web3Manager.checkNetworkStatus();

        // Update UI
        updateStats(totalVotes, voteCounts.length, networkStatus);
        updateResultsTable(voteCounts, totalVotes);
        updateCharts(voteCounts);
        updateBlockchainInfo(merkleRoot, networkStatus.blockNumber);

        // Update last refresh time
        lastUpdateTime.textContent = new Date().toLocaleTimeString();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        blockchainStatusEl.textContent = '●';
        blockchainStatusEl.style.color = 'var(--error)';
        // Still update timestamp so the UI shows activity
        lastUpdateTime.textContent = new Date().toLocaleTimeString();
    } finally {
        refreshButton.disabled = false;
        refreshButton.textContent = '🔄 Refresh';
    }
}

// Update statistics cards
function updateStats(totalVotes, totalCandidates, networkStatus) {
    totalVotesEl.textContent = totalVotes.toLocaleString();
    
    // For demo, assume 100 registered voters
    const registeredVoters = 100;
    totalVotersEl.textContent = registeredVoters.toLocaleString();
    
    const turnout = totalVotes > 0 ? ((totalVotes / registeredVoters) * 100).toFixed(1) : 0;
    turnoutPercentEl.textContent = `${turnout}%`;
    
    if (networkStatus.connected) {
        blockchainStatusEl.textContent = '●';
        blockchainStatusEl.style.color = 'var(--success)';
    } else {
        blockchainStatusEl.textContent = '●';
        blockchainStatusEl.style.color = 'var(--error)';
    }
}

// Update results table
function updateResultsTable(voteCounts, totalVotes) {
    // Sort by votes (descending)
    const sorted = [...voteCounts].sort((a, b) => b.votes - a.votes);

    resultsTableBody.innerHTML = '';

    sorted.forEach((candidate, index) => {
        const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.5rem;">${candidate.symbol}</span>
                    <span>${candidate.name}</span>
                </div>
            </td>
            <td>${candidate.party}</td>
            <td><strong>${candidate.votes}</strong></td>
            <td>${percentage}%</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </td>
        `;
        resultsTableBody.appendChild(row);
    });
}

// Update charts
function updateCharts(voteCounts) {
    const labels = voteCounts.map(c => c.name);
    const data = voteCounts.map(c => c.votes);
    const colors = [
        '#3B82F6',
        '#8B5CF6',
        '#10B981',
        '#F59E0B',
        '#EF4444'
    ];

    // Bar chart
    const barCtx = document.getElementById('barChart').getContext('2d');
    if (barChart) {
        barChart.destroy();
    }
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Votes',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c + 'CC'),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#94A3B8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#94A3B8'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Donut chart
    const donutCtx = document.getElementById('donutChart').getContext('2d');
    if (donutChart) {
        donutChart.destroy();
    }
    donutChart = new Chart(donutCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#1E293B',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#E2E8F0',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Update blockchain information
function updateBlockchainInfo(merkleRoot, blockNumber) {
    merkleRootEl.textContent = truncateHash(merkleRoot, 12, 10);
    merkleRootEl.title = merkleRoot;
    currentBlockEl.textContent = blockNumber ? blockNumber.toLocaleString() : '--';
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    if (barChart) {
        barChart.destroy();
    }
    if (donutChart) {
        donutChart.destroy();
    }
});
