import { SearchX } from "lucide-react";
import { EmptyState as UiEmptyState } from "@/components/ui/Feedback";

// FR-010: a clear empty state for a tab/filter combination with no matches,
// instead of a blank or broken grid.
export function EmptyState() {
  return (
    <UiEmptyState
      icon={<SearchX className="size-6" aria-hidden="true" />}
      title="لا توجد منتجات مطابقة"
      description="جرّب تغيير الفلاتر أو التبديل بين التبويبات لرؤية منتجات أخرى."
    />
  );
}
