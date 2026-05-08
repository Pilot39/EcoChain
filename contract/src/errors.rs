use soroban_sdk::contracterror;

/// All error codes for the EcoChain contract.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum EcoError {
    /// Address is already registered as a member.
    AlreadyRegistered = 1,
    /// Address is not a registered member.
    NotRegistered = 2,
    /// Requested record does not exist.
    NotFound = 3,
    /// Caller lacks permission for this action.
    Unauthorized = 4,
    /// Weight is below the 100g minimum.
    InvalidWeight = 5,
    /// Reward program has insufficient budget.
    InsufficientBudget = 6,
    /// Item has already been verified.
    AlreadyVerified = 7,
    /// Item has already been handed off.
    AlreadyTransferred = 8,
    /// Coordinates are out of valid range.
    InvalidCoordinates = 9,
    /// Admin has already been initialised.
    AdminAlreadySet = 10,
}
