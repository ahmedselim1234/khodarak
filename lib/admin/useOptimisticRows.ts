"use client";

import { useMemo, useState } from "react";

// Shared "optimistic override on top of server-rendered rows" state —
// extracted from three independently reinvented implementations
// (ProductTableClient.tsx's `overrides`, OrderTable.tsx's `overrides`,
// CityTable.tsx's `pending`) that all solved the identical problem: show a
// just-submitted change immediately, revert it if the request fails,
// replace it with the canonical row once the server confirms
// (Phase 11, research.md §1.3). Handles both an in-place update (the
// optimistic row's `id` already exists in `rows`) and a brand-new row (the
// `id` doesn't exist yet, e.g. a not-yet-confirmed create) the same way.
export function useOptimisticRows<T extends { id: string }>(rows: T[]) {
  const [optimistic, setOptimisticState] = useState<Record<string, T>>({});

  const mergedRows = useMemo(() => {
    const merged = rows.map((row) => optimistic[row.id] ?? row);
    const created = Object.values(optimistic).filter(
      (row) => !rows.some((existing) => existing.id === row.id)
    );
    return [...merged, ...created];
  }, [rows, optimistic]);

  function setOptimistic(row: T) {
    setOptimisticState((current) => ({ ...current, [row.id]: row }));
  }

  function revert(id: string) {
    setOptimisticState((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  return { rows: mergedRows, setOptimistic, revert };
}
