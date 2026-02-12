const hre = require("hardhat");

async function main() {
  console.log("Deploying VotingWithMerkle contract to Sepolia...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Initial Merkle root (zero hash for empty tree)
  const initialRoot = "0x" + "0".repeat(64);
  
  // Number of candidates
  const candidateCount = 5;

  // Deploy contract
  const VotingWithMerkle = await hre.ethers.getContractFactory("VotingWithMerkle");
  const voting = await VotingWithMerkle.deploy(initialRoot, candidateCount);

  await voting.waitForDeployment();
  
  const contractAddress = await voting.getAddress();
  console.log("VotingWithMerkle deployed to:", contractAddress);
  console.log("Initial Merkle root:", initialRoot);
  console.log("Candidate count:", candidateCount);
  console.log("Admin address:", deployer.address);
  
  console.log("\n=== SAVE THIS INFORMATION ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Sepolia Testnet");
  console.log("Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("=============================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
