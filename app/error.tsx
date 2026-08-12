"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-stack-md px-margin-mobile text-center md:px-margin-desktop">
      <div className="flex size-14 items-center justify-center rounded-full bg-error-container text-on-error-container">
        <AlertCircle className="size-7" aria-hidden="true" />
      </div>
      <h1 className="text-display-lg-mobile text-on-background md:text-display-lg">
        حدث خطأ غير متوقع
      </h1>
      <p className="max-w-md text-body-lg text-on-surface-variant">
        نعتذر عن الإزعاج. حاول مرة أخرى، وإذا استمرت المشكلة تواصل معنا.
      </p>
      <Button size="lg" onClick={() => reset()}>
        حاول مرة أخرى
      </Button>
    </main>
  );
}
