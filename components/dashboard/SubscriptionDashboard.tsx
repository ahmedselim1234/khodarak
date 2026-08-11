"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetSubscriptionQuery, useResumeSubscriptionMutation } from "@/lib/store/dashboardApi";
import type { MappedProduct } from "@/lib/products/mapProductRow";
import type { Frequencies } from "@/lib/pricing/mapSettingsRow";
import { SubscriptionStatusCard } from "./SubscriptionStatusCard";
import { PendingChangeBanner } from "./PendingChangeBanner";
import { SubscriptionEditor } from "./SubscriptionEditor";
import { PauseDialog } from "./PauseDialog";
import { CancelDialog } from "./CancelDialog";

type DialogState = "closed" | "edit" | "pause" | "cancel";

// "use client" — the dashboard's one live-updating region (US1/US2/US3):
// fetches via useGetSubscriptionQuery so every mutation (edit, pause,
// resume, cancel) updates the status card, health badge, and pending-change
// banner in place, no page reload (SC-005). `subscriptionId: null` renders
// the first-time empty state (US1 Acceptance Scenario 4).
export function SubscriptionDashboard({
  subscriptionId,
  products,
  frequencies,
}: {
  subscriptionId: string | null;
  products: MappedProduct[];
  frequencies: Frequencies;
}) {
  const [dialog, setDialog] = useState<DialogState>("closed");
  const {
    data: subscription,
    isLoading,
    isError,
  } = useGetSubscriptionQuery(subscriptionId ?? "", {
    skip: !subscriptionId,
  });
  const [resumeSubscription, { isLoading: resuming }] = useResumeSubscriptionMutation();

  if (!subscriptionId) {
    return (
      <div className="bg-surface rounded-[20px] p-stack-lg shadow-sm border border-outline-variant/30 text-center flex flex-col gap-stack-sm items-center">
        <span className="material-symbols-outlined text-[40px] text-primary">
          shopping_basket
        </span>
        <p className="font-headline-md text-headline-md font-bold">لا يوجد اشتراك بعد</p>
        <p className="font-body-md text-body-md text-on-surface-variant">
          ابدأ اشتراكك الأول واستمتع بتوصيل الخضار والفواكه الطازجة بانتظام.
        </p>
        <Link
          href="/subscription"
          className="mt-2 px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:opacity-90 active:scale-95 transition-all"
        >
          ابدأ الاشتراك
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="font-body-md text-body-md text-error text-center py-stack-lg">
        تعذر تحميل بيانات الاشتراك. حاول تحديث الصفحة.
      </p>
    );
  }

  if (isLoading || !subscription) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant text-center py-stack-lg">
        جارٍ التحميل...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-stack-md">
      {subscription.pendingChange && (
        <PendingChangeBanner pendingChange={subscription.pendingChange} />
      )}

      <SubscriptionStatusCard
        subscription={subscription}
        onEdit={() => setDialog("edit")}
        onPause={() => setDialog("pause")}
        onResumeNow={() => resumeSubscription(subscriptionId)}
        onCancel={() => setDialog("cancel")}
      />

      {resuming && (
        <p className="font-label-sm text-label-sm text-on-surface-variant">جارٍ الاستئناف...</p>
      )}

      {dialog === "edit" && (
        <SubscriptionEditor
          subscriptionId={subscriptionId}
          products={products}
          frequencies={frequencies}
          initialItems={subscription.items}
          initialFrequency={subscription.frequency}
          initialAddressId={subscription.addressId}
          onClose={() => setDialog("closed")}
        />
      )}
      {dialog === "pause" && (
        <PauseDialog subscriptionId={subscriptionId} onClose={() => setDialog("closed")} />
      )}
      {dialog === "cancel" && (
        <CancelDialog subscriptionId={subscriptionId} onClose={() => setDialog("closed")} />
      )}
    </div>
  );
}
