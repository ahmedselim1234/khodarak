import { clampQuantity } from "./clampQuantity";

// FR-015: higher-quantity-wins merge, capped at maxQty. `existingQuantity`
// is undefined when the account had no prior row for this product.
export function mergeCartQuantities(
  existingQuantity: number | undefined,
  incomingQuantity: number,
  bounds: { minQty: number; maxQty: number }
): number {
  const higher = Math.max(existingQuantity ?? 0, incomingQuantity);
  return clampQuantity(higher, bounds);
}
