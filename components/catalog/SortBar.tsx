"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "newest", label: "المضاف حديثاً" },
  { value: "price_asc", label: "السعر: من الأقل إلى الأعلى" },
  { value: "price_desc", label: "السعر: من الأعلى إلى الأقل" },
];

// FR-008: sort re-applies whatever filters are already active in the URL.
export function SortBar({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSort = searchParams.get("sort") ?? "newest";

  function handleChange(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row-reverse justify-between items-center mb-stack-lg gap-stack-md bg-surface p-stack-md rounded-[20px] shadow-sm">
      <div className="flex items-center gap-2">
        <span className="font-body-md text-body-md text-on-surface-variant">ترتيب حسب:</span>
        <select
          value={activeSort}
          onChange={(e) => handleChange(e.target.value)}
          className="bg-transparent border-none focus:ring-0 font-label-sm text-primary cursor-pointer"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="font-body-md text-body-md text-outline">
        <span className="font-bold text-primary">{totalCount}</span> منتج
      </div>
    </div>
  );
}
