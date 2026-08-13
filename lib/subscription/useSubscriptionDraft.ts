"use client";

import { useEffect, useRef } from "react";
import type { DeliveryDateRules } from "@/lib/subscription/selectableDeliveryDates";
import {
  sanitizeSubscriptionDraft,
  SUBSCRIPTION_DRAFT_STORAGE_KEY,
  type SubscriptionDraft,
} from "@/lib/subscription/subscriptionDraft";

// Keeps the subscription wizard's in-progress order alive across a refresh,
// a browser-back, or a session-expiry redirect. The wizard's own state stays
// the source of truth — this only mirrors it to sessionStorage and pushes
// back whatever survived on mount.
export function useSubscriptionDraft(
  draft: SubscriptionDraft,
  restore: (draft: SubscriptionDraft) => void,
  rules: DeliveryDateRules
) {
  // Both are only ever read on mount, so the initial useRef value is already
  // the right one — never reassigned, and never touched during render.
  const restoreRef = useRef(restore);
  const rulesRef = useRef(rules);
  const hydratedRef = useRef(false);
  // Once the order is submitted the draft must not be rewritten on the way
  // out, or a completed order resurrects on the next visit.
  const clearedRef = useRef(false);

  const serialized = JSON.stringify(draft);

  // Read in an effect, never during render: the wizard is server-rendered
  // from a Server Component, so touching sessionStorage in a useState
  // initializer would produce a hydration mismatch.
  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      try {
        const raw = window.sessionStorage.getItem(SUBSCRIPTION_DRAFT_STORAGE_KEY);
        if (raw) {
          const restored = sanitizeSubscriptionDraft(JSON.parse(raw), new Date(), rulesRef.current);
          if (restored) {
            // Pushing a value in from an external store — the one legitimate
            // reason for an effect to write state. Returning here also keeps
            // the empty mount draft from overwriting what we just read.
            restoreRef.current(restored);
            return;
          }
        }
      } catch {
        // Malformed JSON or storage unavailable (private browsing, quota) —
        // start from a clean draft rather than failing the page.
      }
    }

    if (clearedRef.current) return;
    try {
      window.sessionStorage.setItem(SUBSCRIPTION_DRAFT_STORAGE_KEY, serialized);
    } catch {
      // Storage unavailable — the draft still works in-memory for this page
      // load, which is all the in-place address dialog needs.
    }
  }, [serialized]);

  function clearDraft() {
    clearedRef.current = true;
    try {
      window.sessionStorage.removeItem(SUBSCRIPTION_DRAFT_STORAGE_KEY);
    } catch {
      // Nothing to clean up if storage was never writable.
    }
  }

  return { clearDraft };
}
