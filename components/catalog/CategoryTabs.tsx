"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TABS: Array<{ value: "vegetables" | "fruits"; label: string }> = [
  { value: "vegetables", label: "خضروات" },
  { value: "fruits", label: "فواكه" },
];

// FR-006 / Clarifications 2026-08-10: primary way to switch category.
// Preserves the other active searchParams and resets `page` to 1 (Acceptance
// Scenario 2) when switching tabs.
export function CategoryTabs({ activeCategory }: { activeCategory: "vegetables" | "fruits" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", category);
    params.delete("page");
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <div className="flex border-b border-outline-variant" dir="rtl">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => handleSelect(tab.value)}
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
