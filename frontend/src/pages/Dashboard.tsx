import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatsPanel } from '../components/StatsPanel';
import { WasteCard } from '../components/WasteCard';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import type { PlatformStats, Item } from '../api/contract';
import { MaterialKind } from '../api/contract';

const MOCK_ITEMS: Item[] = [
  { id: 1, kind: MaterialKind.Plastic, weight_grams: 2500, owner: 'GABC1234567890ABCDEF', submitted_at: 1700000000, verified: true, transferred: false, location_lat: 52_520_000, location_lon: 13_405_000 },
  { id: 2, kind: MaterialKind.Electronic, weight_grams: 800, owner: 'GXYZ9876543210FEDCBA', submitted_at: 1700001000, verified: false, transferred: false, location_lat: 48_856_000, location_lon: 2_352_000 },
  { id: 3, kind: MaterialKind.Metal, weight_grams: 5100, owner: 'GDEF1111222233334444', submitted_at: 1700002000, verified: true, transferred: true, location_lat: 40_712_000, location_lon: -74_006_000 },
];

export function Dashboard() {
  const { getStats } = useContract();
  const { connected } = useWallet();
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, [getStats]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-eco-400 mb-1">Dashboard</h1>
        <p className="text-gray-400">Platform overview and recent activity</p>
      </div>

      {stats && <StatsPanel stats={stats} />}

      {!connected && (
        <div className="bg-eco-900/20 border border-eco-700 rounded-xl p-6 text-center">
          <p className="text-eco-300 mb-3">Connect your Stellar wallet to submit waste and earn points.</p>
          <Link
            to="/submit"
            className="inline-block bg-eco-600 hover:bg-eco-500 text-white font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Recent Items</h2>
        <div className="space-y-3">
          {MOCK_ITEMS.map((item) => (
            <WasteCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
