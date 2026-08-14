"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBasket, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart/useCart";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Feedback";
import { formatPrice } from "@/lib/format";

const UNIT_LABEL: Record<string, string> = { kg: "كجم", piece: "حبة" };

function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
      <div className="flex flex-col gap-stack-sm lg:col-span-8">
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-[104px] w-full rounded-organic" />
        ))}
      </div>
      <div className="lg:col-span-4">
        <Skeleton className="h-64 w-full rounded-organic" />
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <Card className="flex flex-col items-center gap-stack-sm py-stack-2xl text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
        <ShoppingBasket className="size-7" aria-hidden="true" />
      </div>
      <h2 className="text-h2 text-on-surface">صندوقك فارغ</h2>
      <p className="max-w-sm text-small text-on-surface-variant">
        أضف بعض الخضروات والفواكه الطازجة وابدأ اشتراكك — تقدر تعدّل المحتويات
        قبل كل توصيلة.
      </p>
      <Link
        href="/browse"
        className="mt-stack-sm inline-flex h-11 items-center gap-2 rounded-organic bg-primary px-6 text-label-sm font-semibold text-on-primary transition-colors duration-fast hover:bg-primary-container hover:text-on-primary-container"
      >
        تصفّح المنتجات
        <ArrowLeft className="size-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}

export function CartView() {
  const { loading, signedIn, items, itemCount, subtotal, remove, clear } = useCart();

  if (loading) {
    return (
      <>
        <h1 className="mb-stack-lg text-display-lg-mobile text-on-background md:text-display-lg">
          صندوقي
        </h1>
        <CartSkeleton />
      </>
    );
  }

  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name, "ar"));
  const unavailable = sortedItems.filter((item) => !item.isAvailable);
  const checkoutHref = signedIn ? "/subscription" : "/login?redirect=/subscription";

  return (
    <>
      <div className="mb-stack-lg flex flex-wrap items-baseline justify-between gap-stack-sm">
        <h1 className="text-display-lg-mobile text-on-background md:text-display-lg">صندوقي</h1>
        {itemCount > 0 && (
          <p className="text-small text-on-surface-variant">
            <span className="tabular">{itemCount}</span> صنف في الصندوق
          </p>
        )}
      </div>

      {sortedItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 items-start gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-stack-sm lg:col-span-8">
            {sortedItems.map((item) => (
              <article
                key={item.productId}
                // Keyed on productId already, so a newly added line mounts
                // fresh and fades in rather than appearing instantly.
                className="flex animate-fade-in items-center gap-stack-md rounded-organic border border-outline-variant bg-surface p-4 transition-[border-color,box-shadow] duration-slow ease-out-expo hover:border-primary-container hover:shadow-md"
              >
                <Link
                  href={`/browse/${item.productId}`}
                  className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface-container-low"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/browse/${item.productId}`}
                    className="text-h3 text-on-surface transition-colors duration-fast hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-caption text-on-surface-variant">
                    <span className="tabular">{formatPrice(item.price)}</span> /{" "}
                    {UNIT_LABEL[item.unit] ?? item.unit}
                  </p>
                  {!item.isAvailable && (
                    <p className="mt-1 text-caption font-semibold text-error">
                      غير متوفر حالياً — سيُستبعد من الصندوق
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-h3 tabular text-on-surface">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <div className="flex items-center gap-1">
                    <QuantityStepper
                      product={{
                        id: item.productId,
                        nameAr: item.name,
                        price: item.price,
                        unit: item.unit,
                        imageUrl: item.imageUrl,
                        minQty: item.minQty,
                        maxQty: item.maxQty,
                        isAvailable: item.isAvailable,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      aria-label={`إزالة ${item.name} من الصندوق`}
                      className="rounded-md p-2 text-on-surface-variant transition-colors duration-fast hover:bg-error-container hover:text-on-error-container"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-stack-sm pt-stack-sm">
              <Link
                href="/browse"
                className="text-small font-semibold text-primary transition-opacity duration-fast hover:opacity-80"
              >
                ← إضافة المزيد من المنتجات
              </Link>
              <button
                type="button"
                onClick={clear}
                className="text-caption font-semibold text-on-surface-variant transition-colors duration-fast hover:text-error"
              >
                تفريغ الصندوق
              </button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:col-span-4">
            <Card variant="raised" className="flex flex-col gap-stack-sm">
              <h2 className="text-h3 text-on-surface">ملخص الصندوق</h2>

              <div className="flex items-center justify-between text-small">
                <span className="text-on-surface-variant">عدد الأصناف</span>
                <span className="tabular font-semibold text-on-surface">{itemCount}</span>
              </div>
              <div className="flex items-center justify-between text-small">
                <span className="text-on-surface-variant">قيمة المنتجات</span>
                <span className="tabular font-semibold text-on-surface">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="border-t border-outline-variant pt-stack-sm">
                <p className="text-caption leading-relaxed text-on-surface-variant">
                  رسوم التوصيل وضريبة القيمة المضافة تُحتسب في الخطوة التالية بعد
                  اختيار التكرار والمدينة.
                </p>
              </div>

              {unavailable.length > 0 && (
                <p className="rounded-lg bg-warning-container px-3 py-2 text-caption text-on-warning-container">
                  {unavailable.length} صنف غير متوفر حالياً ولن يُحتسب ضمن الاشتراك.
                </p>
              )}

              <Link
                href={checkoutHref}
                prefetch
                className="mt-stack-xs inline-flex h-[52px] items-center justify-center gap-2 rounded-organic bg-primary px-6 text-body-md font-semibold text-on-primary shadow-sm transition-[background-color,color,box-shadow] duration-fast hover:bg-primary-container hover:text-on-primary-container hover:shadow-md"
              >
                {signedIn ? "أكمل الاشتراك" : "سجّل الدخول لإكمال الاشتراك"}
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>

              {!signedIn && (
                <p className="text-caption text-on-surface-variant">
                  صندوقك محفوظ على جهازك وسينتقل تلقائياً إلى حسابك بعد تسجيل
                  الدخول.
                </p>
              )}
            </Card>
          </aside>
        </div>
      )}
    </>
  );
}
