-- Phase 8 (Admin Operations): profiles.email (+ backfill), attribution
-- columns on orders/subscriptions/subscription_pauses, and admin-role RLS
-- policies across orders/subscriptions/payments/order_items/
-- subscription_items/profiles/cities.
-- See specs/009-phase-8-admin-operations/data-model.md and research.md.
--
-- Every write policy added here follows Phase 2's established pattern (an
-- inline `profiles.role = 'admin'` check), not Phase 5/6/7's service-role-
-- only pattern — research.md §1 explains why that pattern, built to stop a
-- CUSTOMER's own session from self-escalating, doesn't apply to a
-- trusted, already role-gated admin write. The one deliberate exception:
-- subscriptions itself gets NO new update policy — admin pause/cancel goes
-- through the existing service-role lib/subscription/mutateSubscription.ts
-- functions instead (research.md §2), reusing already-correct logic rather
-- than duplicating it behind a second write path.

-- profiles.email ---------------------------------------------------------

alter table public.profiles
  add column if not exists email text;

update public.profiles
set email = auth.users.email
from auth.users
where profiles.id = auth.users.id
  and profiles.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'customer',
    new.email
  );
  return new;
end;
$$;

-- Admin-only read of every customer's profile (search/display across the
-- orders/subscriptions/payments lists — data-model.md).
create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p2
      where p2.id = auth.uid() and p2.role = 'admin'
    )
  );

-- orders -------------------------------------------------------------------

alter table public.orders
  add column if not exists status_updated_by uuid references public.profiles (id),
  add column if not exists status_updated_at timestamptz;

create policy "orders_select_admin"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- The first authenticated-role write policy orders has ever had (Phase 5
-- deliberately granted none — every write was service-role-only until an
-- admin action existed to gate). An admin status transition is exactly the
-- trusted, role-gated write Phase 2's pattern is for.
create policy "orders_update_admin"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "order_items_select_admin"
  on public.order_items for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- subscriptions --------------------------------------------------------

alter table public.subscriptions
  add column if not exists cancelled_by_admin_id uuid references public.profiles (id),
  add column if not exists cancel_reason text;

create policy "subscriptions_select_admin"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "subscription_items_select_admin"
  on public.subscription_items for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- subscription_pauses ---------------------------------------------------

alter table public.subscription_pauses
  add column if not exists initiated_by_admin_id uuid references public.profiles (id),
  add column if not exists reason text;

-- payments ----------------------------------------------------------------

create policy "payments_select_admin"
  on public.payments for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- cities --------------------------------------------------------------------
-- Phase 1's own migration deliberately left these unwritten: "city
-- management ships in Phase 8's admin panel." No delete policy — a city is
-- deactivated, never deleted (FR-013/014; addresses.city_id would break on
-- a hard delete anyway).

create policy "cities_insert_admin"
  on public.cities for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "cities_update_admin"
  on public.cities for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
