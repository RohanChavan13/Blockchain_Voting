const API_URL = 'http://localhost:3001/api';
let ws = null;
let linkingMode = false;
let selectedUserIdForLinking = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket();
    fetchUsers();

    // Create User Handler
    document.getElementById('createUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('newUserId').value;
        const name = document.getElementById('newUserName').value;
        const email = document.getElementById('newUserEmail').value;

        try {
            await apiPost('/users/create', { userId, name, email });
            alert('User Created!');
            fetchUsers(); // Refresh dropdown
            e.target.reset();
        } catch (err) {
            alert('Error creating user: ' + err.message);
        }
    });

    // Create Club Handler
    document.getElementById('createClubForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const clubId = document.getElementById('newClubId').value;
        const name = document.getElementById('newClubName').value;

        try {
            await apiPost('/clubs/create', { clubId, name });
            alert('Club Created!');
            e.target.reset();
        } catch (err) {
            alert('Error creating club: ' + err.message);
        }
    });

    // Join Club Handler
    document.getElementById('joinClubForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('joinUserId').value;
        const clubId = document.getElementById('joinClubId').value;

        try {
            await apiPost('/clubs/join', { userId, clubId });
            alert('Membership Added!');
            e.target.reset();
        } catch (err) {
            alert('Error adding membership: ' + err.message);
        }
    });

    // Start Election Handler
    document.getElementById('startElectionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const clubId = document.getElementById('electionClubId').value;
        const name = document.getElementById('electionName').value;
        const electionId = document.getElementById('electionId').value;

        try {
            await apiPost('/elections/start', { electionId, clubId, name });
            alert('Election Started!');
            e.target.reset();
        } catch (err) {
            alert('Error starting election: ' + err.message);
        }
    });

    // Link Fingerprint Logic
    document.getElementById('startScanBtn').addEventListener('click', () => {
        const userId = document.getElementById('linkUserSelect').value;
        if (!userId) {
            alert('Please select a user first!');
            return;
        }

        linkingMode = true;
        selectedUserIdForLinking = userId;
        updateStatus('scanning', 'Waiting for Fingerprint Scan from Sensor... Place finger now.');
    });
});

async function apiPost(endpoint, data) {
    const response = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || result.message);
    return result;
}

// Fetch Users for Dropdown
async function fetchUsers() {
    try {
        const response = await fetch(API_URL + '/users');
        const users = await response.json();
        const select = document.getElementById('linkUserSelect');
        select.innerHTML = '<option value="">Select a User</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.userId;
            option.textContent = `${user.name} (${user.userId})`;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Failed to fetch users', err);
    }
}

// WebSocket Connection
function connectWebSocket() {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('Connected to WebSocket');
        document.getElementById('connectionStatus').textContent = 'Connected';
        document.getElementById('connectionStatus').classList.remove('disconnected');
        document.getElementById('connectionStatus').classList.add('connected');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WS Message:', data);

        if (data.type === 'voter_id_received') {
            handleScan(data.voterIdInput);
        }
    };

    ws.onclose = () => {
        console.log('Disconnected from WebSocket');
        document.getElementById('connectionStatus').textContent = 'Disconnected';
        document.getElementById('connectionStatus').classList.add('disconnected');
        setTimeout(connectWebSocket, 3000);
    };
}

// Handle Incoming Fingerprint Scan
async function handleScan(fingerprintId) {
    if (!linkingMode) {
        console.log('Ignored scan (not in linking mode):', fingerprintId);
        return;
    }

    try {
        updateStatus('processing', `Scan Received: ${fingerprintId}. Linking...`);

        await apiPost('/users/link-fingerprint', {
            userId: selectedUserIdForLinking,
            fingerprintId: fingerprintId
        });

        updateStatus('success', `Success! Fingerprint ${fingerprintId} linked to User ${selectedUserIdForLinking}`);
        linkingMode = false;
        selectedUserIdForLinking = null;
    } catch (err) {
        updateStatus('error', 'Error linking: ' + err.message);
        linkingMode = false;
    }
}

function updateStatus(type, message) {
    const statusBox = document.getElementById('scanStatus');
    statusBox.textContent = message;
    statusBox.className = 'status-box'; // reset
    if (type === 'scanning') statusBox.classList.add('scanning');
}
