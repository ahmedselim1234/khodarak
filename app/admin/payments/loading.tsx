import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";

export default function AdminPaymentsLoading() {
  return (
    <AdminShell activePath="/admin/payments">
      <AdminTableSkeleton />
    </AdminShell>
  );
}
