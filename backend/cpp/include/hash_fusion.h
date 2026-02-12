#ifndef HASH_FUSION_H
#define HASH_FUSION_H

#include <string>
#include <vector>
#include <cstdint>

class HashFusion {
public:
    // Core hash fusion algorithms
    static std::string sha256(const std::string& input);
    static std::string keccak256(const std::string& input);
    static std::string blake2b(const std::string& input);
    
    // Trie-specific hash fusion
    static std::string trieHashFusion(const std::string& input, 
                                     const std::string& salt, 
                                     uint64_t timestamp);
    
    // Multi-layer hash fusion for voter ID
    static std::string voterHashFusion(const std::string& voterInput,
                                      const std::string& salt,
                                      uint64_t timestamp);
    
    // Nullifier hash generation (prevents double voting)
    static std::string generateNullifier(const std::string& voterHash,
                                        const std::string& secret);
    
    // Merkle proof generation helpers
    static std::string combineHashes(const std::string& left, const std::string& right);
    static std::vector<std::string> generateMerkleProof(const std::vector<std::string>& leaves,
                                                       const std::string& target);
    
    // Utility functions
    static std::string hexEncode(const std::vector<uint8_t>& data);
    static std::vector<uint8_t> hexDecode(const std::string& hex);
    static std::string bytesToHex(const uint8_t* data, size_t length);
    
private:
    // Internal hash computation helpers
    static std::vector<uint8_t> computeSHA256(const std::vector<uint8_t>& input);
    static std::vector<uint8_t> computeKeccak256(const std::vector<uint8_t>& input);
    static std::vector<uint8_t> computeBlake2b(const std::vector<uint8_t>& input);
};

#endif // HASH_FUSION_H