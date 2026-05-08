# EcoChain — Decentralised Recycling Platform

A decentralised recycling and waste-tracking platform built on the Stellar blockchain using Soroban smart contracts. EcoChain connects collectors, processors, and buyers in a transparent, incentive-driven supply chain.

## Project Structure

```
EcoChain/
├── contract/               # Soroban smart contract (Rust)
│   ├── src/
│   │   ├── lib.rs          # EcoChainContract — all public functions
│   │   ├── types.rs        # Role, MaterialKind, Member, Item, Reward, etc.
│   │   ├── errors.rs       # EcoError enum
│   │   └── events.rs       # Event emitters
│   └── Cargo.toml
├── frontend/               # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── api/contract.ts # Typed mirrors of on-chain types
│   │   ├── hooks/          # useWallet, useContract
│   │   ├── components/     # Navbar, WasteCard, StatsPanel
│   │   └── pages/          # Dashboard, Register, SubmitWaste, Incentives
│   └── package.json
├── Cargo.toml              # Workspace
└── README.md
```

## Features

- **Role-based membership** — Collector, Processor, Buyer
- **Waste item tracking** — submit, verify, and hand off recyclable items on-chain
- **Supply chain handoffs** — full transfer history per item
- **Points system** — points awarded per kg on verification, rates vary by material
- **Reward programmes** — Buyers create incentive budgets for specific material kinds
- **Platform statistics** — aggregate totals tracked on-chain
- **Freighter wallet integration** — connect via the Stellar Freighter browser extension

## Prerequisites

- Rust (stable) with `wasm32-unknown-unknown` target
- Soroban CLI
- Node.js 18+

## Installation

```bash
# Rust WASM target
rustup target add wasm32-unknown-unknown

# Soroban CLI
cargo install --locked soroban-cli --features opt

# Frontend dependencies
cd frontend && npm install
```

## Build

```bash
# Build contract
cargo build --release

# Build WASM
cd contract
cargo build --target wasm32-unknown-unknown --release

# Frontend dev server
cd frontend && npm run dev

# Frontend production build
cd frontend && npm run build
```

## Contract API

### Admin

| Function | Description |
|---|---|
| `init(admin)` | Initialise contract (once). |
| `get_admin()` | Return admin address. |

### Members

| Function | Description |
|---|---|
| `join(address, role, name, lat, lon)` | Register as a member. |
| `get_member(address)` | Retrieve member record. |

### Items

| Function | Description |
|---|---|
| `submit_item(owner, kind, weight_grams, lat, lon)` | Submit a recyclable item (min 100g). |
| `get_item(id)` | Retrieve item by ID. |
| `verify_item(verifier, item_id)` | Verify item and award points to owner. |
| `hand_off(from, to, item_id, note)` | Transfer item ownership. |
| `get_member_items(address)` | List all items owned by address. |
| `get_handoff_history(item_id)` | Full transfer history for an item. |

### Rewards

| Function | Description |
|---|---|
| `create_reward(sponsor, kind, points_per_kg, budget)` | Create a reward programme (Buyer only). |
| `get_rewards()` | List all active reward programmes. |

### Stats

| Function | Description |
|---|---|
| `get_stats()` | Return aggregate platform statistics. |

## Material Points (base rate)

| Material | Points / kg |
|---|---|
| Plastic | 20 |
| Paper | 10 |
| Metal | 50 |
| Glass | 15 |
| Organic | 8 |
| Electronic | 80 |

## Environment Variables

Copy `frontend/.env.example` to `frontend/.env`:

| Variable | Required | Description |
|---|---|---|
| `VITE_CONTRACT_ID` | ✅ | Deployed Soroban contract ID |
| `VITE_NETWORK` | ✅ | `TESTNET` or `MAINNET` |
| `VITE_RPC_URL` | ✅ | Soroban RPC endpoint |

## License

MIT
