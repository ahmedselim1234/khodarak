import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-stack-md px-margin-mobile text-center md:px-margin-desktop">
      <span
        className="material-symbols-outlined text-primary text-6xl"
        aria-hidden
      >
        eco
      </span>
      <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-background md:font-display-lg md:text-display-lg">
        404
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
        الصفحة غير موجودة. ربما تم نقلها أو حذفها.
      </p>
      <Link
        href="/"
        className="bg-primary text-on-primary px-8 py-4 rounded-organic font-headline-md text-headline-md organic-shadow hover:scale-105 active:scale-95 transition-all"
      >
        العودة إلى الرئيسية
      </Link>
    </main>
  );
}
