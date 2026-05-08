use soroban_sdk::{contracttype, Address, String, Vec};

/// Role of a platform member in the recycling supply chain.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Role {
    /// Collects recyclable materials from the public.
    Collector = 0,
    /// Processes and sorts collected materials.
    Processor = 1,
    /// Purchases processed materials for manufacturing.
    Buyer = 2,
}

impl Role {
    pub fn from_u32(v: u32) -> Option<Self> {
        match v {
            0 => Some(Role::Collector),
            1 => Some(Role::Processor),
            2 => Some(Role::Buyer),
            _ => None,
        }
    }
}

/// Category of recyclable material.
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum MaterialKind {
    Plastic = 0,
    Paper = 1,
    Metal = 2,
    Glass = 3,
    Organic = 4,
    Electronic = 5,
}

impl MaterialKind {
    /// Base reward points awarded per kilogram of this material.
    pub fn points_per_kg(&self) -> u64 {
        match self {
            MaterialKind::Plastic => 20,
            MaterialKind::Paper => 10,
            MaterialKind::Metal => 50,
            MaterialKind::Glass => 15,
            MaterialKind::Organic => 8,
            MaterialKind::Electronic => 80,
        }
    }

    pub fn from_u32(v: u32) -> Option<Self> {
        match v {
            0 => Some(MaterialKind::Plastic),
            1 => Some(MaterialKind::Paper),
            2 => Some(MaterialKind::Metal),
            3 => Some(MaterialKind::Glass),
            4 => Some(MaterialKind::Organic),
            5 => Some(MaterialKind::Electronic),
            _ => None,
        }
    }
}

/// A registered platform member.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Member {
    pub address: Address,
    pub role: Role,
    pub display_name: String,
    /// Accumulated reward points.
    pub points: u64,
    /// Number of items submitted by this member.
    pub items_submitted: u32,
    /// Ledger timestamp at registration.
    pub joined_at: u64,
    pub active: bool,
}

/// A submitted recyclable item tracked on-chain.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Item {
    pub id: u64,
    pub kind: MaterialKind,
    /// Weight in grams (minimum 100g).
    pub weight_grams: u64,
    pub owner: Address,
    pub submitted_at: u64,
    /// True once a Processor or admin has verified the item.
    pub verified: bool,
    /// True once the item has been handed off to another member.
    pub transferred: bool,
    /// Latitude in microdegrees (e.g. 52_520_000 = 52.52°N).
    pub location_lat: i64,
    /// Longitude in microdegrees.
    pub location_lon: i64,
}

/// A reward programme created by a Buyer to incentivise collection.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Reward {
    pub id: u64,
    pub sponsor: Address,
    pub kind: MaterialKind,
    /// Points offered per kilogram (overrides the default rate).
    pub points_per_kg: u64,
    /// Total points budget allocated.
    pub budget: u64,
    /// Points already paid out.
    pub spent: u64,
    pub active: bool,
    pub created_at: u64,
}

impl Reward {
    /// Remaining budget available for payouts.
    pub fn remaining(&self) -> u64 {
        self.budget.saturating_sub(self.spent)
    }
}

/// A single supply-chain handoff record.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HandoffRecord {
    pub item_id: u64,
    pub from: Address,
    pub to: Address,
    pub timestamp: u64,
    pub note: String,
}

/// Aggregate platform statistics.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PlatformStats {
    pub total_items: u64,
    pub total_weight_grams: u64,
    pub total_points_issued: u64,
    pub total_members: u32,
}
