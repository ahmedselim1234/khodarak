import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";

export default function AdminCitiesLoading() {
  return (
    <AdminShell activePath="/admin/cities">
      <AdminTableSkeleton rows={4} />
    </AdminShell>
  );
}
