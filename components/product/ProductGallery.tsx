import Image from "next/image";

// Server Component — main image per design/product-details.html. A single
// stored photo per product this phase (data-model.md), so no thumbnail
// strip — the gallery is one large, prioritized image.
export function ProductGallery({ imageUrl, nameAr }: { imageUrl: string; nameAr: string }) {
  return (
    <div className="rounded-[40px] overflow-hidden product-card-shadow aspect-square bg-surface-container-low relative">
      <Image
        src={imageUrl}
        alt={nameAr}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
