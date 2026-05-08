import { useCallback } from 'react';
import type { Item, Member, PlatformStats } from '../api/contract';
import { MaterialKind, Role } from '../api/contract';

/**
 * Hook providing typed access to the EcoChain Soroban contract.
 *
 * Currently returns mock data — replace the stub implementations with
 * real Soroban RPC calls using @stellar/stellar-sdk once the contract
 * is deployed.
 */
export function useContract() {
  const getStats = useCallback(async (): Promise<PlatformStats> => {
    // TODO: replace with real contract invocation
    return {
      total_items: 42,
      total_weight_grams: 185_400,
      total_points_issued: 9_270,
      total_members: 17,
    };
  }, []);

  const getMember = useCallback(async (address: string): Promise<Member | null> => {
    // TODO: replace with real contract invocation
    void address;
    return null;
  }, []);

  const submitItem = useCallback(
    async (
      owner: string,
      kind: MaterialKind,
      weightGrams: number,
      lat: number,
      lon: number,
    ): Promise<Item> => {
      // TODO: replace with real contract invocation
      return {
        id: Math.floor(Math.random() * 10000),
        kind,
        weight_grams: weightGrams,
        owner,
        submitted_at: Math.floor(Date.now() / 1000),
        verified: false,
        transferred: false,
        location_lat: lat,
        location_lon: lon,
      };
    },
    [],
  );

  const joinPlatform = useCallback(
    async (
      address: string,
      role: Role,
      name: string,
      lat: number,
      lon: number,
    ): Promise<Member> => {
      // TODO: replace with real contract invocation
      return {
        address,
        role,
        display_name: name,
        points: 0,
        items_submitted: 0,
        joined_at: Math.floor(Date.now() / 1000),
        active: true,
      };
    },
    [],
  );

  return { getStats, getMember, submitItem, joinPlatform };
}
