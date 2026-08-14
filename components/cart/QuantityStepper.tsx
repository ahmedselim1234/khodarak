"use client";

import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart/useCart";

export type StepperProduct = {
  id: string;
  nameAr: string;
  price: number;
  unit: string;
  imageUrl: string;
  minQty: number;
  maxQty: number;
  isAvailable: boolean;
};

const sizeClasses = {
  md: { add: "size-9", icon: "size-4", step: "size-7", count: "w-6 text-small" },
  lg: { add: "size-11", icon: "size-5", step: "size-9", count: "w-8 text-body-md" },
} as const;

// Used on the grid card, the detail page, and the /cart page (US2/US4).
// Every press is applied locally first — the guest cart is a synchronous
// reducer and the signed-in cart is an optimistic RTK Query patch — so the
// number changes in the same frame as the click, with no spinner and no
// disabled state while a request is in flight (FR-011/012).
export function QuantityStepper({
  product,
  size = "md",
}: {
  product: StepperProduct;
  size?: keyof typeof sizeClasses;
}) {
  const { quantityOf, setQuantity } = useCart();
  const quantity = quantityOf(product.id);
  const cls = sizeClasses[size];

  const line = {
    productId: product.id,
    name: product.nameAr,
    price: product.price,
    unit: product.unit,
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
    minQty: product.minQty,
    maxQty: product.maxQty,
  };

  // FR-018: can't newly add an unavailable product, but an existing
  // quantity may still be decreased.
  if (quantity === 0 && !product.isAvailable) {
    return <span className="text-caption font-semibold text-outline">غير متوفر</span>;
  }

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => setQuantity(line, product.minQty)}
        aria-label="أضف للصندوق"
        // Brightening rather than swapping to the container tier, matching the
        // Button primary variant: the old swap inverted light-on-dark to
        // dark-on-light mid-hover and read as the control going disabled.
        className={`flex ${cls.add} items-center justify-center rounded-full bg-primary text-on-primary shadow-sm transition-[background-color,box-shadow,filter,transform] duration-fast ease-out-quart hover:brightness-110 hover:shadow-glow-primary active:scale-90 motion-reduce:active:scale-100`}
      >
        <Plus className={cls.icon} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-low px-2 py-1">
      <button
        type="button"
        onClick={() => setQuantity(line, quantity - 1)}
        aria-label="إنقاص الكمية"
        className={`flex ${cls.step} items-center justify-center rounded-full text-primary transition-[background-color,transform] duration-fast ease-out-quart hover:bg-surface-container-high active:scale-90 motion-reduce:active:scale-100`}
      >
        <Minus className={cls.icon} aria-hidden="true" />
      </button>
      {/* The live region must NOT be the keyed node: remounting an aria-live
          element replaces the region itself, and screen readers announce
          changes *within* a stable region. So the outer span persists and only
          the inner one is keyed, which is what replays `animate-pop` (a CSS
          animation does not restart on re-render alone). */}
      <span
        className={`${cls.count} text-center font-bold tabular`}
        aria-live="polite"
      >
        <span key={quantity} className="inline-block animate-pop">
          {quantity}
        </span>
      </span>
      <button
        type="button"
        onClick={() => setQuantity(line, quantity + 1)}
        disabled={!product.isAvailable || quantity >= product.maxQty}
        aria-label="زيادة الكمية"
        className={`flex ${cls.step} items-center justify-center rounded-full text-primary transition-colors duration-fast hover:bg-surface-container-high disabled:opacity-40`}
      >
        <Plus className={cls.icon} aria-hidden="true" />
      </button>
    </div>
  );
}
