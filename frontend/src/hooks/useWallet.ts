import { useState, useCallback } from 'react';

interface WalletState {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    connected: false,
    connecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      // Dynamic import so the app doesn't crash if Freighter isn't installed
      const freighter = await import('@stellar/freighter-api');
      const result = await freighter.getAddress();
      const addr = typeof result === 'string' ? result : (result as { address: string }).address;
      setState({ address: addr, connected: true, connecting: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setState((s) => ({ ...s, connecting: false, error: msg }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, connected: false, connecting: false, error: null });
  }, []);

  return { ...state, connect, disconnect };
}
