"use client";

import Script from "next/script";
import { useId, useState } from "react";
import { env } from "@/lib/env";

const MOYASAR_JS_SRC = "https://cdn.moyasar.com/mpf/1.15.0/moyasar.js";
const MOYASAR_CSS_SRC = "https://cdn.moyasar.com/mpf/1.15.0/moyasar.css";

// Moyasar's global, added to `window` by the script above once loaded.
type MoyasarGlobal = {
  init: (options: {
    element: string;
    amount: number;
    currency: string;
    description: string;
    publishable_api_key: string;
    save_only: boolean;
    callback_url: string;
    methods: string[];
    on_completed: (payment: { id: string; source?: { token?: string } }) => void;
    on_failure?: (error: unknown) => void;
  }) => void;
};

declare global {
  interface Window {
    Moyasar?: MoyasarGlobal;
  }
}

// "use client" leaf — mounts Moyasar's hosted tokenization form
// (research.md §5). Card number/expiry/CVV are entered directly into
// Moyasar's own iframe-backed fields and never pass through this
// component's own state or this app's server (FR-001) — the only value
// this component ever hands to its parent is the resulting token id.
//
// NOTE: loaded via next/script (Constitution Principle III — scoped to this
// one route, never the shared bundle). Verify the pinned script version and
// `init()` option names against Moyasar's current documentation before
// relying on this in a live environment; the shape here follows Moyasar's
// publicly documented `save_only` tokenization flow as of this phase's
// design (research.md §5, plan.md §3b).
export function CardTokenizationForm({
  onToken,
  onError,
}: {
  onToken: (token: string) => void;
  onError: (message: string) => void;
}) {
  const [scriptReady, setScriptReady] = useState(false);
  const elementId = useId().replace(/:/g, "");

  function initForm() {
    if (!window.Moyasar) return;

    window.Moyasar.init({
      element: `#${elementId}`,
      amount: 0,
      currency: "SAR",
      description: "حفظ بطاقة للاشتراك",
      publishable_api_key: env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY,
      save_only: true,
      callback_url: typeof window !== "undefined" ? window.location.href : "",
      methods: ["creditcard"],
      on_completed(payment) {
        const token = payment.source?.token;
        if (token) {
          onToken(token);
        } else {
          onError("تعذر حفظ البطاقة — الرجاء المحاولة مرة أخرى");
        }
      },
      on_failure() {
        onError("تعذر حفظ البطاقة — الرجاء التحقق من بيانات البطاقة والمحاولة مرة أخرى");
      },
    });
  }

  return (
    <div>
      <link rel="stylesheet" href={MOYASAR_CSS_SRC} />
      <Script
        src={MOYASAR_JS_SRC}
        strategy="lazyOnload"
        onReady={() => {
          setScriptReady(true);
          initForm();
        }}
      />
      <div id={elementId} className="mysr-form" />
      {!scriptReady && (
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          جارٍ تحميل نموذج الدفع...
        </p>
      )}
    </div>
  );
}
