// FR-012: clamp a requested quantity to [minQty, maxQty]. 0 (or anything
// <= 0) means "remove the item" and is returned as 0 rather than clamped up
// to minQty — the caller is responsible for deleting the cart row at 0.
export function clampQuantity(
  requestedQuantity: number,
  bounds: { minQty: number; maxQty: number }
): number {
  if (requestedQuantity <= 0) return 0;
  if (requestedQuantity < bounds.minQty) return bounds.minQty;
  if (requestedQuantity > bounds.maxQty) return bounds.maxQty;
  return requestedQuantity;
}
