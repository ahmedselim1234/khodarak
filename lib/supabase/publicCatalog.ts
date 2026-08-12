import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env.server";

// Products are world-readable by policy (`products_select_all`,
// 20260810130000_products.sql), so catalog reads don't need the caller's
// session — and reading them through the cookie-bound client meant every
// storefront render paid for cookie parsing plus an uncacheable request.
//
// This client is anonymous and stateless, which lets each query opt into
// Next.js's Data Cache: the same catalog page served to a thousand visitors
// hits Supabase once per revalidation window instead of once per visitor.
// Anything user-specific (cart, subscriptions, addresses) must keep using
// lib/supabase/server.ts — RLS there depends on the session.
export function createCatalogClient(revalidateSeconds: number) {
  return createSupabaseClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, {
            ...init,
            next: { revalidate: revalidateSeconds, tags: ["catalog"] },
          } as RequestInit),
      },
    }
  );
}
