// Shared status/date/search filter form for admin list screens — extracted
// from the identical JSX previously duplicated in app/admin/orders/page.tsx,
// app/admin/payments/page.tsx, and app/admin/subscriptions/page.tsx (Phase
// 11, research.md §1/§6.2). A plain GET form, no client interactivity
// needed (Constitution Principle I). Every field carries a visually-hidden
// (`sr-only`) `<label>` — the accessibility gap the original three copies
// shared (research.md §6.2).
export type AdminFilterBarStatusOption = { value: string; label: string };
export type AdminFilterBarDateField = { name: string; label: string; defaultValue: string };

export function AdminFilterBar({
  statusOptions,
  statusValue,
  statusLabel = "الحالة",
  dateFields = [],
  searchValue,
  searchLabel = "بحث",
  searchPlaceholder = "بحث بالاسم أو البريد أو الجوال",
}: {
  statusOptions: AdminFilterBarStatusOption[];
  statusValue: string;
  statusLabel?: string;
  dateFields?: AdminFilterBarDateField[];
  searchValue: string;
  searchLabel?: string;
  searchPlaceholder?: string;
}) {
  return (
    <form method="get" className="flex flex-wrap gap-stack-sm items-end">
      <div className="flex flex-col gap-1">
        <label htmlFor="admin-filter-status" className="sr-only">
          {statusLabel}
        </label>
        <select
          id="admin-filter-status"
          name="status"
          defaultValue={statusValue}
          className="border border-outline-variant rounded-xl px-3 py-2"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {dateFields.map((field) => (
        <div key={field.name} className="flex flex-col gap-1">
          <label htmlFor={`admin-filter-${field.name}`} className="sr-only">
            {field.label}
          </label>
          <input
            id={`admin-filter-${field.name}`}
            type="date"
            name={field.name}
            defaultValue={field.defaultValue}
            className="border border-outline-variant rounded-xl px-3 py-2"
          />
        </div>
      ))}

      <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
        <label htmlFor="admin-filter-search" className="sr-only">
          {searchLabel}
        </label>
        <input
          id="admin-filter-search"
          type="text"
          name="search"
          defaultValue={searchValue}
          placeholder={searchPlaceholder}
          className="border border-outline-variant rounded-xl px-3 py-2 w-full"
        />
      </div>

      <button type="submit" className="px-4 py-2 rounded-full bg-primary text-on-primary font-bold">
        تصفية
      </button>
    </form>
  );
}
