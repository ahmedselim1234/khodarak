"use client";

import { useState } from "react";
import type { AdminCity } from "@/lib/store/adminCitiesApi";
import { useOptimisticRows } from "@/lib/admin/useOptimisticRows";
import { Table, THead, TBody, TRow, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { CityForm } from "./CityForm";

type FormState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; city: AdminCity };

// "use client" — list + inline add/edit (US5). Receives the server-fetched
// list as a prop; the shared useOptimisticRows hook holds rows the user has
// just submitted but the server hasn't confirmed, so a save lands in the
// table immediately and router.refresh() later replaces it with the
// canonical row.
export function CityTable({ cities }: { cities: AdminCity[] }) {
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });
  const { rows, setOptimistic, revert } = useOptimisticRows(cities);

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
                  aria-label={`تعديل مدينة ${city.nameAr}`}
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
          onOptimistic={setOptimistic}
          onRevert={revert}
          onSuccess={() => setFormState({ mode: "closed" })}
          onCancel={() => setFormState({ mode: "closed" })}
        />
      )}
    </div>
  );
}
