// THE single SAR → halalas conversion point (FR-017). plan.md §3b names this
// exact bug class — "amount: 1000 is 10.00 SAR... this is the classic 100×
// production bug" — as the reason no other module may multiply by 100
// inline.
export function toHalalas(amountSar: number): number {
  if (amountSar <= 0) {
    throw new Error(`toHalalas: amount must be positive, got ${amountSar}`);
  }

  return Math.round(amountSar * 100);
}
