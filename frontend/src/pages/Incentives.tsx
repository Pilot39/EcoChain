import { MaterialKind, KIND_EMOJI, KIND_LABELS } from '../api/contract';
import type { Reward } from '../api/contract';

const MOCK_REWARDS: Reward[] = [
  { id: 1, sponsor: 'GABC1234567890ABCDEF', kind: MaterialKind.Plastic, points_per_kg: 20, budget: 10000, spent: 3200, active: true, created_at: 1700000000 },
  { id: 2, sponsor: 'GXYZ9876543210FEDCBA', kind: MaterialKind.Metal, points_per_kg: 50, budget: 5000, spent: 1500, active: true, created_at: 1700001000 },
  { id: 3, sponsor: 'GDEF1111222233334444', kind: MaterialKind.Electronic, points_per_kg: 80, budget: 2000, spent: 400, active: true, created_at: 1700002000 },
  { id: 4, sponsor: 'GHIJ5555666677778888', kind: MaterialKind.Paper, points_per_kg: 10, budget: 8000, spent: 6000, active: true, created_at: 1700003000 },
];

function RewardCard({ reward }: { reward: Reward }) {
  const remaining = reward.budget - reward.spent;
  const pct = Math.round((reward.spent / reward.budget) * 100);
  const shortSponsor = `${reward.sponsor.slice(0, 6)}…${reward.sponsor.slice(-4)}`;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-eco-600 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{KIND_EMOJI[reward.kind]}</span>
        <div>
          <h3 className="font-semibold text-gray-100">{KIND_LABELS[reward.kind]}</h3>
          <p className="text-xs text-gray-500 font-mono">{shortSponsor}</p>
        </div>
        <span className="ml-auto text-eco-400 font-bold text-lg">{reward.points_per_kg} pts/kg</span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Budget used</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-eco-500 h-2 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{reward.spent.toLocaleString()} spent</span>
          <span>{remaining.toLocaleString()} remaining</span>
        </div>
      </div>
    </div>
  );
}

export function Incentives() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-eco-400 mb-1">Incentive Programmes</h1>
        <p className="text-gray-400">Active reward programmes from verified buyers</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {MOCK_REWARDS.map((r) => (
          <RewardCard key={r.id} reward={r} />
        ))}
      </div>

      <div className="mt-8 bg-eco-900/20 border border-eco-700 rounded-xl p-5">
        <h2 className="font-semibold text-eco-300 mb-2">How points work</h2>
        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
          <li>Submit a recyclable item to earn base points per kg.</li>
          <li>A Processor must verify your item before points are awarded.</li>
          <li>Active reward programmes may offer bonus rates above the base.</li>
          <li>Points accumulate in your member profile on-chain.</li>
        </ul>
      </div>
    </div>
  );
}
