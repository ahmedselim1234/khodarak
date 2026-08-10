"use client";

import type { ProductCategory } from "@/lib/products/mapProductRow";

const TABS: Array<{ value: ProductCategory; label: string }> = [
  { value: "vegetables", label: "خضروات" },
  { value: "fruits", label: "فواكه" },
];

// "use client" leaf — local (non-URL) category state over an already-fetched
// product list. Unlike /browse's searchParams-driven CategoryTabs, this page
// is a single continuous wizard, not URL-driven (research.md, plan.md).
export function BoxCategoryTabs({
  activeCategory,
  onChange,
}: {
  activeCategory: ProductCategory;
  onChange: (category: ProductCategory) => void;
}) {
  return (
    <div className="flex border-b border-outline-variant" dir="rtl">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={
            tab.value === activeCategory
              ? "px-8 py-4 font-bold border-b-2 border-primary text-primary transition-all"
              : "px-8 py-4 font-body-md text-on-surface-variant transition-all hover:text-primary"
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
