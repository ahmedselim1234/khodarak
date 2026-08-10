// FR-010: a clear empty state for a tab/filter combination with no matches,
// instead of a blank or broken grid.
export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-stack-sm py-stack-lg text-center">
      <span className="material-symbols-outlined text-outline text-5xl" aria-hidden>
        search_off
      </span>
      <p className="font-headline-md text-headline-md text-on-surface font-bold">
        لا توجد منتجات مطابقة
      </p>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
        جرّب تغيير الفلاتر أو التبديل بين التبويبات لرؤية منتجات أخرى.
      </p>
    </div>
  );
}
