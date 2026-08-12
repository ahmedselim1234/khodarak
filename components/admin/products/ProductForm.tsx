"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { productCreateSchema } from "@/lib/validation/product";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  type AdminProduct,
} from "@/lib/store/productsAdminApi";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "./ImageUploadField";

const CATEGORY_OPTIONS: Array<{ value: "vegetables" | "fruits"; label: string }> = [
  { value: "vegetables", label: "خضروات" },
  { value: "fruits", label: "فواكه" },
];

const UNIT_OPTIONS: Array<{ value: "kg" | "piece"; label: string }> = [
  { value: "kg", label: "كجم" },
  { value: "piece", label: "حبة" },
];

export function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const [nameAr, setNameAr] = useState(product?.nameAr ?? "");
  const [category, setCategory] = useState<"vegetables" | "fruits">(
    product?.category ?? "vegetables"
  );
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [unit, setUnit] = useState<"kg" | "piece">(product?.unit ?? "kg");
  const [imageUrl, setImageUrl] = useState<string | null>(product?.imageUrl ?? null);
  const [minQty, setMinQty] = useState(product ? String(product.minQty) : "1");
  const [maxQty, setMaxQty] = useState(product ? String(product.maxQty) : "10");
  const [sortOrder, setSortOrder] = useState(product ? String(product.sortOrder) : "0");
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submitting = creating || updating;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    // FR-001: the system MUST NOT allow saving a new product without a photo.
    if (!imageUrl) {
      setFieldErrors({ imageUrl: "الصورة مطلوبة" });
      return;
    }

    const payload = {
      nameAr,
      category,
      price: Number(price),
      unit,
      imageUrl,
      minQty: Number(minQty),
      maxQty: Number(maxQty),
      sortOrder: Number(sortOrder),
    };

    const result = productCreateSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        errors[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    try {
      if (product) {
        await updateProduct({
          id: product.id,
          body: { ...result.data, isAvailable },
        }).unwrap();
      } else {
        await createProduct(result.data).unwrap();
      }
      router.push("/admin/products");
    } catch {
      setFormError("تعذر حفظ المنتج — الرجاء المحاولة مرة أخرى");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md w-full" noValidate>
      <FormField
        label="اسم المنتج"
        value={nameAr}
        onChange={(e) => setNameAr(e.target.value)}
        error={fieldErrors.nameAr}
      />

      <div className="flex flex-col gap-2 text-right">
        <label className="font-label-sm text-label-sm font-bold text-on-surface-variant">
          الفئة
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as "vegetables" | "fruits")}
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <FormField
        label="السعر (ر.س)"
        type="number"
        step="0.01"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        error={fieldErrors.price}
      />

      <div className="flex flex-col gap-2 text-right">
        <label className="font-label-sm text-label-sm font-bold text-on-surface-variant">
          الوحدة
        </label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as "kg" | "piece")}
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3"
        >
          {UNIT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-stack-md">
        <FormField
          label="الحد الأدنى للكمية"
          type="number"
          min="1"
          value={minQty}
          onChange={(e) => setMinQty(e.target.value)}
          error={fieldErrors.minQty}
        />
        <FormField
          label="الحد الأقصى للكمية"
          type="number"
          min="1"
          value={maxQty}
          onChange={(e) => setMaxQty(e.target.value)}
          error={fieldErrors.maxQty}
        />
      </div>

      <FormField
        label="ترتيب العرض"
        type="number"
        min="0"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        error={fieldErrors.sortOrder}
      />

      <ImageUploadField imageUrl={imageUrl} onChange={setImageUrl} />
      {fieldErrors.imageUrl && (
        <p className="font-label-sm text-label-sm text-error">{fieldErrors.imageUrl}</p>
      )}

      {product && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
          />
          <span className="font-body-md text-body-md">متوفر</span>
        </label>
      )}

      {formError && (
        <p className="font-label-sm text-label-sm text-error text-right">{formError}</p>
      )}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "جارٍ الحفظ..." : product ? "حفظ التغييرات" : "إضافة المنتج"}
      </Button>
    </form>
  );
}
