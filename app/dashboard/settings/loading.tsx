import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Skeleton } from "@/components/ui/Feedback";

export default function DashboardSettingsLoading() {
  return (
    <DashboardShell activePath="/dashboard/settings">
      <Skeleton className="mb-stack-lg h-9 w-40" />
      <div className="flex flex-col gap-stack-md">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </DashboardShell>
  );
}
