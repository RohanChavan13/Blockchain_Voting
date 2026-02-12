#ifndef MERKLE_TRIE_H
#define MERKLE_TRIE_H

#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

class TrieNode {
public:
    std::unordered_map<char, std::shared_ptr<TrieNode>> children;
    std::string hash;
    std::string value;
    bool isEndOfWord;
    
    TrieNode();
    void updateHash();
};

class MerkleTrie {
private:
    std::shared_ptr<TrieNode> root;
    std::string computeNodeHash(const std::shared_ptr<TrieNode>& node);
    void updateHashesRecursive(std::shared_ptr<TrieNode> node);
    
public:
    MerkleTrie();
    
    // Core trie operations
    void insert(const std::string& key, const std::string& value);
    bool search(const std::string& key);
    std::string getValue(const std::string& key);
    
    // Merkle operations
    std::string getRootHash();
    std::vector<std::string> getMerkleProof(const std::string& key);
    bool verifyProof(const std::string& key, const std::string& value, 
                     const std::vector<std::string>& proof, const std::string& rootHash);
    
    // Hash fusion operations
    std::string generateFusedHash(const std::string& input, const std::string& salt, uint64_t timestamp);
    std::string generateNullifierHash(const std::string& voterHash, const std::string& salt);
    
    // Utility functions
    void printTrie();
    size_t getSize();
    std::vector<std::string> getAllKeys();
};

#endif // MERKLE_TRIE_H