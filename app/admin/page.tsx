import { AdminShell } from "@/components/admin/AdminShell";
import { CountersOverview } from "@/components/admin/counters/CountersOverview";

// /admin — replaces the Phase 0 placeholder (US3). Landing view: active
// subscriptions, orders today, revenue this month (FR-015).
export default function AdminPage() {
  return (
    <AdminShell activePath="/admin">
      <div className="flex flex-col gap-stack-lg">
        <h1 className="font-headline-md text-headline-md text-on-background font-bold">
          لوحة التحكم
        </h1>
        <CountersOverview />
      </div>
    </AdminShell>
  );
}
