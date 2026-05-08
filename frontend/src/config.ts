export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID ?? '';
export const NETWORK = (import.meta.env.VITE_NETWORK ?? 'TESTNET') as 'TESTNET' | 'MAINNET';
export const RPC_URL = import.meta.env.VITE_RPC_URL ?? 'https://soroban-testnet.stellar.org';
