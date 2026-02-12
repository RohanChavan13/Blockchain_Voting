const hre = require("hardhat");
const ethers = require("ethers");

async function main() {
  console.log("Updating Merkle root to allow voting...");

  const [admin] = await hre.ethers.getSigners();
  console.log("Admin account:", admin.address);

  const contractAddress = "0x7059c2D1e46581cc5F35F0c34bd5F5B744e62DEC";
  
  const VotingContract = await hre.ethers.getContractAt("VotingWithMerkle", contractAddress);

  // Create a demo Merkle tree with some voters
  const demoVoters = [];
  for (let i = 0; i < 10; i++) {
    const voterHash = ethers.keccak256(ethers.toUtf8Bytes(`demo-voter-${i}`));
    const leaf = ethers.keccak256(ethers.toUtf8Bytes(voterHash));
    demoVoters.push(leaf);
  }

  // For simplicity, just use a hash of all voters as root
  // In production, you'd build a proper Merkle tree
  const combinedHash = ethers.keccak256(ethers.concat(demoVoters));
  
  console.log("New Merkle root:", combinedHash);

  const tx = await VotingContract.updateRoot(combinedHash);
  console.log("Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("Root updated successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
