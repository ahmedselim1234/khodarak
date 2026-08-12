import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";

export default function AdminOrdersLoading() {
  return (
    <AdminShell activePath="/admin/orders">
      <AdminTableSkeleton />
    </AdminShell>
  );
}
