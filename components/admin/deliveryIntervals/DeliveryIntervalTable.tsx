"use client";

import { useMemo, useState } from "react";
import type { AdminDeliveryInterval } from "@/lib/store/adminDeliveryIntervalsApi";
import { Table, THead, TBody, TRow, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeliveryIntervalForm } from "./DeliveryIntervalForm";

type FormState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; interval: AdminDeliveryInterval };

function estimateDeliveriesPerMonth(days: number): number {
  return Math.round((30 / days) * 100) / 100;
}

// "use client" — list + inline add/edit (US1). Inactive rows stay visible
// (muted, not hidden) so an admin can see what's been deactivated and why a
// day count is currently unavailable to reuse (data-model.md).
export function DeliveryIntervalTable({ intervals }: { intervals: AdminDeliveryInterval[] }) {
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const [pending, setPending] = useState<Record<string, AdminDeliveryInterval>>({});

  const rows = useMemo(() => {
    const merged = intervals.map((interval) => pending[interval.id] ?? interval);
    const created = Object.values(pending).filter(
      (interval) => !intervals.some((existing) => existing.id === interval.id)
    );
    return [...merged, ...created].sort((a, b) => a.days - b.days);
  }, [intervals, pending]);

  function revert(id: string) {
    setPending((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-stack-md">
      <Table>
        <THead>
          <TRow>
            <TH>الفاصل الزمني</TH>
            <TH numeric>نسبة الخصم</TH>
            <TH numeric>≈ عدد التوصيلات شهرياً</TH>
            <TH>الحالة</TH>
            <TH>إجراءات</TH>
          </TRow>
        </THead>
        <TBody>
          {rows.map((interval) => (
            <TRow key={interval.id} interactive={interval.isActive}>
              <TD className={interval.isActive ? undefined : "opacity-50"}>
                كل {interval.days} يوم
              </TD>
              <TD numeric className={interval.isActive ? undefined : "opacity-50"}>
                {interval.discountPercent}٪
              </TD>
              <TD numeric className={interval.isActive ? undefined : "opacity-50"}>
                {estimateDeliveriesPerMonth(interval.days)}
              </TD>
              <TD>
                <Badge tone={interval.isActive ? "success" : "neutral"}>
                  {interval.isActive ? "نشط" : "غير نشط"}
                </Badge>
              </TD>
              <TD>
                <button
                  type="button"
                  onClick={() => setFormState({ mode: "edit", interval })}
                  className="text-caption font-semibold text-primary transition-opacity duration-fast hover:underline"
                >
                  تعديل
                </button>
              </TD>
            </TRow>
          ))}
        </TBody>
      </Table>

      {formState.mode === "closed" ? (
        <Button
          type="button"
          className="self-start"
          onClick={() => setFormState({ mode: "create" })}
        >
          إضافة فاصل زمني
        </Button>
      ) : (
        <DeliveryIntervalForm
          existingInterval={formState.mode === "edit" ? formState.interval : undefined}
          onOptimistic={(interval) => setPending((current) => ({ ...current, [interval.id]: interval }))}
          onRevert={revert}
          onSuccess={() => setFormState({ mode: "closed" })}
          onCancel={() => setFormState({ mode: "closed" })}
        />
      )}
    </div>
  );
}
