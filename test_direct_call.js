// Test direct contract call with wallet
const { ethers } = require("ethers");
require('dotenv').config();

async function testDirectCall() {
    console.log("🧪 Testing direct contract call...");
    
    // Setup
    const contractAddress = "0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC";
    const abi = [
        "function merkleRoot() view returns (bytes32)",
        "function candidateCount() view returns (uint256)",
        "function nullifierUsed(bytes32) view returns (bool)",
        "function vote(uint256 candidateId, bytes32 nullifierHash, bytes32 leaf, bytes32[] proof)"
    ];
    
    // Connect with private key (if available)
    const provider = new ethers.JsonRpcProvider("https://1rpc.io/sepolia");
    
    // For testing, we'll just simulate the call
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Test parameters
    const candidateId = 2;
    const nullifier = ethers.keccak256(ethers.toUtf8Bytes("test-direct-" + Date.now()));
    const leaf = "0x" + "0".repeat(64);
    const proof = [];
    
    console.log("Parameters:");
    console.log("- Candidate ID:", candidateId);
    console.log("- Nullifier:", nullifier);
    console.log("- Leaf:", leaf);
    console.log("- Proof:", proof);
    
    try {
        // Try to simulate the call (this will show us if it would revert)
        console.log("\nSimulating call...");
        const result = await contract.vote.staticCall(candidateId, nullifier, leaf, proof);
        console.log("✅ Static call succeeded:", result);
    } catch (error) {
        console.log("❌ Static call failed:", error.message);
        
        // Try to get more details
        if (error.data) {
            console.log("Error data:", error.data);
        }
        if (error.reason) {
            console.log("Error reason:", error.reason);
        }
    }
    
    // Also test encoding
    console.log("\nTesting function encoding...");
    const iface = new ethers.Interface(abi);
    const encodedData = iface.encodeFunctionData('vote', [candidateId, nullifier, leaf, proof]);
    console.log("Encoded data:", encodedData);
    console.log("Data length:", encodedData.length);
}

testDirectCall().catch(console.error);