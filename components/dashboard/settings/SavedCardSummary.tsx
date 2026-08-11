"use client";

import { useState } from "react";
import { ReplaceCardDialog } from "./ReplaceCardDialog";

export type SavedCard = { brand: string; lastFour: string } | null;

// Brand/last-four display + "replace" entry point (US5). A thin "use
// client" wrapper (rather than a pure Server Component) only so it can open
// ReplaceCardDialog — the display values themselves still come from the
// settings page's server-side fetch, passed down as a prop.
export function SavedCardSummary({ card }: { card: SavedCard }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-surface rounded-[20px] p-stack-md border border-outline-variant/30 flex items-center justify-between">
      <div>
        <p className="font-label-sm text-label-sm text-on-surface-variant">البطاقة المحفوظة</p>
        {card ? (
          <p className="font-bold">
            {card.brand} •••• {card.lastFour}
          </p>
        ) : (
          <p className="font-body-md text-body-md text-on-surface-variant">لا توجد بطاقة محفوظة</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all active:scale-95"
      >
        {card ? "استبدال البطاقة" : "إضافة بطاقة"}
      </button>

      {open && <ReplaceCardDialog onClose={() => setOpen(false)} />}
    </div>
  );
}
