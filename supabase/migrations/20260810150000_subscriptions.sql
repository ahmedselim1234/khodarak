-- Phase 4 (Subscription Builder): subscriptions + subscription_items tables, RLS.
-- See specs/005-phase-4-subscription-builder/data-model.md and research.md.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  address_id uuid not null references public.addresses (id),
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly')),
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active', 'paused', 'cancelled')),
  next_delivery_date date not null,
  delivery_time_slot text not null check (delivery_time_slot in ('morning', 'afternoon', 'evening')),
  paused_until date,
  started_at timestamptz,
  cancelled_at timestamptz,
  price_breakdown jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- FR-010/FR-015: owner-only — a customer reads/creates only their own
-- subscriptions. No update/delete policy yet (Phase 6 adds those alongside
-- the dashboard actions that need them).
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (user_id = auth.uid());

create policy "subscriptions_insert_own"
  on public.subscriptions for insert
  with check (user_id = auth.uid());

create or replace function public.set_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_subscriptions_updated_at();

create table if not exists public.subscription_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity integer not null check (quantity >= 1),
  created_at timestamptz not null default now()
);

alter table public.subscription_items enable row level security;

-- No user_id column of its own — ownership is via the parent subscription,
-- same join-based pattern the join-through-parent RLS style established
-- elsewhere in this project.
create policy "subscription_items_select_own"
  on public.subscription_items for select
  using (
    exists (
      select 1 from public.subscriptions
      where subscriptions.id = subscription_items.subscription_id
        and subscriptions.user_id = auth.uid()
    )
  );

create policy "subscription_items_insert_own"
  on public.subscription_items for insert
  with check (
    exists (
      select 1 from public.subscriptions
      where subscriptions.id = subscription_items.subscription_id
        and subscriptions.user_id = auth.uid()
    )
  );
