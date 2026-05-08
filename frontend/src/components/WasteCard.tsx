import type { Item } from '../api/contract';
import { KIND_EMOJI, KIND_LABELS } from '../api/contract';

interface Props {
  item: Item;
}

export function WasteCard({ item }: Props) {
  const shortOwner = `${item.owner.slice(0, 6)}…${item.owner.slice(-4)}`;
  const weightKg = (item.weight_grams / 1000).toFixed(2);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start gap-4 hover:border-eco-600 transition-colors">
      <div className="text-3xl">{KIND_EMOJI[item.kind]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-100">{KIND_LABELS[item.kind]}</span>
          {item.verified ? (
            <span className="text-xs bg-eco-900/50 text-eco-400 border border-eco-700 px-2 py-0.5 rounded-full">
              ✓ Verified
            </span>
          ) : (
            <span className="text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-700 px-2 py-0.5 rounded-full">
              Pending
            </span>
          )}
          {item.transferred && (
            <span className="text-xs bg-blue-900/30 text-blue-400 border border-blue-700 px-2 py-0.5 rounded-full">
              Transferred
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">
          <span className="text-gray-300 font-medium">{weightKg} kg</span>
          {' · '}
          <span className="font-mono text-xs">{shortOwner}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">ID #{item.id}</p>
      </div>
    </div>
  );
}
