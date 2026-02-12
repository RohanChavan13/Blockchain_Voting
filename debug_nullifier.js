// Debug script to check nullifier usage
const { ethers } = require('ethers');

const CONFIG = {
    CONTRACT_ADDRESS: "0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC",
    RPC_URL: "https://1rpc.io/sepolia",
    CONTRACT_ABI: [
        "function nullifierUsed(bytes32) view returns (bool)"
    ]
};

async function debugNullifier() {
    try {
        const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONFIG.CONTRACT_ABI, provider);
        
        console.log('🔍 Checking Nullifier Usage:');
        
        // Test some common nullifier patterns
        const testNullifiers = [
            "0x" + "0".repeat(64), // Zero hash
            ethers.keccak256(ethers.toUtf8Bytes("test")),
            ethers.keccak256(ethers.toUtf8Bytes("voter1")),
            ethers.keccak256(ethers.toUtf8Bytes("voter2"))
        ];
        
        for (const nullifier of testNullifiers) {
            const isUsed = await contract.nullifierUsed(nullifier);
            console.log(`Nullifier ${nullifier.substring(0, 10)}... used:`, isUsed);
        }
        
        // Generate a fresh nullifier like our code does
        const voterHash = "0x1234567890abcdef1234567890abcdef12345678";
        const timestamp = Date.now();
        const freshNullifier = ethers.keccak256(ethers.toUtf8Bytes(voterHash + timestamp));
        console.log('Fresh nullifier:', freshNullifier);
        
        const isFreshUsed = await contract.nullifierUsed(freshNullifier);
        console.log('Fresh nullifier used:', isFreshUsed);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

debugNullifier();