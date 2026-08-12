import Link from "next/link";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-stack-md px-margin-mobile text-center md:px-margin-desktop">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
        <Leaf className="size-7" aria-hidden="true" />
      </div>
      <h1 className="text-display-lg-mobile text-on-background md:text-display-lg">
        404
      </h1>
      <p className="max-w-md text-body-lg text-on-surface-variant">
        الصفحة غير موجودة. ربما تم نقلها أو حذفها.
      </p>
      <Link
        href="/"
        className="inline-flex h-[52px] items-center rounded-organic bg-primary px-7 text-body-md font-semibold text-on-primary shadow-sm transition-[background-color,box-shadow] duration-fast ease-out-quart hover:bg-primary-container hover:text-on-primary-container hover:shadow-md"
      >
        العودة إلى الرئيسية
      </Link>
    </main>
  );
}
