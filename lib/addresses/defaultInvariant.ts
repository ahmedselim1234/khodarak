// Pure decision logic for the "exactly one default address per customer"
// invariant (data-model.md). Route Handlers call these to compute *which*
// rows to write, then perform the actual writes as a single transaction —
// the database-level partial unique index (supabase/migrations) is the
// backstop that holds even if these were ever bypassed.

export type AddressDefaultRow = { id: string; isDefault: boolean };

// FR-015: a customer's first-ever address is auto-defaulted.
export function shouldAutoDefault(existingAddressCount: number): boolean {
  return existingAddressCount === 0;
}

// FR-014: setting a new default atomically un-defaults the previous one.
// Returns only the rows whose isDefault flag actually needs to change.
export function resolveDefaultTransition(
  addresses: AddressDefaultRow[],
  targetId: string
): AddressDefaultRow[] {
  return addresses
    .filter((address) => address.isDefault !== (address.id === targetId))
    .map((address) => ({ id: address.id, isDefault: address.id === targetId }));
}

// data-model.md State Transitions: deleting the default address does not
// auto-promote another address — a customer can be left with zero defaults
// until they explicitly add or designate a new one.
export function resolveDefaultAfterDelete(
  remaining: AddressDefaultRow[]
): AddressDefaultRow[] {
  return remaining;
}
