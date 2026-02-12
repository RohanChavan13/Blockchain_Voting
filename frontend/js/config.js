// Configuration file for the blockchain voting system

const CONFIG = {
    // Contract configuration
    CONTRACT_ADDRESS: "0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC", // Deployed on Sepolia
    
    // Network configuration
    NETWORK: {
        NAME: "Sepolia",
        CHAIN_ID: 11155111,
        RPC_URL: "https://1rpc.io/sepolia", // Using 1RPC Sepolia endpoint
        EXPLORER_URL: "https://sepolia.etherscan.io"
    },
    
    // Contract ABI (Application Binary Interface)
    CONTRACT_ABI: [
        "function merkleRoot() view returns (bytes32)",
        "function admin() view returns (address)",
        "function candidateCount() view returns (uint256)",
        "function votes(uint256) view returns (uint256)",
        "function nullifierUsed(bytes32) view returns (bool)",
        "function updateRoot(bytes32 _newRoot)",
        "function vote(uint256 candidateId, bytes32 nullifierHash, bytes32 leaf, bytes32[] proof)",
        "function getVotes(uint256 candidateId) view returns (uint256)",
        "event RootUpdated(bytes32 newRoot, uint256 timestamp)",
        "event VoteCast(bytes32 nullifierHash, uint256 candidateId, address voter)"
    ],
    
    // Candidate data (EVM style - 3 candidates)
    CANDIDATES: [
        {
            id: 1,
            name: "Candidate-1",
            party: "Progressive Party",
            symbol: "α",
            description: "Focused on education and healthcare reform"
        },
        {
            id: 2,
            name: "Candidate-2",
            party: "Unity Alliance",
            symbol: "β",
            description: "Building bridges and fostering community"
        },
        {
            id: 3,
            name: "Candidate-3",
            party: "Green Future",
            symbol: "γ",
            description: "Environmental sustainability and clean energy"
        }
    ],
    
    // UI configuration
    UI: {
        AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
        TRANSACTION_TIMEOUT: 300000, // 5 minutes
        SESSION_TIMEOUT: 1800000 // 30 minutes
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
