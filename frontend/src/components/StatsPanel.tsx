import type { PlatformStats } from '../api/contract';

interface Props {
  stats: PlatformStats;
}

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: string;
}

function StatBox({ label, value, icon }: StatBoxProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-eco-400">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export function StatsPanel({ stats }: Props) {
  const weightKg = (stats.total_weight_grams / 1000).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatBox label="Total Items" value={stats.total_items.toLocaleString()} icon="♻️" />
      <StatBox label="Weight Collected" value={`${weightKg} kg`} icon="⚖️" />
      <StatBox label="Points Issued" value={stats.total_points_issued.toLocaleString()} icon="🏆" />
      <StatBox label="Members" value={stats.total_members.toLocaleString()} icon="👥" />
    </div>
  );
}
