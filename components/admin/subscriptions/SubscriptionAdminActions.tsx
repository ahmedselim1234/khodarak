"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/Badge";
import { AdminPauseDialog } from "./AdminPauseDialog";
import { AdminCancelDialog } from "./AdminCancelDialog";

type DialogState = "closed" | "pause" | "cancel";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "بانتظار الدفع",
  active: "نشط",
  paused: "متوقف مؤقتاً",
  cancelled: "ملغي",
};

// "use client" — the interactive slice of the admin subscription detail
// view: entry points into the pause/cancel dialogs, shown per the
// subscription's current status (mirroring Phase 6's own SubscriptionStatusCard).
// The status shown here is overridden locally the moment a dialog succeeds, so
// the available actions update without waiting on router.refresh().
export function SubscriptionAdminActions({
  subscriptionId,
  status,
}: {
  subscriptionId: string;
  status: string;
}) {
  const [dialog, setDialog] = useState<DialogState>("closed");
  const [override, setOverride] = useState<string | null>(null);
  const effectiveStatus = override ?? status;

  return (
    <div className="flex flex-wrap items-center gap-stack-sm">
      <StatusPill
        status={effectiveStatus}
        label={STATUS_LABELS[effectiveStatus] ?? effectiveStatus}
      />

      {effectiveStatus === "active" && (
        <Button type="button" variant="outline" onClick={() => setDialog("pause")}>
          إيقاف مؤقت (إداري)
        </Button>
      )}
      {effectiveStatus !== "cancelled" && (
        <Button type="button" variant="ghost" onClick={() => setDialog("cancel")}>
          إلغاء الاشتراك (إداري)
        </Button>
      )}

      {dialog === "pause" && (
        <AdminPauseDialog
          subscriptionId={subscriptionId}
          onPaused={() => setOverride("paused")}
          onClose={() => setDialog("closed")}
        />
      )}
      {dialog === "cancel" && (
        <AdminCancelDialog
          subscriptionId={subscriptionId}
          onCancelled={() => setOverride("cancelled")}
          onClose={() => setDialog("closed")}
        />
      )}
    </div>
  );
}
