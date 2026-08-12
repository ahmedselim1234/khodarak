import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Feedback";

// Shared loading-state skeleton for every /admin/* list screen — avoids
// redeclaring the same row-skeleton markup in eight separate loading.tsx
// files (Phase 11, research.md §5).
export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-stack-md">
      <Skeleton className="h-8 w-48" />
      <Card>
        <div className="flex flex-col gap-2">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
