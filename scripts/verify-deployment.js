const hre = require("hardhat");

async function main() {
  console.log("Verifying deployment setup...\n");

  // Check if we can connect to Sepolia
  try {
    const provider = new hre.ethers.JsonRpcProvider("https://rpc.sepolia.org");
    const blockNumber = await provider.getBlockNumber();
    console.log("✅ Connected to Sepolia RPC");
    console.log(`   Current block: ${blockNumber}\n`);
  } catch (error) {
    console.log("❌ Cannot connect to Sepolia RPC");
    console.log(`   Error: ${error.message}\n`);
    return;
  }

  // Check account balance
  const accountAddress = "0xEAFB6F9923d11496298993355bca0ca045e36aE7";
  try {
    const provider = new hre.ethers.JsonRpcProvider("https://rpc.sepolia.org");
    const balance = await provider.getBalance(accountAddress);
    const balanceInEth = hre.ethers.formatEther(balance);
    console.log("✅ Account balance check");
    console.log(`   Address: ${accountAddress}`);
    console.log(`   Balance: ${balanceInEth} ETH`);
    
    if (parseFloat(balanceInEth) < 0.001) {
      console.log("   ⚠️  Warning: Low balance, may not be enough for deployment\n");
    } else {
      console.log("   ✅ Sufficient balance for deployment\n");
    }
  } catch (error) {
    console.log("❌ Cannot check account balance");
    console.log(`   Error: ${error.message}\n`);
  }

  // Check if contract is compiled
  try {
    const artifact = await hre.artifacts.readArtifact("VotingWithMerkle");
    console.log("✅ Contract compiled successfully");
    console.log(`   Contract: ${artifact.contractName}`);
    console.log(`   Bytecode size: ${artifact.bytecode.length / 2} bytes\n`);
  } catch (error) {
    console.log("❌ Contract not compiled");
    console.log("   Run: npx hardhat compile\n");
  }

  console.log("=".repeat(50));
  console.log("Ready to deploy!");
  console.log("=".repeat(50));
  console.log("\nNext steps:");
  console.log("1. Add your private key to .env file");
  console.log("2. Run: npx hardhat run scripts/deploy.js --network sepolia");
  console.log("3. Copy the contract address");
  console.log("4. Update frontend/js/config.js with the address");
  console.log("5. Start frontend: npx http-server frontend -p 8000\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
