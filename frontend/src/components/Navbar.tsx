import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

export function Navbar() {
  const { address, connected, connecting, connect, disconnect } = useWallet();

  const shortAddr = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  return (
    <nav className="bg-gray-900 border-b border-eco-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-eco-500 font-bold text-xl tracking-tight">
          🌿 EcoChain
        </Link>
        <div className="hidden sm:flex gap-6 text-sm font-medium">
          <Link to="/" className="text-gray-300 hover:text-eco-400 transition-colors">
            Dashboard
          </Link>
          <Link to="/register" className="text-gray-300 hover:text-eco-400 transition-colors">
            Register
          </Link>
          <Link to="/submit" className="text-gray-300 hover:text-eco-400 transition-colors">
            Submit Waste
          </Link>
          <Link to="/incentives" className="text-gray-300 hover:text-eco-400 transition-colors">
            Incentives
          </Link>
        </div>
      </div>

      <div>
        {connected && shortAddr ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-eco-400 font-mono bg-eco-900/30 px-3 py-1 rounded-full border border-eco-700">
              {shortAddr}
            </span>
            <button
              onClick={disconnect}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => void connect()}
            disabled={connecting}
            className="bg-eco-600 hover:bg-eco-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}
