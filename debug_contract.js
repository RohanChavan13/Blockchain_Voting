// Debug script to check contract state
const { ethers } = require('ethers');

const CONFIG = {
    CONTRACT_ADDRESS: "0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC",
    RPC_URL: "https://1rpc.io/sepolia",
    CONTRACT_ABI: [
        "function merkleRoot() view returns (bytes32)",
        "function admin() view returns (address)",
        "function candidateCount() view returns (uint256)",
        "function votes(uint256) view returns (uint256)",
        "function nullifierUsed(bytes32) view returns (bool)"
    ]
};

async function debugContract() {
    try {
        const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONFIG.CONTRACT_ABI, provider);
        
        console.log('🔍 Contract Debug Information:');
        console.log('Contract Address:', CONFIG.CONTRACT_ADDRESS);
        
        const merkleRoot = await contract.merkleRoot();
        console.log('Current Merkle Root:', merkleRoot);
        
        const admin = await contract.admin();
        console.log('Admin Address:', admin);
        
        const candidateCount = await contract.candidateCount();
        console.log('Candidate Count:', candidateCount.toString());
        
        // Check votes for each candidate
        for (let i = 1; i <= candidateCount; i++) {
            const voteCount = await contract.votes(i);
            console.log(`Candidate ${i} votes:`, voteCount.toString());
        }
        
        // Check if merkle root is zero (empty tree)
        const zeroHash = "0x" + "0".repeat(64);
        console.log('Is Merkle Root Zero?', merkleRoot === zeroHash);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

debugContract();