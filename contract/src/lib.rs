//! # EcoChain Contract
//!
//! A Soroban smart contract for decentralised recycling tracking on Stellar.
//!
//! ## Roles
//! - **Collector** — submits recyclable items.
//! - **Processor** — verifies items and moves them along the supply chain.
//! - **Buyer** — creates reward programmes and purchases processed materials.
//!
//! ## Lifecycle
//! 1. Admin calls [`init`] once after deployment.
//! 2. Participants call [`join`] to register.
//! 3. Collectors call [`submit_item`] to log recyclable material.
//! 4. Processors call [`verify_item`] — this awards points to the submitter.
//! 5. Verified items can be handed off via [`hand_off`].
//! 6. Buyers call [`create_reward`] to fund incentive programmes.

#![no_std]

mod errors;
mod events;
mod types;

pub use errors::EcoError;
pub use types::{
    HandoffRecord, Item, MaterialKind, Member, PlatformStats, Reward, Role,
};

use soroban_sdk::{
    contract, contractimpl, symbol_short, Address, Env, String, Symbol, Vec,
};

// ── Storage keys ──────────────────────────────────────────────────────────────

const ADMIN: Symbol = symbol_short!("ADMIN");
const ITEM_CTR: Symbol = symbol_short!("ITEM_CTR");
const REWARD_CTR: Symbol = symbol_short!("RWD_CTR");
const STATS: Symbol = symbol_short!("STATS");

// ── Helpers ───────────────────────────────────────────────────────────────────

fn load_stats(env: &Env) -> PlatformStats {
    env.storage()
        .instance()
        .get(&STATS)
        .unwrap_or(PlatformStats {
            total_items: 0,
            total_weight_grams: 0,
            total_points_issued: 0,
            total_members: 0,
        })
}

fn save_stats(env: &Env, stats: &PlatformStats) {
    env.storage().instance().set(&STATS, stats);
}

fn member_key(address: &Address) -> (Address,) {
    (address.clone(),)
}

fn item_key(id: u64) -> (Symbol, u64) {
    (symbol_short!("item"), id)
}

fn reward_key(id: u64) -> (Symbol, u64) {
    (symbol_short!("reward"), id)
}

fn history_key(item_id: u64) -> (Symbol, u64) {
    (symbol_short!("history"), item_id)
}

fn validate_coords(lat: i64, lon: i64) -> Result<(), EcoError> {
    if lat < -90_000_000 || lat > 90_000_000 {
        return Err(EcoError::InvalidCoordinates);
    }
    if lon < -180_000_000 || lon > 180_000_000 {
        return Err(EcoError::InvalidCoordinates);
    }
    Ok(())
}

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct EcoChainContract;

