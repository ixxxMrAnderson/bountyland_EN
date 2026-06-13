// ============================================================================
// MetaMask Wallet Service — Sepolia testnet
// ============================================================================

import { ethers } from 'ethers';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
const SEPOLIA_CHAIN_ID_DEC = 11155111;
const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/';
const SEPOLIA_NAME = 'Sepolia Testnet';

export interface WalletInfo {
  connected: boolean;
  address: string;
  balance: number; // ETH
}

// ---------------------------------------------------------------------------
// EIP-1193 helpers
// ---------------------------------------------------------------------------

function getProvider(): any {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask is not installed. Please install the MetaMask browser extension.');
  }
  return (window as any).ethereum;
}

export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask;
}

// ---------------------------------------------------------------------------
// Connect
// ---------------------------------------------------------------------------

export async function connectWallet(): Promise<WalletInfo> {
  const provider = getProvider();

  // Request accounts
  const accounts: string[] = await provider.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts returned from MetaMask.');
  }

  const address = accounts[0];

  // Ensure we are on Sepolia
  await switchToSepolia(provider);

  // Get balance
  const balance = await getBalance(address, provider);

  return { connected: true, address, balance };
}

// ---------------------------------------------------------------------------
// Disconnect (clear local state — MetaMask doesn't support programmatic disconnect)
// ---------------------------------------------------------------------------

export function disconnectWallet(): WalletInfo {
  return { connected: false, address: '', balance: 0 };
}

// ---------------------------------------------------------------------------
// Switch to Sepolia
// ---------------------------------------------------------------------------

async function switchToSepolia(provider: any): Promise<void> {
  const currentChainId = await provider.request({ method: 'eth_chainId' });

  if (currentChainId === SEPOLIA_CHAIN_ID) return;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (switchError: any) {
    // 4902 = chain not added yet
    if (switchError.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID,
            chainName: SEPOLIA_NAME,
            rpcUrls: ['https://rpc.sepolia.org'],
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

// ---------------------------------------------------------------------------
// Balance
// ---------------------------------------------------------------------------

async function getBalance(address: string, provider: any): Promise<number> {
  const ethersProvider = new ethers.BrowserProvider(provider);
  const balanceWei = await ethersProvider.getBalance(address);
  return parseFloat(ethers.formatEther(balanceWei));
}

export async function refreshBalance(address: string): Promise<number> {
  const provider = getProvider();
  return getBalance(address, provider);
}

// ---------------------------------------------------------------------------
// Listeners
// ---------------------------------------------------------------------------

export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  const provider = (window as any).ethereum;
  if (!provider) return () => {};

  provider.on('accountsChanged', callback);
  return () => provider.removeListener('accountsChanged', callback);
}

export function onChainChanged(callback: (chainId: string) => void): () => void {
  const provider = (window as any).ethereum;
  if (!provider) return () => {};

  provider.on('chainChanged', callback);
  return () => provider.removeListener('chainChanged', callback);
}

// ---------------------------------------------------------------------------
// Network info
// ---------------------------------------------------------------------------

export async function getNetworkInfo(): Promise<{ chainId: number; name: string }> {
  const provider = getProvider();
  const chainId = await provider.request({ method: 'eth_chainId' });
  const chainIdDec = parseInt(chainId, 16);

  const names: Record<number, string> = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
  };

  return { chainId: chainIdDec, name: names[chainIdDec] || `Chain ${chainIdDec}` };
}

// ---------------------------------------------------------------------------
// Sign message (for authentication)
// ---------------------------------------------------------------------------

export async function signMessage(message: string, address: string): Promise<string> {
  const provider = getProvider();
  return provider.request({
    method: 'personal_sign',
    params: [message, address],
  });
}
