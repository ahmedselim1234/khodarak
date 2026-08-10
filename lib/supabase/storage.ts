import { createClient } from "@/lib/supabase/client";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/validation/product";

const BUCKET = "product-images";

export class ProductImageUploadError extends Error {}

// Validates format/size client-side for fast feedback, then uploads directly
// to the product-images bucket (research.md §3) — the bucket's own RLS
// policy (supabase/migrations/..._product_images_bucket.sql), not this
// function, is what actually restricts writes to admins.
export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new ProductImageUploadError("صيغة الصورة غير مدعومة — الرجاء استخدام JPEG أو PNG أو WebP");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new ProductImageUploadError("حجم الصورة كبير جداً — الحد الأقصى 5 ميجابايت");
  }

  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new ProductImageUploadError("تعذر رفع الصورة — الرجاء المحاولة مرة أخرى");
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
