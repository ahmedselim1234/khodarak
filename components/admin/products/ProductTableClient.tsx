"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useListProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "@/lib/store/productsAdminApi";
import { Table, THead, TBody, TRow, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Feedback";
import { formatPrice } from "@/lib/format";

const CATEGORY_LABEL: Record<string, string> = { vegetables: "خضروات", fruits: "فواكه" };

// The list reads straight from the RTK Query cache. Every mutation (here and
// in ProductForm) patches that cache via onQueryStarted before the request
// resolves, so this table updates instantly with no local override layer.
export function ProductTableClient() {
  const { data: products, isLoading, isError } = useListProductsQuery();
  const [error, setError] = useState<string | null>(null);
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  async function handleToggle(id: string, next: boolean) {
    setError(null);
    try {
      await updateProduct({ id, body: { isAvailable: next } }).unwrap();
    } catch {
      setError("تعذر تحديث حالة المنتج — الرجاء المحاولة مرة أخرى.");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteProduct(id).unwrap();
    } catch {
      setError("تعذر حذف المنتج — الرجاء المحاولة مرة أخرى.");
    }
  }

  if (isLoading) {
    return (
      <p className="py-stack-lg text-center text-small text-on-surface-variant">
        جارٍ التحميل...
      </p>
    );
  }

  if (isError) {
    return <Alert tone="danger">تعذر تحميل المنتجات — الرجاء تحديث الصفحة.</Alert>;
  }

  const visible = products ?? [];

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
          {visible.map((product) => (
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
                <Badge tone={product.isAvailable ? "success" : "danger"}>
                  {product.isAvailable ? "متوفر" : "غير متوفر"}
                </Badge>
              </TD>
              <TD>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(product.id, !product.isAvailable)}
                    aria-label={`${product.isAvailable ? "إخفاء" : "إظهار"} — ${product.nameAr}`}
                    className="text-caption font-semibold text-primary transition-opacity duration-fast hover:underline"
                  >
                    {product.isAvailable ? "إخفاء" : "إظهار"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    aria-label={`حذف — ${product.nameAr}`}
                    className="text-caption font-semibold text-error transition-opacity duration-fast hover:underline"
                  >
                    حذف
                  </button>
                </div>
              </TD>
            </TRow>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
