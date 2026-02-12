// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VotingWithMerkle
 * @dev Blockchain voting system with Merkle proof verification
 * Stores voter registry root on-chain and verifies votes with Merkle proofs
 */
contract VotingWithMerkle {
    // Current Merkle root of voter registry
    bytes32 public merkleRoot;
    
    // Contract administrator
    address public admin;
    
    // Number of candidates (fixed at 5)
    uint256 public candidateCount;
    
    // Mapping from candidate ID to vote count
    mapping(uint256 => uint256) public votes;
    
    // Mapping to track used nullifiers (prevents double voting)
    mapping(bytes32 => bool) public nullifierUsed;
    
    // Events
    event RootUpdated(bytes32 newRoot, uint256 timestamp);
    event VoteCast(bytes32 nullifierHash, uint256 candidateId, address voter);
    
    // Modifier to restrict functions to admin only
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    /**
     * @dev Constructor initializes the contract
     * @param _root Initial Merkle root (can be zero hash for empty tree)
     * @param _candidateCount Number of candidates (should be 5)
     */
    constructor(bytes32 _root, uint256 _candidateCount) {
        merkleRoot = _root;
        admin = msg.sender;
        candidateCount = _candidateCount;
    }

    /**
     * @dev Admin updates the Merkle root (after new voter registrations)
     * @param _newRoot New Merkle root to set
     */
    function updateRoot(bytes32 _newRoot) external onlyAdmin {
        merkleRoot = _newRoot;
        emit RootUpdated(_newRoot, block.timestamp);
    }
    
    /**
     * @dev Cast a vote with Merkle proof verification
     * @param candidateId ID of candidate to vote for (1-5)
     * @param nullifierHash Unique hash to prevent double voting
     * @param leaf Voter's leaf in the Merkle tree
     * @param proof Array of sibling hashes for Merkle proof
     */
    function vote(
        uint256 candidateId,
        bytes32 nullifierHash,
        bytes32 leaf,
        bytes32[] calldata proof
    ) external {
        // Validate candidate ID
        require(candidateId > 0 && candidateId <= candidateCount, "Invalid candidate ID");
        
        // Check if voter has already voted
        require(!nullifierUsed[nullifierHash], "Already voted");
        
        // Verify Merkle proof
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            
            // Sorted pair hashing to prevent second-preimage attacks
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        // Verify computed root matches stored root
        require(computedHash == merkleRoot, "Invalid Merkle proof");
        
        // Mark nullifier as used
        nullifierUsed[nullifierHash] = true;
        
        // Increment vote count
        votes[candidateId] += 1;
        
        // Emit event
        emit VoteCast(nullifierHash, candidateId, msg.sender);
    }
    
    /**
     * @dev Get vote count for a specific candidate
     * @param candidateId ID of candidate
     * @return Vote count
     */
    function getVotes(uint256 candidateId) external view returns (uint256) {
        require(candidateId > 0 && candidateId <= candidateCount, "Invalid candidate ID");
        return votes[candidateId];
    }
}
