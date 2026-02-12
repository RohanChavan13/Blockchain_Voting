#include "include/hash_fusion.h"
#include <openssl/sha.h>
#include <openssl/evp.h>
#include <iomanip>
#include <sstream>
#include <algorithm>
#include <cstring>

// SHA256 implementation
std::string HashFusion::sha256(const std::string& input) {
    std::vector<uint8_t> inputBytes(input.begin(), input.end());
    std::vector<uint8_t> hash = computeSHA256(inputBytes);
    return hexEncode(hash);
}

// Keccak256 implementation (simplified - using SHA256 for compatibility)
std::string HashFusion::keccak256(const std::string& input) {
    // In production, use proper Keccak256 implementation
    // For now, using SHA256 as fallback
    return sha256("keccak:" + input);
}

// Blake2b implementation (simplified - using SHA256 for compatibility)
std::string HashFusion::blake2b(const std::string& input) {
    // In production, use proper Blake2b implementation
    // For now, using SHA256 as fallback
    return sha256("blake2b:" + input);
}

// Trie-specific hash fusion combining multiple algorithms
std::string HashFusion::trieHashFusion(const std::string& input, 
                                      const std::string& salt, 
                                      uint64_t timestamp) {
    // Multi-layer hash fusion for enhanced security
    std::string layer1 = sha256(input + salt);
    std::string layer2 = keccak256(layer1 + std::to_string(timestamp));
    std::string layer3 = blake2b(layer2 + input);
    
    // Final fusion
    std::string finalInput = layer1 + layer2 + layer3 + salt;
    return sha256(finalInput);
}

// Voter-specific hash fusion
std::string HashFusion::voterHashFusion(const std::string& voterInput,
                                       const std::string& salt,
                                       uint64_t timestamp) {
    // Step 1: Basic hash of voter input
    std::string baseHash = sha256(voterInput);
    
    // Step 2: Add temporal component
    std::string timeHash = sha256(baseHash + std::to_string(timestamp));
    
    // Step 3: Add salt for uniqueness
    std::string saltedHash = keccak256(timeHash + salt);
    
    // Step 4: Final trie hash fusion
    return trieHashFusion(saltedHash, salt, timestamp);
}

// Generate nullifier hash to prevent double voting
std::string HashFusion::generateNullifier(const std::string& voterHash,
                                         const std::string& secret) {
    // Nullifier = Hash(voterHash + secret + "NULLIFIER")
    std::string nullifierInput = voterHash + secret + "NULLIFIER";
    return sha256(nullifierInput);
}

// Combine two hashes (for Merkle tree operations)
std::string HashFusion::combineHashes(const std::string& left, const std::string& right) {
    // Sort hashes to ensure consistent ordering
    std::string first = left < right ? left : right;
    std::string second = left < right ? right : left;
    
    return sha256(first + second);
}

// Generate Merkle proof for a set of leaves
std::vector<std::string> HashFusion::generateMerkleProof(const std::vector<std::string>& leaves,
                                                        const std::string& target) {
    std::vector<std::string> proof;
    std::vector<std::string> currentLevel = leaves;
    
    // Find target index
    auto it = std::find(currentLevel.begin(), currentLevel.end(), target);
    if (it == currentLevel.end()) {
        return proof; // Target not found
    }
    
    size_t targetIndex = std::distance(currentLevel.begin(), it);
    
    // Build proof by traversing up the tree
    while (currentLevel.size() > 1) {
        std::vector<std::string> nextLevel;
        
        for (size_t i = 0; i < currentLevel.size(); i += 2) {
            if (i + 1 < currentLevel.size()) {
                // Add sibling to proof if current index is target or its sibling
                if (i == targetIndex || i + 1 == targetIndex) {
                    size_t siblingIndex = (i == targetIndex) ? i + 1 : i;
                    proof.push_back(currentLevel[siblingIndex]);
                }
                
                // Combine hashes for next level
                std::string combined = combineHashes(currentLevel[i], currentLevel[i + 1]);
                nextLevel.push_back(combined);
            } else {
                // Odd number of elements, carry forward
                nextLevel.push_back(currentLevel[i]);
            }
        }
        
        // Update target index for next level
        targetIndex = targetIndex / 2;
        currentLevel = nextLevel;
    }
    
    return proof;
}

// Utility functions
std::string HashFusion::hexEncode(const std::vector<uint8_t>& data) {
    std::stringstream ss;
    ss << std::hex << std::setfill('0');
    for (uint8_t byte : data) {
        ss << std::setw(2) << static_cast<int>(byte);
    }
    return ss.str();
}

std::vector<uint8_t> HashFusion::hexDecode(const std::string& hex) {
    std::vector<uint8_t> result;
    for (size_t i = 0; i < hex.length(); i += 2) {
        std::string byteString = hex.substr(i, 2);
        uint8_t byte = static_cast<uint8_t>(std::strtol(byteString.c_str(), nullptr, 16));
        result.push_back(byte);
    }
    return result;
}

std::string HashFusion::bytesToHex(const uint8_t* data, size_t length) {
    std::vector<uint8_t> vec(data, data + length);
    return hexEncode(vec);
}

// Internal hash computation helpers
std::vector<uint8_t> HashFusion::computeSHA256(const std::vector<uint8_t>& input) {
    std::vector<uint8_t> hash(SHA256_DIGEST_LENGTH);
    
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, input.data(), input.size());
    SHA256_Final(hash.data(), &sha256);
    
    return hash;
}

std::vector<uint8_t> HashFusion::computeKeccak256(const std::vector<uint8_t>& input) {
    // Fallback to SHA256 for compatibility
    // In production, implement proper Keccak256
    return computeSHA256(input);
}

std::vector<uint8_t> HashFusion::computeBlake2b(const std::vector<uint8_t>& input) {
    // Fallback to SHA256 for compatibility
    // In production, implement proper Blake2b
    return computeSHA256(input);
}