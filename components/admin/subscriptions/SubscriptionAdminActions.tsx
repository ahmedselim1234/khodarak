"use client";

import { useState } from "react";
import { AdminPauseDialog } from "./AdminPauseDialog";
import { AdminCancelDialog } from "./AdminCancelDialog";

type DialogState = "closed" | "pause" | "cancel";

// "use client" — the interactive slice of the admin subscription detail
// view: entry points into the pause/cancel dialogs, shown per the
// subscription's current status (mirroring Phase 6's own SubscriptionStatusCard).
export function SubscriptionAdminActions({
  subscriptionId,
  status,
}: {
  subscriptionId: string;
  status: string;
}) {
  const [dialog, setDialog] = useState<DialogState>("closed");

  return (
    <div className="flex flex-wrap gap-stack-sm">
      {status === "active" && (
        <button
          type="button"
          onClick={() => setDialog("pause")}
          className="px-4 py-2 rounded-full border-2 border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container-low transition-all active:scale-95"
        >
          إيقاف مؤقت (إداري)
        </button>
      )}
      {status !== "cancelled" && (
        <button
          type="button"
          onClick={() => setDialog("cancel")}
          className="px-4 py-2 rounded-full text-error font-bold hover:bg-error/10 transition-all active:scale-95"
        >
          إلغاء الاشتراك (إداري)
        </button>
      )}

      {dialog === "pause" && (
        <AdminPauseDialog subscriptionId={subscriptionId} onClose={() => setDialog("closed")} />
      )}
      {dialog === "cancel" && (
        <AdminCancelDialog subscriptionId={subscriptionId} onClose={() => setDialog("closed")} />
      )}
    </div>
  );
}
