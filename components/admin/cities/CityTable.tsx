"use client";

import { useState } from "react";
import type { AdminCity } from "@/lib/store/adminCitiesApi";
import { CityForm } from "./CityForm";

type FormState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; city: AdminCity };

// "use client" — list + inline add/edit (US5). Receives the server-fetched
// list as a prop; router.refresh() inside CityForm re-fetches it after a
// mutation, so no separate client-side query cache is needed here.
export function CityTable({ cities }: { cities: AdminCity[] }) {
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-outline-variant/30 font-label-sm text-label-sm text-on-surface-variant">
              <th className="py-3 px-2">المدينة</th>
              <th className="py-3 px-2">رسوم التوصيل</th>
              <th className="py-3 px-2">الحالة</th>
              <th className="py-3 px-2">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id} className="border-b border-outline-variant/10">
                <td className="py-3 px-2 font-body-md text-body-md">{city.nameAr}</td>
                <td className="py-3 px-2 font-body-md text-body-md">
                  {city.deliveryFeeOverride !== null
                    ? `${city.deliveryFeeOverride.toFixed(2)} ر.س`
                    : "—"}
                </td>
                <td className="py-3 px-2 font-label-sm text-label-sm">
                  <span className={city.isActive ? "text-primary" : "text-error"}>
                    {city.isActive ? "نشطة" : "غير نشطة"}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <button
                    type="button"
                    onClick={() => setFormState({ mode: "edit", city })}
                    className="font-label-sm text-label-sm text-primary hover:underline"
                  >
                    تعديل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formState.mode === "closed" && (
        <button
          type="button"
          onClick={() => setFormState({ mode: "create" })}
          className="self-start px-4 py-2 rounded-full bg-primary text-on-primary font-bold"
        >
          إضافة مدينة
        </button>
      )}

      {formState.mode === "create" && (
        <CityForm
          onSuccess={() => setFormState({ mode: "closed" })}
          onCancel={() => setFormState({ mode: "closed" })}
        />
      )}
      {formState.mode === "edit" && (
        <CityForm
          existingCity={formState.city}
          onSuccess={() => setFormState({ mode: "closed" })}
          onCancel={() => setFormState({ mode: "closed" })}
        />
      )}
    </div>
  );
}
