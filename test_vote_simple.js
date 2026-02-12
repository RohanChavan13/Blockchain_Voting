// Simple test to debug the voting issue
const { ethers } = require("ethers");

async function testVote() {
    console.log("🧪 Testing vote transaction...");
    
    // Contract details
    const contractAddress = "0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC";
    const abi = [
        "function merkleRoot() view returns (bytes32)",
        "function candidateCount() view returns (uint256)",
        "function nullifierUsed(bytes32) view returns (bool)",
        "function vote(uint256 candidateId, bytes32 nullifierHash, bytes32 leaf, bytes32[] proof)"
    ];
    
    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider("https://1rpc.io/sepolia");
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Check contract state
    const merkleRoot = await contract.merkleRoot();
    const candidateCount = await contract.candidateCount();
    
    console.log("Contract state:");
    console.log("- Merkle root:", merkleRoot);
    console.log("- Candidate count:", candidateCount.toString());
    console.log("- Is root zero?", merkleRoot === "0x" + "0".repeat(64));
    
    // Test parameters
    const candidateId = 2; // Candidate 2
    const nullifier = ethers.keccak256(ethers.toUtf8Bytes("test-nullifier-" + Date.now()));
    const leaf = "0x" + "0".repeat(64); // Zero leaf for zero root
    const proof = []; // Empty proof for zero root
    
    console.log("\nTest parameters:");
    console.log("- Candidate ID:", candidateId);
    console.log("- Nullifier:", nullifier);
    console.log("- Leaf:", leaf);
    console.log("- Proof:", proof);
    
    // Check if nullifier is already used
    const isUsed = await contract.nullifierUsed(nullifier);
    console.log("- Nullifier used?", isUsed);
    
    // Manual Merkle proof verification
    let computedHash = leaf;
    for (let i = 0; i < proof.length; i++) {
        const proofElement = proof[i];
        if (computedHash <= proofElement) {
            computedHash = ethers.keccak256(ethers.concat([computedHash, proofElement]));
        } else {
            computedHash = ethers.keccak256(ethers.concat([proofElement, computedHash]));
        }
    }
    
    console.log("\nMerkle verification:");
    console.log("- Computed hash:", computedHash);
    console.log("- Expected root:", merkleRoot);
    console.log("- Verification passes?", computedHash === merkleRoot);
    
    // Validation checks
    console.log("\nValidation checks:");
    console.log("- Candidate ID valid?", candidateId > 0 && candidateId <= candidateCount);
    console.log("- Nullifier not used?", !isUsed);
    console.log("- Merkle proof valid?", computedHash === merkleRoot);
    
    if (candidateId > 0 && candidateId <= candidateCount && !isUsed && computedHash === merkleRoot) {
        console.log("\n✅ All validations pass - transaction should succeed");
    } else {
        console.log("\n❌ Validation failed - transaction will revert");
    }
}

testVote().catch(console.error);