#[contractimpl]
impl EcoChainContract {
    /// Initialise the contract with an admin address.
    ///
    /// Must be called exactly once immediately after deployment.
    ///
    /// # Errors
    /// - [`EcoError::AdminAlreadySet`] if called more than once.
    pub fn init(env: Env, admin: Address) -> Result<(), EcoError> {
        admin.require_auth();
        if env.storage().instance().has(&ADMIN) {
            return Err(EcoError::AdminAlreadySet);
        }
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&ITEM_CTR, &0u64);
        env.storage().instance().set(&REWARD_CTR, &0u64);
        save_stats(&env, &PlatformStats {
            total_items: 0,
            total_weight_grams: 0,
            total_points_issued: 0,
            total_members: 0,
        });
        Ok(())
    }

    /// Return the admin address.
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&ADMIN)
    }

    /// Register a new member on the platform.
    ///
    /// # Arguments
    /// - `address` — Stellar address (must sign).
    /// - `role` — [`Role::Collector`], [`Role::Processor`], or [`Role::Buyer`].
    /// - `name` — Display name (Soroban `String`).
    /// - `lat` / `lon` — Location in microdegrees.
    ///
    /// # Errors
    /// - [`EcoError::AlreadyRegistered`] if the address is already a member.
    /// - [`EcoError::InvalidCoordinates`] if coordinates are out of range.
    pub fn join(
        env: Env,
        address: Address,
        role: Role,
        name: String,
        lat: i64,
        lon: i64,
    ) -> Result<Member, EcoError> {
        address.require_auth();
        validate_coords(lat, lon)?;

        let key = member_key(&address);
        if env.storage().instance().has(&key) {
            return Err(EcoError::AlreadyRegistered);
        }

        let member = Member {
            address: address.clone(),
            role,
            display_name: name,
            points: 0,
            items_submitted: 0,
            joined_at: env.ledger().timestamp(),
            active: true,
        };

        env.storage().instance().set(&key, &member);

        let mut stats = load_stats(&env);
        stats.total_members = stats.total_members.saturating_add(1);
        save_stats(&env, &stats);

        events::member_joined(&env, &address, role);
        Ok(member)
    }

    /// Retrieve a member record.
    ///
    /// Returns `None` if the address is not registered.
    pub fn get_member(env: Env, address: Address) -> Option<Member> {
        env.storage().instance().get(&member_key(&address))
    }

    /// Submit a recyclable item to the platform.
    ///
    /// # Arguments
    /// - `owner` — Registered member submitting the item (must sign).
    /// - `kind` — [`MaterialKind`] of the item.
    /// - `weight_grams` — Weight in grams (minimum 100g).
    /// - `lat` / `lon` — Collection location in microdegrees.
    ///
    /// # Errors
    /// - [`EcoError::NotRegistered`] if `owner` is not a member.
    /// - [`EcoError::InvalidWeight`] if `weight_grams < 100`.
    /// - [`EcoError::InvalidCoordinates`] if coordinates are out of range.
    pub fn submit_item(
        env: Env,
        owner: Address,
        kind: MaterialKind,
        weight_grams: u64,
        lat: i64,
        lon: i64,
    ) -> Result<Item, EcoError> {
        owner.require_auth();
        validate_coords(lat, lon)?;

        if weight_grams < 100 {
            return Err(EcoError::InvalidWeight);
        }

        let mkey = member_key(&owner);
        let mut member: Member = env
            .storage()
            .instance()
            .get(&mkey)
            .ok_or(EcoError::NotRegistered)?;

        // Increment item counter
        let id: u64 = env
            .storage()
            .instance()
            .get(&ITEM_CTR)
            .unwrap_or(0u64)
            .saturating_add(1);
        env.storage().instance().set(&ITEM_CTR, &id);

        let item = Item {
            id,
            kind,
            weight_grams,
            owner: owner.clone(),
            submitted_at: env.ledger().timestamp(),
            verified: false,
            transferred: false,
            location_lat: lat,
            location_lon: lon,
        };

        env.storage().instance().set(&item_key(id), &item);

        // Update member stats
        member.items_submitted = member.items_submitted.saturating_add(1);
        env.storage().instance().set(&mkey, &member);

        // Update platform stats
        let mut stats = load_stats(&env);
        stats.total_items = stats.total_items.saturating_add(1);
        stats.total_weight_grams = stats.total_weight_grams.saturating_add(weight_grams);
        save_stats(&env, &stats);

        events::item_submitted(&env, id, &owner, kind, weight_grams);
        Ok(item)
    }

    /// Retrieve an item by ID.
    pub fn get_item(env: Env, id: u64) -> Option<Item> {
        env.storage().instance().get(&item_key(id))
    }

    /// Verify an item, awarding points to its owner.
    ///
    /// Only a registered Processor or the admin may verify items.
    ///
    /// # Errors
    /// - [`EcoError::Unauthorized`] if `verifier` is not a Processor or admin.
    /// - [`EcoError::NotFound`] if the item does not exist.
    /// - [`EcoError::AlreadyVerified`] if the item is already verified.
    pub fn verify_item(env: Env, verifier: Address, item_id: u64) -> Result<(), EcoError> {
        verifier.require_auth();

        // Check verifier is admin or Processor
        let admin: Option<Address> = env.storage().instance().get(&ADMIN);
        let is_admin = admin.as_ref().map(|a| a == &verifier).unwrap_or(false);

        if !is_admin {
            let vmkey = member_key(&verifier);
            let vmember: Member = env
                .storage()
                .instance()
                .get(&vmkey)
                .ok_or(EcoError::Unauthorized)?;
            if vmember.role != Role::Processor {
                return Err(EcoError::Unauthorized);
            }
        }

        let ikey = item_key(item_id);
        let mut item: Item = env
            .storage()
            .instance()
            .get(&ikey)
            .ok_or(EcoError::NotFound)?;

        if item.verified {
            return Err(EcoError::AlreadyVerified);
        }

        item.verified = true;
        env.storage().instance().set(&ikey, &item);

        // Award points to owner
        let weight_kg = item.weight_grams / 1000;
        let pts = weight_kg.saturating_mul(item.kind.points_per_kg());

        if pts > 0 {
            let omkey = member_key(&item.owner);
            if let Some(mut owner_member) = env
                .storage()
                .instance()
                .get::<_, Member>(&omkey)
            {
                owner_member.points = owner_member.points.saturating_add(pts);
                env.storage().instance().set(&omkey, &owner_member);
            }

            let mut stats = load_stats(&env);
            stats.total_points_issued = stats.total_points_issued.saturating_add(pts);
            save_stats(&env, &stats);

            events::points_issued(&env, &item.owner, pts);
        }

        events::item_verified(&env, item_id, &verifier);
        Ok(())
    }

    /// Hand off a verified item to another registered member.
    ///
    /// # Errors
    /// - [`EcoError::NotRegistered`] if `from` or `to` is not a member.
    /// - [`EcoError::NotFound`] if the item does not exist.
    /// - [`EcoError::Unauthorized`] if `from` does not own the item.
    /// - [`EcoError::AlreadyTransferred`] if the item was already handed off.
    pub fn hand_off(
        env: Env,
        from: Address,
        to: Address,
        item_id: u64,
        note: String,
    ) -> Result<(), EcoError> {
        from.require_auth();

        // Both parties must be registered
        if env.storage().instance().get::<_, Member>(&member_key(&from)).is_none() {
            return Err(EcoError::NotRegistered);
        }
        if env.storage().instance().get::<_, Member>(&member_key(&to)).is_none() {
            return Err(EcoError::NotRegistered);
        }

        let ikey = item_key(item_id);
        let mut item: Item = env
            .storage()
            .instance()
            .get(&ikey)
            .ok_or(EcoError::NotFound)?;

        if item.owner != from {
            return Err(EcoError::Unauthorized);
        }
        if item.transferred {
            return Err(EcoError::AlreadyTransferred);
        }

        // Record handoff
        let record = HandoffRecord {
            item_id,
            from: from.clone(),
            to: to.clone(),
            timestamp: env.ledger().timestamp(),
            note,
        };

        let hkey = history_key(item_id);
        let mut history: Vec<HandoffRecord> = env
            .storage()
            .instance()
            .get(&hkey)
            .unwrap_or_else(|| Vec::new(&env));
        history.push_back(record);
        env.storage().instance().set(&hkey, &history);

        // Transfer ownership
        item.owner = to.clone();
        item.transferred = true;
        env.storage().instance().set(&ikey, &item);

        events::item_handed_off(&env, item_id, &from, &to);
        Ok(())
    }

    /// Create a reward programme (Buyer only).
    ///
    /// # Errors
    /// - [`EcoError::NotRegistered`] if `sponsor` is not a member.
    /// - [`EcoError::Unauthorized`] if `sponsor` is not a Buyer.
    pub fn create_reward(
        env: Env,
        sponsor: Address,
        kind: MaterialKind,
        points_per_kg: u64,
        budget: u64,
    ) -> Result<Reward, EcoError> {
        sponsor.require_auth();

        let smkey = member_key(&sponsor);
        let smember: Member = env
            .storage()
            .instance()
            .get(&smkey)
            .ok_or(EcoError::NotRegistered)?;

        if smember.role != Role::Buyer {
            return Err(EcoError::Unauthorized);
        }

        let id: u64 = env
            .storage()
            .instance()
            .get(&REWARD_CTR)
            .unwrap_or(0u64)
            .saturating_add(1);
        env.storage().instance().set(&REWARD_CTR, &id);

        let reward = Reward {
            id,
            sponsor: sponsor.clone(),
            kind,
            points_per_kg,
            budget,
            spent: 0,
            active: true,
            created_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&reward_key(id), &reward);
        events::reward_created(&env, id, &sponsor, kind);
        Ok(reward)
    }

    /// Return all active reward programmes.
    pub fn get_rewards(env: Env) -> Vec<Reward> {
        let count: u64 = env.storage().instance().get(&REWARD_CTR).unwrap_or(0);
        let mut out = Vec::new(&env);
        for i in 1..=count {
            if let Some(r) = env.storage().instance().get::<_, Reward>(&reward_key(i)) {
                if r.active {
                    out.push_back(r);
                }
            }
        }
        out
    }

    /// Return aggregate platform statistics.
    pub fn get_stats(env: Env) -> PlatformStats {
        load_stats(&env)
    }

    /// Return all items currently owned by `address`.
    pub fn get_member_items(env: Env, address: Address) -> Vec<Item> {
        let count: u64 = env.storage().instance().get(&ITEM_CTR).unwrap_or(0);
        let mut out = Vec::new(&env);
        for i in 1..=count {
            if let Some(item) = env.storage().instance().get::<_, Item>(&item_key(i)) {
                if item.owner == address {
                    out.push_back(item);
                }
            }
        }
        out
    }

    /// Return the full handoff history for an item.
    pub fn get_handoff_history(env: Env, item_id: u64) -> Vec<HandoffRecord> {
        env.storage()
            .instance()
            .get(&history_key(item_id))
            .unwrap_or_else(|| Vec::new(&env))
    }
}
