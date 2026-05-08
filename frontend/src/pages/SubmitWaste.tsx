import { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { MaterialKind, KIND_LABELS, KIND_EMOJI } from '../api/contract';
import type { Item } from '../api/contract';

export function SubmitWaste() {
  const { submitItem } = useContract();
  const { address, connected, connect } = useWallet();

  const [kind, setKind] = useState<MaterialKind>(MaterialKind.Plastic);
  const [weight, setWeight] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const item = await submitItem(
        address,
        kind,
        Math.round(parseFloat(weight) * 1000),
        Math.round(parseFloat(lat) * 1e6),
        Math.round(parseFloat(lon) * 1e6),
      );
      setResult(item);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">Connect your wallet to submit waste items.</p>
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
        <div className="text-5xl mb-4">{KIND_EMOJI[result.kind]}</div>
        <h2 className="text-2xl font-bold text-eco-400 mb-2">Item Submitted!</h2>
        <p className="text-gray-400 mb-1">
          <strong className="text-gray-200">{KIND_LABELS[result.kind]}</strong> — {(result.weight_grams / 1000).toFixed(2)} kg
        </p>
        <p className="text-gray-500 text-sm">Item ID: #{result.id}</p>
        <button
          onClick={() => { setResult(null); setWeight(''); }}
          className="mt-6 text-eco-400 hover:text-eco-300 text-sm underline"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-eco-400 mb-6">Submit Waste</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Material Kind</label>
          <select
            value={kind}
            onChange={(e) => setKind(Number(e.target.value) as MaterialKind)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-eco-500"
          >
            {Object.values(MaterialKind)
              .filter((v) => typeof v === 'number')
              .map((v) => (
                <option key={v} value={v}>
                  {KIND_EMOJI[v as MaterialKind]} {KIND_LABELS[v as MaterialKind]}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Weight (kg)</label>
          <input
            type="number"
            step="0.001"
            min="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-eco-500"
            placeholder="e.g. 2.5"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 0.1 kg (100g)</p>
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
          {loading ? 'Submitting…' : 'Submit Item'}
        </button>
      </form>
    </div>
  );
}
