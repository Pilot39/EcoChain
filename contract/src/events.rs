use soroban_sdk::{symbol_short, Address, Env};
use crate::types::{MaterialKind, Role};

pub fn member_joined(env: &Env, address: &Address, role: Role) {
    env.events().publish(
        (symbol_short!("eco"), symbol_short!("joined")),
        (address.clone(), role as u32),
    );
}

pub fn item_submitted(env: &Env, item_id: u64, owner: &Address, kind: MaterialKind, weight: u64) {
    env.events().publish(
        (symbol_short!("eco"), symbol_short!("submit")),
        (item_id, owner.clone(), kind as u32, weight),
    );
}

pub fn item_verified(env: &Env, item_id: u64, verifier: &Address) {
    env.events().publish(
        (symbol_short!("eco"), symbol_short!("verify")),
        (item_id, verifier.clone()),
    );
}

pub fn item_handed_off(env: &Env, item_id: u64, from: &Address, to: &Address) {
    env.events().publish(
        (symbol_short!("eco"), symbol_short!("handoff")),
        (item_id, from.clone(), to.clone()),
    );
}

pub fn reward_created(env: &Env, reward_id: u64, sponsor: &Address, kind: MaterialKind) {
    env.events().publish(
        (symbol_short!("eco"), symbol_short!("reward")),
        (reward_id, sponsor.clone(), kind as u32),
    );
}

pub fn points_issued(env: &Env, recipient: &Address, amount: u64) {
    env.events().publish(
        (symbol_short!("eco"), symbol_short!("points")),
        (recipient.clone(), amount),
    );
}
