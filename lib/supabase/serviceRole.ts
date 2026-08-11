import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env.server";

/**
 * Service-role Supabase client — bypasses Row Level Security entirely.
 *
 * Import this ONLY to write subscriptions/subscription_items/payments/
 * payment_methods/orders/order_items/subscription_pauses — the tables
 * where a customer's own RLS-scoped session must never have a write path,
 * no matter how narrowly an owner-scoped policy might otherwise be
 * written. Every other server-side read/write in this codebase MUST
 * continue using lib/supabase/server.ts's RLS-scoped, cookie-authenticated
 * client. As of Phase 9, actual importers are: lib/payments/
 * processPaymentOutcome.ts, lib/payments/processRenewalOutcome.ts,
 * lib/subscription/mutateSubscription.ts, lib/subscription/reprice.ts, and
 * the Route Handlers that call straight into a service-role write for
 * their own table (app/api/subscriptions/route.ts,
 * app/api/cron/renewals/route.ts, app/api/payments/callback/route.ts,
 * app/api/webhooks/moyasar/route.ts) — check for new importers with
 * `grep -rl createServiceRoleClient app lib` rather than trusting this
 * list to stay exhaustive on its own.
 *
 * Why this exists: an owner-scoped RLS UPDATE/INSERT policy restricts
 * rows, not columns or values — Phase 1 hit this once directly
 * (20260810120300_profiles_role_immutable.sql, where "you can update your
 * own profile" quietly also meant "you can update your own role"), and
 * Phase 9's own audit found it again in `subscriptions`/
 * `subscription_items`'s original Phase 4 INSERT policies
 * (specs/010-phase-9-hardening-launch/AUDIT_FINDINGS.md F-002 — a
 * customer could insert a subscription with a self-chosen price and pay
 * that forged amount for real items). The webhook entry point additionally
 * has no user session at all, so an RLS-scoped client isn't even available
 * there.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(serverEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
