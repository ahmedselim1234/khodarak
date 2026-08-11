-- Phase 9 audit fix (specs/010-phase-9-hardening-launch/AUDIT_FINDINGS.md F-002):
-- subscriptions_insert_own / subscription_items_insert_own (Phase 4) let a
-- customer's own session insert a subscription with a self-chosen
-- price_breakdown, and items with a self-chosen quantity, directly via the
-- Supabase REST API — bypassing app/api/subscriptions/route.ts's own
-- server-side price computation entirely. Phase 5's own pay-initiate
-- contract charges from subscriptions.price_breakdown.totalPerDelivery
-- read directly from the row (never recomputed at charge time), so a
-- forged row could be paid for at a forged, arbitrarily low price and
-- still activate normally.
--
-- Closed the same way Phase 5/6/7 already closed this exact class of gap
-- for payments/orders/subscriptions.status: no authenticated-role INSERT
-- policy at all — creation goes through the service-role client from
-- app/api/subscriptions/route.ts instead, which already recomputes the
-- price server-side before writing (Constitution Principle II).

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
drop policy if exists "subscription_items_insert_own" on public.subscription_items;

-- Phase 9 audit fix (AUDIT_FINDINGS.md F-003): Phase 8 added
-- profiles/orders/subscriptions/payments/order_items/subscription_items
-- admin-select policies but missed addresses — app/admin/subscriptions/
-- [id]/page.tsx reads a customer's address as part of the admin
-- subscription detail view (FR-006) via the ordinary RLS-scoped client,
-- which silently returned nothing for any address that isn't the admin's
-- own.
create policy "addresses_select_admin"
  on public.addresses for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Phase 9 audit fix (AUDIT_FINDINGS.md F-004): subscription_pauses only
-- ever had an owner-scoped select policy (Phase 6) — no admin-select
-- policy was added when Phase 8 added six others, because
-- subscription_pauses predates Phase 8. This phase's own new
-- auto-suspension counter (CountersOverview.tsx, FR-012) would otherwise
-- always read 0 for any admin.
create policy "subscription_pauses_select_admin"
  on public.subscription_pauses for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
