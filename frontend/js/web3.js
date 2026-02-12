// Web3 integration layer for blockchain interactions

class Web3Manager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.account = null;
    }

    // Check if MetaMask is installed
    isMetaMaskInstalled() {
        return typeof window.ethereum !== 'undefined';
    }

    // Connect to MetaMask wallet
    async connectWallet() {
        if (!this.isMetaMaskInstalled()) {
            throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
        }

        try {
            // Request account access - this will show MetaMask popup
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found. Please unlock MetaMask.');
            }
            
            // Create provider and signer
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.account = await this.signer.getAddress();

            // Check network
            const network = await this.provider.getNetwork();
            if (Number(network.chainId) !== CONFIG.NETWORK.CHAIN_ID) {
                await this.switchNetwork();
            }

            // Initialize contract
            this.contract = new ethers.Contract(
                CONFIG.CONTRACT_ADDRESS,
                CONFIG.CONTRACT_ABI,
                this.signer
            );

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    window.location.reload();
                }
            });

            // Listen for network changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

            return this.account;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    }

    // Switch to Sepolia network
    async switchNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${CONFIG.NETWORK.CHAIN_ID.toString(16)}` }],
            });
        } catch (error) {
            // If network doesn't exist, add it
            if (error.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${CONFIG.NETWORK.CHAIN_ID.toString(16)}`,
                        chainName: 'Sepolia Testnet',
                        nativeCurrency: {
                            name: 'Sepolia ETH',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: [CONFIG.NETWORK.RPC_URL],
                        blockExplorerUrls: [CONFIG.NETWORK.EXPLORER_URL]
                    }]
                });
            } else {
                throw error;
            }
        }
    }

    // Get contract instance (read-only)
    async getReadOnlyContract() {
        if (!this.provider) {
            this.provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.RPC_URL);
        }
        
        return new ethers.Contract(
            CONFIG.CONTRACT_ADDRESS,
            CONFIG.CONTRACT_ABI,
            this.provider
        );
    }

    // Disconnect wallet
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.account = null;
    }

    // Get current account
    getAccount() {
        return this.account;
    }

    // Get contract instance
    getContract() {
        return this.contract;
    }

    // Get provider instance
    getProvider() {
        return this.provider;
    }

    // Get signer instance
    getSigner() {
        return this.signer;
    }

    // Check network status
    async checkNetworkStatus() {
        try {
            if (!this.provider) {
                this.provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.RPC_URL);
            }
            const blockNumber = await this.provider.getBlockNumber();
            return {
                connected: true,
                blockNumber: blockNumber
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    // Get transaction receipt
    async getTransactionReceipt(txHash) {
        if (!this.provider) {
            this.provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.RPC_URL);
        }
        return await this.provider.getTransactionReceipt(txHash);
    }

    // Wait for transaction confirmation
    async waitForTransaction(txHash, confirmations = 1) {
        if (!this.provider) {
            this.provider = new ethers.JsonRpcProvider(CONFIG.NETWORK.RPC_URL);
        }
        return await this.provider.waitForTransaction(txHash, confirmations);
    }

    // Estimate gas for transaction
    async estimateGas(method, ...args) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        return await this.contract[method].estimateGas(...args);
    }

    // Get Etherscan link for transaction
    getEtherscanLink(txHash) {
        return `${CONFIG.NETWORK.EXPLORER_URL}/tx/${txHash}`;
    }

    // Get Etherscan link for address
    getEtherscanAddressLink(address) {
        return `${CONFIG.NETWORK.EXPLORER_URL}/address/${address}`;
    }
}

// Create global instance
const web3Manager = new Web3Manager();
