import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow } from "@/lib/products/mapProductRow";
import { ProductRowActions } from "./ProductRowActions";

const PRODUCT_SELECT =
  "id, name_ar, category, price, unit, image_url, is_available, min_qty, max_qty, sort_order, created_at";

const CATEGORY_LABEL: Record<string, string> = { vegetables: "خضروات", fruits: "فواكه" };

export async function ProductTable() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  const products = (data ?? []).map((row) => mapProductRow(row));

  if (products.length === 0) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant text-center py-stack-lg">
        لا توجد منتجات بعد — ابدأ بإضافة منتج جديد.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead>
          <tr className="border-b border-outline-variant/30 font-label-sm text-label-sm text-on-surface-variant">
            <th className="py-3 px-2">المنتج</th>
            <th className="py-3 px-2">الفئة</th>
            <th className="py-3 px-2">السعر</th>
            <th className="py-3 px-2">الحالة</th>
            <th className="py-3 px-2">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-outline-variant/10">
              <td className="py-3 px-2">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="flex items-center gap-3 hover:text-primary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin table thumbnail; next/image adds no value for a small fixed-size list thumbnail here. */}
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                  {product.nameAr}
                </Link>
              </td>
              <td className="py-3 px-2 font-body-md text-body-md">
                {CATEGORY_LABEL[product.category]}
              </td>
              <td className="py-3 px-2 font-body-md text-body-md">
                {product.price.toFixed(2)} ر.س
              </td>
              <td className="py-3 px-2 font-label-sm text-label-sm">
                <span className={product.isAvailable ? "text-primary" : "text-error"}>
                  {product.isAvailable ? "متوفر" : "غير متوفر"}
                </span>
              </td>
              <td className="py-3 px-2">
                <ProductRowActions id={product.id} isAvailable={product.isAvailable} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
