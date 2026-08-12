"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Route-segment error boundary for every /admin/* page — catches a failed
// server-side data assembly (e.g. a Supabase query) without taking down
// the whole app to the generic root app/error.tsx (Phase 11, research.md §5).
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-stack-md px-margin-mobile text-center md:px-margin-desktop">
      <div className="flex size-14 items-center justify-center rounded-full bg-error-container text-on-error-container">
        <AlertCircle className="size-7" aria-hidden="true" />
      </div>
      <h1 className="text-display-lg-mobile text-on-background md:text-display-lg">
        تعذر تحميل هذه الصفحة
      </h1>
      <p className="max-w-md text-body-lg text-on-surface-variant">
        حدث خطأ أثناء تحميل بيانات لوحة التحكم. حاول مرة أخرى، وإذا استمرت المشكلة تواصل مع الدعم
        الفني.
      </p>
      <Button size="lg" onClick={() => reset()}>
        حاول مرة أخرى
      </Button>
    </main>
  );
}
