"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-stack-md px-margin-mobile text-center md:px-margin-desktop">
      <span
        className="material-symbols-outlined text-error text-6xl"
        aria-hidden
      >
        error
      </span>
      <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-background md:font-display-lg md:text-display-lg">
        حدث خطأ غير متوقع
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
        نعتذر عن الإزعاج. حاول مرة أخرى، وإذا استمرت المشكلة تواصل معنا.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="bg-primary text-on-primary px-8 py-4 rounded-organic font-headline-md text-headline-md organic-shadow hover:scale-105 active:scale-95 transition-all"
      >
        حاول مرة أخرى
      </button>
    </main>
  );
}
