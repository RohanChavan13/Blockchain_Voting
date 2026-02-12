// Merkle tree manager - WORKING VERSION

class MerkleManager {
    constructor() {
        this.tree = null;
        this.leaves = [];
        this.root = null;
    }

    addVoter(voterLeaf) {
        if (!this.leaves.includes(voterLeaf)) {
            this.leaves.push(voterLeaf);
        }
    }

    buildTree() {
        if (this.leaves.length === 0) {
            this.root = "0x" + "0".repeat(64);
            return this.root;
        }

        const leafBuffers = this.leaves.map(leaf => {
            const hex = leaf.slice(2);
            return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        });

        this.tree = new MerkleTree(
            leafBuffers,
            (data) => {
                const hex = ethers.keccak256(data);
                const bytes = hex.slice(2).match(/.{1,2}/g).map(byte => parseInt(byte, 16));
                return new Uint8Array(bytes);
            },
            { sortPairs: true, hashLeaves: false }
        );

        const rootBuffer = this.tree.getRoot();
        this.root = '0x' + Array.from(rootBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
        
        return this.root;
    }

    generateProof(leaf) {
        if (!this.tree) {
            throw new Error('Tree not built');
        }

        const hex = leaf.slice(2);
        const leafBuffer = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const proof = this.tree.getProof(leafBuffer);
        
        return proof.map(p => {
            const data = p.data || p;
            return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
        });
    }

    buildDemoTree(currentVoterLeaf) {
        this.leaves = [];
        
        for (let i = 0; i < 4; i++) {
            const demoHash = ethers.keccak256(ethers.toUtf8Bytes(`demo-voter-${i}`));
            const demoLeaf = ethers.keccak256(ethers.toUtf8Bytes(demoHash));
            this.addVoter(demoLeaf);
        }
        
        this.addVoter(currentVoterLeaf);
        return this.buildTree();
    }

    getRoot() {
        return this.root;
    }
}

const merkleManager = new MerkleManager();
