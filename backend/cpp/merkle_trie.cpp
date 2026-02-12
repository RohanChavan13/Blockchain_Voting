#include "include/merkle_trie.h"
#include "include/hash_fusion.h"
#include <iostream>
#include <sstream>
#include <algorithm>
#include <queue>

// TrieNode Implementation
TrieNode::TrieNode() : isEndOfWord(false) {
    updateHash();
}

void TrieNode::updateHash() {
    std::string combined = value;
    
    // Combine all children hashes in sorted order for consistency
    std::vector<std::string> childHashes;
    for (const auto& child : children) {
        childHashes.push_back(child.first + child.second->hash);
    }
    
    std::sort(childHashes.begin(), childHashes.end());
    for (const auto& childHash : childHashes) {
        combined += childHash;
    }
    
    if (isEndOfWord) {
        combined += "END";
    }
    
    hash = HashFusion::sha256(combined);
}

// MerkleTrie Implementation
MerkleTrie::MerkleTrie() {
    root = std::make_shared<TrieNode>();
}

void MerkleTrie::insert(const std::string& key, const std::string& value) {
    auto current = root;
    
    for (char c : key) {
        if (current->children.find(c) == current->children.end()) {
            current->children[c] = std::make_shared<TrieNode>();
        }
        current = current->children[c];
    }
    
    current->isEndOfWord = true;
    current->value = value;
    
    // Update hashes from leaf to root
    updateHashesRecursive(root);
}

bool MerkleTrie::search(const std::string& key) {
    auto current = root;
    
    for (char c : key) {
        if (current->children.find(c) == current->children.end()) {
            return false;
        }
        current = current->children[c];
    }
    
    return current->isEndOfWord;
}

std::string MerkleTrie::getValue(const std::string& key) {
    auto current = root;
    
    for (char c : key) {
        if (current->children.find(c) == current->children.end()) {
            return "";
        }
        current = current->children[c];
    }
    
    return current->isEndOfWord ? current->value : "";
}

std::string MerkleTrie::getRootHash() {
    return root->hash;
}

std::vector<std::string> MerkleTrie::getMerkleProof(const std::string& key) {
    std::vector<std::string> proof;
    auto current = root;
    
    for (char c : key) {
        if (current->children.find(c) == current->children.end()) {
            return proof; // Empty proof if key not found
        }
        
        // Add sibling hashes to proof
        for (const auto& child : current->children) {
            if (child.first != c) {
                proof.push_back(child.second->hash);
            }
        }
        
        current = current->children[c];
    }
    
    return proof;
}

bool MerkleTrie::verifyProof(const std::string& key, const std::string& value,
                            const std::vector<std::string>& proof, const std::string& rootHash) {
    // Simplified verification - in production, implement full Merkle proof verification
    std::string computedHash = HashFusion::sha256(key + value);
    
    for (const auto& proofHash : proof) {
        computedHash = HashFusion::combineHashes(computedHash, proofHash);
    }
    
    return computedHash == rootHash;
}

std::string MerkleTrie::generateFusedHash(const std::string& input, const std::string& salt, uint64_t timestamp) {
    return HashFusion::trieHashFusion(input, salt, timestamp);
}

std::string MerkleTrie::generateNullifierHash(const std::string& voterHash, const std::string& salt) {
    return HashFusion::generateNullifier(voterHash, salt);
}

void MerkleTrie::updateHashesRecursive(std::shared_ptr<TrieNode> node) {
    if (!node) return;
    
    // Update children first (post-order traversal)
    for (auto& child : node->children) {
        updateHashesRecursive(child.second);
    }
    
    // Update current node hash
    node->updateHash();
}

std::string MerkleTrie::computeNodeHash(const std::shared_ptr<TrieNode>& node) {
    return node->hash;
}

void MerkleTrie::printTrie() {
    std::cout << "Merkle Trie Structure:" << std::endl;
    std::cout << "Root Hash: " << root->hash.substr(0, 16) << "..." << std::endl;
}

size_t MerkleTrie::getSize() {
    size_t count = 0;
    std::queue<std::shared_ptr<TrieNode>> queue;
    queue.push(root);
    
    while (!queue.empty()) {
        auto node = queue.front();
        queue.pop();
        
        if (node->isEndOfWord) {
            count++;
        }
        
        for (const auto& child : node->children) {
            queue.push(child.second);
        }
    }
    
    return count;
}

std::vector<std::string> MerkleTrie::getAllKeys() {
    std::vector<std::string> keys;
    std::string currentKey = "";
    
    std::function<void(std::shared_ptr<TrieNode>, std::string)> dfs = 
        [&](std::shared_ptr<TrieNode> node, std::string key) {
            if (node->isEndOfWord) {
                keys.push_back(key);
            }
            
            for (const auto& child : node->children) {
                dfs(child.second, key + child.first);
            }
        };
    
    dfs(root, currentKey);
    return keys;
}