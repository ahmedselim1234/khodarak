"use client";

import { useRef, useState } from "react";
import { uploadProductImage, ProductImageUploadError } from "@/lib/supabase/storage";

export function ImageUploadField({
  imageUrl,
  onChange,
}: {
  imageUrl: string | null;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const url = await uploadProductImage(file);
      onChange(url);
    } catch (err) {
      // FR-005: reject with a specific error without discarding the rest of
      // the in-progress product form — this field's error is local, the
      // surrounding ProductForm state is untouched.
      setError(
        err instanceof ProductImageUploadError ? err.message : "تعذر رفع الصورة — الرجاء المحاولة مرة أخرى"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 text-right">
      <label className="font-label-sm text-label-sm font-bold text-on-surface-variant">
        صورة المنتج
      </label>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- admin-only upload preview of a freshly-uploaded, not-yet-optimized Storage URL; next/image's static-optimization pipeline adds no value here.
        <img
          src={imageUrl}
          alt=""
          className="w-32 h-32 object-cover rounded-2xl border border-outline-variant/30"
        />
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-50"
      >
        {uploading ? "جارٍ رفع الصورة..." : imageUrl ? "استبدال الصورة" : "رفع صورة"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}
    </div>
  );
}
