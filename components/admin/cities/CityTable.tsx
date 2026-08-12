"use client";

import { useMemo, useState } from "react";
import type { AdminCity } from "@/lib/store/adminCitiesApi";
import { Table, THead, TBody, TRow, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { CityForm } from "./CityForm";

type FormState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; city: AdminCity };

// "use client" — list + inline add/edit (US5). Receives the server-fetched
// list as a prop; `pending` holds rows the user has just submitted but the
// server hasn't confirmed, so a save lands in the table immediately and
// router.refresh() later replaces it with the canonical row.
export function CityTable({ cities }: { cities: AdminCity[] }) {
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const [pending, setPending] = useState<Record<string, AdminCity>>({});

  const rows = useMemo(() => {
    const merged = cities.map((city) => pending[city.id] ?? city);
    const created = Object.values(pending).filter(
      (city) => !cities.some((existing) => existing.id === city.id)
    );
    return [...merged, ...created];
  }, [cities, pending]);

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
            <TH>المدينة</TH>
            <TH numeric>رسوم التوصيل</TH>
            <TH>الحالة</TH>
            <TH>إجراءات</TH>
          </TRow>
        </THead>
        <TBody>
          {rows.map((city) => (
            <TRow key={city.id} interactive>
              <TD>{city.nameAr}</TD>
              <TD numeric>
                {city.deliveryFeeOverride !== null ? formatPrice(city.deliveryFeeOverride) : "—"}
              </TD>
              <TD>
                <Badge tone={city.isActive ? "success" : "neutral"}>
                  {city.isActive ? "نشطة" : "غير نشطة"}
                </Badge>
              </TD>
              <TD>
                <button
                  type="button"
                  onClick={() => setFormState({ mode: "edit", city })}
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
          إضافة مدينة
        </Button>
      ) : (
        <CityForm
          existingCity={formState.mode === "edit" ? formState.city : undefined}
          onOptimistic={(city) => setPending((current) => ({ ...current, [city.id]: city }))}
          onRevert={revert}
          onSuccess={() => setFormState({ mode: "closed" })}
          onCancel={() => setFormState({ mode: "closed" })}
        />
      )}
    </div>
  );
}
