"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Shared client-side auth-state hook — used by QuantityStepper and CartBar
// to decide whether to read/write the guest cartSlice or the signed-in
// cartApi. `undefined` = still resolving (avoids a guest/signed-in flash).
export function useAuthUserId(): string | null | undefined {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return userId;
}
