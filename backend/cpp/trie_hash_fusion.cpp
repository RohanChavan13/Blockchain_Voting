#include <napi.h>
#include "include/merkle_trie.h"
#include "include/hash_fusion.h"
#include <memory>
#include <chrono>

// Global trie instance for voter data
static std::unique_ptr<MerkleTrie> globalTrie = nullptr;

// Initialize the global trie
void initializeTrie() {
    if (!globalTrie) {
        globalTrie = std::make_unique<MerkleTrie>();
    }
}

// Process voter ID with trie hash fusion
Napi::Object ProcessVoterID(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 3) {
        Napi::TypeError::New(env, "Expected 3 arguments: voterInput, salt, timestamp")
            .ThrowAsJavaScriptException();
        return Napi::Object::New(env);
    }
    
    std::string voterInput = info[0].As<Napi::String>().Utf8Value();
    std::string salt = info[1].As<Napi::String>().Utf8Value();
    uint64_t timestamp = info[2].As<Napi::Number>().Int64Value();
    
    // Initialize trie if not already done
    initializeTrie();
    
    try {
        // Generate voter hash using trie hash fusion
        std::string voterHash = HashFusion::voterHashFusion(voterInput, salt, timestamp);
        
        // Generate nullifier hash for double-vote prevention
        std::string nullifierHash = HashFusion::generateNullifier(voterHash, salt);
        
        // Insert into trie
        globalTrie->insert(voterHash, voterInput);
        
        // Get current trie root
        std::string trieRoot = globalTrie->getRootHash();
        
        // Generate Merkle proof
        std::vector<std::string> merkleProof = globalTrie->getMerkleProof(voterHash);
        
        // Create result object
        Napi::Object result = Napi::Object::New(env);
        result.Set("voterHash", Napi::String::New(env, voterHash));
        result.Set("nullifierHash", Napi::String::New(env, nullifierHash));
        result.Set("trieRoot", Napi::String::New(env, trieRoot));
        
        // Convert merkle proof to JavaScript array
        Napi::Array proofArray = Napi::Array::New(env, merkleProof.size());
        for (size_t i = 0; i < merkleProof.size(); i++) {
            proofArray.Set(i, Napi::String::New(env, merkleProof[i]));
        }
        result.Set("merkleProof", proofArray);
        
        // Add trie data for debugging
        Napi::Object trieData = Napi::Object::New(env);
        trieData.Set("size", Napi::Number::New(env, globalTrie->getSize()));
        trieData.Set("rootHash", Napi::String::New(env, trieRoot));
        result.Set("trieData", trieData);
        
        return result;
        
    } catch (const std::exception& e) {
        Napi::Error::New(env, std::string("Trie hash fusion error: ") + e.what())
            .ThrowAsJavaScriptException();
        return Napi::Object::New(env);
    }
}

// Verify voter in trie
Napi::Boolean VerifyVoter(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Expected voterHash argument")
            .ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }
    
    std::string voterHash = info[0].As<Napi::String>().Utf8Value();
    
    if (!globalTrie) {
        return Napi::Boolean::New(env, false);
    }
    
    bool exists = globalTrie->search(voterHash);
    return Napi::Boolean::New(env, exists);
}

// Get trie statistics
Napi::Object GetTrieStats(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    Napi::Object stats = Napi::Object::New(env);
    
    if (!globalTrie) {
        stats.Set("initialized", Napi::Boolean::New(env, false));
        stats.Set("size", Napi::Number::New(env, 0));
        stats.Set("rootHash", Napi::String::New(env, ""));
        return stats;
    }
    
    stats.Set("initialized", Napi::Boolean::New(env, true));
    stats.Set("size", Napi::Number::New(env, globalTrie->getSize()));
    stats.Set("rootHash", Napi::String::New(env, globalTrie->getRootHash()));
    
    // Get all keys for debugging
    std::vector<std::string> keys = globalTrie->getAllKeys();
    Napi::Array keysArray = Napi::Array::New(env, keys.size());
    for (size_t i = 0; i < keys.size(); i++) {
        keysArray.Set(i, Napi::String::New(env, keys[i].substr(0, 16) + "..."));
    }
    stats.Set("voterHashes", keysArray);
    
    return stats;
}

// Generate hash using different algorithms
Napi::String GenerateHash(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 2) {
        Napi::TypeError::New(env, "Expected input and algorithm arguments")
            .ThrowAsJavaScriptException();
        return Napi::String::New(env, "");
    }
    
    std::string input = info[0].As<Napi::String>().Utf8Value();
    std::string algorithm = info[1].As<Napi::String>().Utf8Value();
    
    std::string result;
    
    if (algorithm == "sha256") {
        result = HashFusion::sha256(input);
    } else if (algorithm == "keccak256") {
        result = HashFusion::keccak256(input);
    } else if (algorithm == "blake2b") {
        result = HashFusion::blake2b(input);
    } else {
        result = HashFusion::sha256(input); // Default to SHA256
    }
    
    return Napi::String::New(env, result);
}

// Reset trie (for testing)
Napi::Boolean ResetTrie(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    globalTrie = std::make_unique<MerkleTrie>();
    return Napi::Boolean::New(env, true);
}

// Module initialization
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("processVoterID", Napi::Function::New(env, ProcessVoterID));
    exports.Set("verifyVoter", Napi::Function::New(env, VerifyVoter));
    exports.Set("getTrieStats", Napi::Function::New(env, GetTrieStats));
    exports.Set("generateHash", Napi::Function::New(env, GenerateHash));
    exports.Set("resetTrie", Napi::Function::New(env, ResetTrie));
    
    return exports;
}

NODE_API_MODULE(trie_hash_fusion, Init)