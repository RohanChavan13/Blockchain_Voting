/**
 * Algorand Manager - Handles communication with Algorand Blockchain
 * Replaces Web3.js / Ethers.js
 */

class AlgorandManager {
    constructor() {
        // Algorand Node Configuration (LocalNet / Testnet)
        // These can be overridden by config.js if present
        this.token = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        this.server = 'http://localhost';
        this.port = 4001;
        this.client = null;
        this.isConnected = false;
    }

    /**
     * Initialize Algorand Client (Algod)
     */
    async init() {
        try {
            if (typeof algosdk === 'undefined') {
                throw new Error('Algorand SDK not loaded. Check script tags.');
            }

            console.log(`🔌 Connecting to Algorand Node at ${this.server}:${this.port}...`);
            this.client = new algosdk.Algodv2(this.token, this.server, this.port);

            // Test connection by fetching status
            const status = await this.client.status().do();
            this.isConnected = true;
            console.log('✅ Connected to Algorand Node. Last Round:', status['last-round']);
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to Algorand:', error);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Submit a Vote Transaction using the Ephemeral Key
     * @param {string} mnemonic - The ephemeral private key (25 words)
     * @param {number} candidateId - The ID of the candidate (0, 1, 2...)
     * @param {string} nullifierHash - The user's unique nullifier
     */
    async submitVote(mnemonic, candidateId, nullifierHash) {
        if (!this.isConnected) {
            await this.init();
            if (!this.isConnected) throw new Error('Cannot connect to Algorand Node');
        }

        try {
            // 1. Recover Account from Mnemonic
            const account = algosdk.mnemonicToSecretKey(mnemonic);
            console.log('🗳️ Signing vote with Ephemeral Account:', account.addr);

            // 2. Get Transaction Params (Suggested Fee, Last Round, etc.)
            const params = await this.client.getTransactionParams().do();

            // 3. Construct Transaction Note (The Vote Data)
            // Format: "VOTE:<candidateId>:<nullifierHash>"
            // In a real ZK system, this would be a ZK Proof.
            // For this demo, we use a simple JSON or string format.
            const voteData = JSON.stringify({
                c: candidateId,
                n: nullifierHash,
                t: Date.now()
            });
            const note = new TextEncoder().encode(voteData);

            // 4. Create Transaction (0 Algo Payment to Self/Candidate/SmartContract)
            // In this specific design, we are sending 1 Vote Token (ASA) if configured, 
            // OR just a 0 Algo transaction with a Note if no ASA is used.

            // Let's assume we send a 0 Algo transaction to the Candidates Address (simulated)
            // Or just to self with the note.
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                from: account.addr,
                to: account.addr, // Self-transaction to record data on chain
                amount: 0,
                note: note,
                suggestedParams: params
            });

            // 5. Sign Transaction
            const signedTxn = txn.signTxn(account.sk);

            // 6. Submit to Network
            const { txId } = await this.client.sendRawTransaction(signedTxn).do();
            console.log('✅ Vote Transaction Submitted. ID:', txId);

            // 7. Wait for Confirmation
            const confirmedTxn = await algosdk.waitForConfirmation(this.client, txId, 4);
            console.log('✅ Transaction Confirmed in Round:', confirmedTxn['confirmed-round']);

            return {
                txId: txId,
                round: confirmedTxn['confirmed-round']
            };

        } catch (error) {
            console.error('❌ Vote Submission Failed:', error);
            throw error;
        }
    }

    /**
     * Helper: Get Explorer Link
     */
    getExplorerLink(txId) {
        // Default to LocalNet (DappFlow or similar), but could be Testnet
        return `https://app.dappflow.org/explorer/transaction/${txId}`;
    }
}

// Global Instance
const algorandManager = new AlgorandManager();
