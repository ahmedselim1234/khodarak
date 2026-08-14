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

  const activeIndex = TABS.findIndex((tab) => tab.value === activeCategory);

  return (
    <div className="relative flex border-b border-outline-variant" dir="rtl">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => handleSelect(tab.value)}
          aria-current={tab.value === activeCategory ? "page" : undefined}
          className={`flex-1 px-8 py-4 transition-colors duration-fast ease-out-quart ${
            tab.value === activeCategory
              ? "font-bold text-primary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}

      {/*
        A single indicator that slides between tabs, rather than a border that
        blinks from one button to the other.

        `inset-inline-start` is a LOGICAL property, so the offset is measured
        from the right-hand edge under this `dir="rtl"` — which is exactly what
        we want and why this is animated with inset rather than a transform.
        Tailwind has no logical-inset animation utility, hence the inline style.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary transition-[inset-inline-start] duration-slow ease-out-expo"
        style={{
          width: `${100 / TABS.length}%`,
          insetInlineStart: `${(100 / TABS.length) * Math.max(activeIndex, 0)}%`,
        }}
      />
    </div>
  );
}
