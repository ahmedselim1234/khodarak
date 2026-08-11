-- Phase 6 (Customer Dashboard): pending-change columns on subscriptions,
-- subscription_pending_items, subscription_pauses.
-- See specs/007-phase-6-customer-dashboard/data-model.md and research.md §1-3.
--
-- Deliberately NO authenticated-role INSERT/UPDATE/DELETE policy on
-- subscriptions/subscription_items/subscription_pending_items/
-- subscription_pauses. Every write this phase makes to any of these tables
-- (item/frequency/address edits, pause, resume, cancel, the paused→active
-- self-heal) goes exclusively through lib/subscription/mutateSubscription.ts's
-- service-role client — the same pattern Phase 5's payments migration
-- established for `payments`/`orders`, for the same reason: an owner-scoped
-- UPDATE policy restricts rows, not columns, and would let a customer PATCH
-- their own subscription's `status`/`price_breakdown` directly (research.md
-- §3).

alter table public.subscriptions
  add column if not exists pending_frequency text
    check (pending_frequency in ('weekly', 'biweekly', 'monthly')),
  add column if not exists pending_address_id uuid references public.addresses (id),
  add column if not exists pending_price_breakdown jsonb,
  add column if not exists pending_effective_from date;

create table if not exists public.subscription_pending_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity integer not null check (quantity >= 1),
  created_at timestamptz not null default now()
);

alter table public.subscription_pending_items enable row level security;

-- Join-through-parent pattern, same as subscription_items (Phase 4).
create policy "subscription_pending_items_select_own"
  on public.subscription_pending_items for select
  using (
    exists (
      select 1 from public.subscriptions
      where subscriptions.id = subscription_pending_items.subscription_id
        and subscriptions.user_id = auth.uid()
    )
  );

create table if not exists public.subscription_pauses (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  started_at timestamptz not null default now(),
  resume_date date not null,
  resumed_early_at timestamptz
);

alter table public.subscription_pauses enable row level security;

create policy "subscription_pauses_select_own"
  on public.subscription_pauses for select
  using (
    exists (
      select 1 from public.subscriptions
      where subscriptions.id = subscription_pauses.subscription_id
        and subscriptions.user_id = auth.uid()
    )
  );

-- research.md §3 / data-model.md: FR-019's address-in-use check needs to
-- find subscriptions referencing an address either as their current or
-- pending delivery address, regardless of status other than cancelled.
create index if not exists subscriptions_address_id_idx on public.subscriptions (address_id);
create index if not exists subscriptions_pending_address_id_idx
  on public.subscriptions (pending_address_id);
