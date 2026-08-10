import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env.server";

/**
 * Service-role Supabase client — bypasses Row Level Security entirely.
 *
 * Import this ONLY from lib/payments/processPaymentOutcome.ts. Every other
 * server-side read/write in this codebase MUST continue using
 * lib/supabase/server.ts's RLS-scoped, cookie-authenticated client.
 *
 * Why this exists: subscription activation, saved payment methods, payment
 * records, and generated orders must never be writable through a customer's
 * own session — an owner-scoped RLS UPDATE policy restricts rows, not
 * columns, and Phase 1 already hit exactly this shape of bug once
 * (20260810120300_profiles_role_immutable.sql, where "you can update your
 * own profile" quietly also meant "you can update your own role"). The
 * webhook entry point has no user session at all, so an RLS-scoped client
 * isn't even available there — the service-role client is what makes
 * lib/payments/processPaymentOutcome.ts's activation logic identical
 * regardless of whether the callback or the webhook calls it
 * (specs/006-phase-5-moyasar-payment/research.md §1).
 */
export function createServiceRoleClient() {
  return createSupabaseClient(serverEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
