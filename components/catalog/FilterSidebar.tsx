"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

// FR-007: price range + "available only" filter, scoped to the active
// category tab. Applies on explicit submit (not per-keystroke), matching
// design/products.html's "تطبيق الفلاتر" button.
export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [availableOnly, setAvailableOnly] = useState(searchParams.get("available") === "1");

  function handleApply() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    if (availableOnly) params.set("available", "1");
    else params.delete("available");
    params.delete("page");
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <aside className="w-full md:w-72 flex-shrink-0">
      <div className="sticky top-20 rounded-organic border border-outline-variant bg-surface p-stack-md">
        <div className="flex items-center justify-between mb-stack-md">
          <h2 className="text-h3 text-on-surface">تصفية النتائج</h2>
          <SlidersHorizontal className="size-4 text-on-surface-variant" aria-hidden="true" />
        </div>

        <div className="mb-stack-lg">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-stack-sm">
            نطاق السعر (ر.س)
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              placeholder="من"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 bg-surface-container-low border border-outline-variant/30 rounded-xl p-2"
            />
            <input
              type="number"
              min="0"
              placeholder="إلى"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 bg-surface-container-low border border-outline-variant/30 rounded-xl p-2"
            />
          </div>
        </div>

        <div className="mb-stack-lg">
          <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-stack-sm">
            التوفر
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span className="font-body-md text-body-md">متوفر فقط</span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="w-full py-3 bg-primary text-on-primary rounded-full font-label-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          تطبيق الفلاتر
        </button>
      </div>
    </aside>
  );
}
