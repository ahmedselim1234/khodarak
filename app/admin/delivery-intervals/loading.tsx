import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";

export default function AdminDeliveryIntervalsLoading() {
  return (
    <AdminShell activePath="/admin/delivery-intervals">
      <AdminTableSkeleton rows={4} />
    </AdminShell>
  );
}
