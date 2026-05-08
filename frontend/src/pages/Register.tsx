import { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { Role, ROLE_LABELS } from '../api/contract';
import type { Member } from '../api/contract';

export function Register() {
  const { joinPlatform } = useContract();
  const { address, connected, connect } = useWallet();

  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.Collector);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const member = await joinPlatform(address, role, name, parseFloat(lat) * 1e6, parseFloat(lon) * 1e6);
      setResult(member);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">Connect your wallet to register.</p>
        <button
          onClick={() => void connect()}
          className="bg-eco-600 hover:bg-eco-500 text-white font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-eco-400 mb-2">Welcome, {result.display_name}!</h2>
        <p className="text-gray-400">You are registered as a <strong className="text-gray-200">{ROLE_LABELS[result.role]}</strong>.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-eco-400 mb-6">Join EcoChain</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-eco-500"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(Number(e.target.value) as Role)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-eco-500"
          >
            <option value={Role.Collector}>Collector — collect recyclables</option>
            <option value={Role.Processor}>Processor — sort and verify materials</option>
            <option value={Role.Buyer}>Buyer — purchase processed materials</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-eco-500"
              placeholder="52.52"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-eco-500"
              placeholder="13.40"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-eco-600 hover:bg-eco-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>
    </div>
  );
}
