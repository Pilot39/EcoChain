/** Mirrors the on-chain Role enum. */
export enum Role {
  Collector = 0,
  Processor = 1,
  Buyer = 2,
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.Collector]: 'Collector',
  [Role.Processor]: 'Processor',
  [Role.Buyer]: 'Buyer',
};

/** Mirrors the on-chain MaterialKind enum. */
export enum MaterialKind {
  Plastic = 0,
  Paper = 1,
  Metal = 2,
  Glass = 3,
  Organic = 4,
  Electronic = 5,
}

export const KIND_LABELS: Record<MaterialKind, string> = {
  [MaterialKind.Plastic]: 'Plastic',
  [MaterialKind.Paper]: 'Paper',
  [MaterialKind.Metal]: 'Metal',
  [MaterialKind.Glass]: 'Glass',
  [MaterialKind.Organic]: 'Organic',
  [MaterialKind.Electronic]: 'Electronic',
};

export const KIND_EMOJI: Record<MaterialKind, string> = {
  [MaterialKind.Plastic]: '🧴',
  [MaterialKind.Paper]: '📄',
  [MaterialKind.Metal]: '🔩',
  [MaterialKind.Glass]: '🍶',
  [MaterialKind.Organic]: '🌿',
  [MaterialKind.Electronic]: '💻',
};

/** Points awarded per kg for each material kind. */
export const KIND_POINTS: Record<MaterialKind, number> = {
  [MaterialKind.Plastic]: 20,
  [MaterialKind.Paper]: 10,
  [MaterialKind.Metal]: 50,
  [MaterialKind.Glass]: 15,
  [MaterialKind.Organic]: 8,
  [MaterialKind.Electronic]: 80,
};

export interface Member {
  address: string;
  role: Role;
  display_name: string;
  points: number;
  items_submitted: number;
  joined_at: number;
  active: boolean;
}

export interface Item {
  id: number;
  kind: MaterialKind;
  weight_grams: number;
  owner: string;
  submitted_at: number;
  verified: boolean;
  transferred: boolean;
  location_lat: number;
  location_lon: number;
}

export interface Reward {
  id: number;
  sponsor: string;
  kind: MaterialKind;
  points_per_kg: number;
  budget: number;
  spent: number;
  active: boolean;
  created_at: number;
}

export interface HandoffRecord {
  item_id: number;
  from: string;
  to: string;
  timestamp: number;
  note: string;
}

export interface PlatformStats {
  total_items: number;
  total_weight_grams: number;
  total_points_issued: number;
  total_members: number;
}
