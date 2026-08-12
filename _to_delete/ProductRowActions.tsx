"use client";

import { useRouter } from "next/navigation";
import {
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "@/lib/store/productsAdminApi";

export function ProductRowActions({
  id,
  isAvailable,
}: {
  id: string;
  isAvailable: boolean;
}) {
  const router = useRouter();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: toggling }] = useUpdateProductMutation();

  async function handleToggle() {
    await updateProduct({ id, body: { isAvailable: !isAvailable } }).unwrap();
    router.refresh();
  }

  async function handleDelete() {
    await deleteProduct(id).unwrap();
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={toggling}
        className="font-label-sm text-label-sm text-primary hover:underline disabled:opacity-50"
      >
        {isAvailable ? "إخفاء" : "إظهار"}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="font-label-sm text-label-sm text-error hover:underline disabled:opacity-50"
      >
        حذف
      </button>
    </div>
  );
}
