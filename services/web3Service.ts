import { ethers } from 'ethers';

// MNEE Contract Address (from requirements)
export const MNEE_CONTRACT_ADDRESS = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF";

// ERC20 ABI for MNEE interactions
const MNEE_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)"
];

export interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: bigint | null;
  mneeBalance: string;
  isConnected: boolean;
  error: string | null;
}

export const INITIAL_WEB3_STATE: Web3State = {
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  mneeBalance: '0.00',
  isConnected: false,
  error: null
};

export class Web3Service {
  private static instance: Web3Service;
  
  private constructor() {}

  public static getInstance(): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service();
    }
    return Web3Service.instance;
  }

  public isWalletInstalled(): boolean {
    return typeof (window as any).ethereum !== 'undefined';
  }

  /**
   * Connects to MetaMask, requests accounts, and fetches initial state.
   */
  public async connect(): Promise<Web3State> {
    if (!this.isWalletInstalled()) {
      return { ...INITIAL_WEB3_STATE, error: "MetaMask is not installed. Please install it to use this app." };
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      
      // Explicitly request account access
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      // Enforce Ethereum Mainnet (Chain ID 1)
      const EXPECTED_CHAIN_ID = 1n; 
      if (network.chainId !== EXPECTED_CHAIN_ID) {
        // Attempt to switch automatically
        const switched = await this.switchToEthereumMainnet();
        if (!switched) {
          return {
            ...INITIAL_WEB3_STATE,
            error: "Wrong Network. Please switch to Ethereum Mainnet."
          };
        }
      }
      
      // Fetch MNEE balance immediately upon connection
      const balance = await this.getMNEEBalance(signer, address);

      return {
        provider,
        signer,
        address,
        chainId: network.chainId,
        mneeBalance: balance,
        isConnected: true,
        error: null
      };
    } catch (err: any) {
      console.error("Connection Error:", err);
      
      let errorMessage = "Failed to connect wallet.";
      // EIP-1193 User Rejected Request
      if (err.code === 4001) {
        errorMessage = "Connection request rejected by user.";
      } else if (err.message) {
        // Clean up common error messages if needed, or pass through
        errorMessage = err.message;
      }

      return { ...INITIAL_WEB3_STATE, error: errorMessage };
    }
  }

  /**
   * Fetches the MNEE token balance for a specific address.
   * Returns '0.00' if the contract doesn't exist on the current chain.
   */
  public async getMNEEBalance(signer: ethers.JsonRpcSigner, address: string): Promise<string> {
    try {
      const contract = new ethers.Contract(MNEE_CONTRACT_ADDRESS, MNEE_ABI, signer);
      
      // We wrap the contract calls in a try/catch. 
      // If the user is on the wrong network (where MNEE doesn't exist), 
      // these calls will revert or fail. We default to 0.00 in that case.
      try {
        const decimals = await contract.decimals();
        const balance = await contract.balanceOf(address);
        return ethers.formatUnits(balance, decimals);
      } catch (innerErr) {
        console.warn("Failed to fetch MNEE balance. Are you on the correct network?", innerErr);
        return "0.00";
      }
    } catch (err) {
      console.error("Error setting up MNEE contract:", err);
      return "0.00";
    }
  }

  /**
   * Sends MNEE tokens to a destination address.
   */
  public async sendMNEE(signer: ethers.JsonRpcSigner, to: string, amount: string): Promise<ethers.TransactionResponse> {
    try {
      const contract = new ethers.Contract(MNEE_CONTRACT_ADDRESS, MNEE_ABI, signer);
      
      // Get decimals dynamically to ensure precision is correct
      const decimals = await contract.decimals();
      const parsedAmount = ethers.parseUnits(amount, decimals);
      
      // Execute transfer
      const tx = await contract.transfer(to, parsedAmount);
      return tx;
    } catch (err: any) {
      console.error("Transfer failed:", err);
      // Re-throw the error so the UI can display the specific failure reason (e.g., "insufficient funds")
      throw err;
    }
  }

  /**
   * Attempts to switch the connected wallet to Ethereum Mainnet (Chain ID 1).
   */
  public async switchToEthereumMainnet(): Promise<boolean> {
    if (!(window as any).ethereum) return false;
    
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum Mainnet hex
      });
      return true;
    } catch (switchError: any) {
      // User rejected or network doesn't exist in wallet
      console.error("Failed to switch network:", switchError);
      return false;
    }
  }
}