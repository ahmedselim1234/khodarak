"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "@/lib/store/productsAdminApi";
import { Table, THead, TBody, TRow, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Feedback";
import { formatPrice } from "@/lib/format";

export type AdminProductRow = {
  id: string;
  nameAr: string;
  category: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
};

const CATEGORY_LABEL: Record<string, string> = { vegetables: "خضروات", fruits: "فواكه" };

type Override = { isAvailable?: boolean; removed?: boolean };

// The admin product list used to re-render only after `router.refresh()`
// round-tripped to the server, so hiding or deleting a product sat visibly
// dead for a beat. The rows are server-rendered as before; this component
// just holds a thin override layer on top of them so a click paints
// immediately and reverts if the request fails.
export function ProductTableClient({ products }: { products: AdminProductRow[] }) {
  const router = useRouter();
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [error, setError] = useState<string | null>(null);
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  function patch(id: string, value: Override) {
    setOverrides((current) => ({ ...current, [id]: { ...current[id], ...value } }));
  }

  async function handleToggle(id: string, next: boolean) {
    setError(null);
    patch(id, { isAvailable: next });
    try {
      await updateProduct({ id, body: { isAvailable: next } }).unwrap();
      router.refresh();
    } catch {
      patch(id, { isAvailable: !next });
      setError("تعذر تحديث حالة المنتج — الرجاء المحاولة مرة أخرى.");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    patch(id, { removed: true });
    try {
      await deleteProduct(id).unwrap();
      router.refresh();
    } catch {
      patch(id, { removed: false });
      setError("تعذر حذف المنتج — الرجاء المحاولة مرة أخرى.");
    }
  }

  const visible = products.filter((product) => !overrides[product.id]?.removed);

  if (visible.length === 0) {
    return (
      <p className="py-stack-lg text-center text-small text-on-surface-variant">
        لا توجد منتجات بعد — ابدأ بإضافة منتج جديد.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-stack-sm">
      {error && <Alert tone="danger">{error}</Alert>}

      <Table>
        <THead>
          <TRow>
            <TH>المنتج</TH>
            <TH>الفئة</TH>
            <TH numeric>السعر</TH>
            <TH>الحالة</TH>
            <TH>إجراءات</TH>
          </TRow>
        </THead>
        <TBody>
          {visible.map((product) => {
            const isAvailable = overrides[product.id]?.isAvailable ?? product.isAvailable;
            return (
              <TRow key={product.id} interactive>
                <TD>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex items-center gap-3 transition-colors duration-fast hover:text-primary"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin table thumbnail; next/image adds no value for a small fixed-size list thumbnail here. */}
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="size-10 rounded-lg object-cover"
                      loading="lazy"
                    />
                    {product.nameAr}
                  </Link>
                </TD>
                <TD>{CATEGORY_LABEL[product.category] ?? product.category}</TD>
                <TD numeric>{formatPrice(product.price)}</TD>
                <TD>
                  <Badge tone={isAvailable ? "success" : "danger"}>
                    {isAvailable ? "متوفر" : "غير متوفر"}
                  </Badge>
                </TD>
                <TD>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(product.id, !isAvailable)}
                      className="text-caption font-semibold text-primary transition-opacity duration-fast hover:underline"
                    >
                      {isAvailable ? "إخفاء" : "إظهار"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className="text-caption font-semibold text-error transition-opacity duration-fast hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                </TD>
              </TRow>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}
