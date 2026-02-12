// Test script to simulate the exact vote transaction
const { ethers } = require('ethers');

const CONFIG = {
    CONTRACT_ADDRESS: "0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC",
    RPC_URL: "https://1rpc.io/sepolia",
    CONTRACT_ABI: [
        "function vote(uint256 candidateId, bytes32 nullifierHash, bytes32 leaf, bytes32[] proof)",
        "function merkleRoot() view returns (bytes32)",
        "function nullifierUsed(bytes32) view returns (bool)"
    ]
};

async function testVote() {
    try {
        console.log('🧪 Testing Vote Transaction...');
        
        const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONFIG.CONTRACT_ABI, provider);
        
        // Check current state
        const merkleRoot = await contract.merkleRoot();
        console.log('Current Merkle Root:', merkleRoot);
        
        // Prepare transaction parameters (same as frontend)
        const candidateId = 2;
        const voterHash = "0x1234567890abcdef1234567890abcdef12345678";
        const timestamp = Date.now();
        const nullifierHash = ethers.keccak256(ethers.toUtf8Bytes(voterHash + timestamp));
        const emptyLeaf = "0x" + "0".repeat(64);
        const proof = [];
        
        console.log('Transaction Parameters:');
        console.log('- Candidate ID:', candidateId);
        console.log('- Nullifier Hash:', nullifierHash);
        console.log('- Leaf:', emptyLeaf);
        console.log('- Proof:', proof);
        
        // Check if nullifier is already used
        const isNullifierUsed = await contract.nullifierUsed(nullifierHash);
        console.log('- Nullifier Used:', isNullifierUsed);
        
        // Simulate Merkle proof verification
        let computedHash = emptyLeaf;
        for (let i = 0; i < proof.length; i++) {
            const proofElement = proof[i];
            if (computedHash <= proofElement) {
                computedHash = ethers.keccak256(ethers.concat([computedHash, proofElement]));
            } else {
                computedHash = ethers.keccak256(ethers.concat([proofElement, computedHash]));
            }
        }
        
        console.log('Computed Hash:', computedHash);
        console.log('Expected Root:', merkleRoot);
        console.log('Proof Valid:', computedHash === merkleRoot);
        
        // Try to estimate gas (this will fail if transaction would revert)
        try {
            const gasEstimate = await contract.vote.estimateGas(
                candidateId,
                nullifierHash,
                emptyLeaf,
                proof
            );
            console.log('✅ Gas Estimate:', gasEstimate.toString());
        } catch (error) {
            console.log('❌ Gas Estimation Failed:', error.message);
            
            // Try with different parameters
            console.log('\n🔄 Trying with zero nullifier...');
            const zeroNullifier = "0x" + "0".repeat(64);
            try {
                const gasEstimate2 = await contract.vote.estimateGas(
                    candidateId,
                    zeroNullifier,
                    emptyLeaf,
                    proof
                );
                console.log('✅ Gas Estimate with zero nullifier:', gasEstimate2.toString());
            } catch (error2) {
                console.log('❌ Still failing:', error2.message);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testVote();