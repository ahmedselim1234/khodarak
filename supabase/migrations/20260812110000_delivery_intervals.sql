-- Phase 10 (Flexible Delivery Intervals & Discount Management): delivery_intervals table,
-- RLS, and additive subscriptions columns. See
-- specs/011-phase-10-flexible-delivery-intervals/data-model.md and research.md.

create table if not exists public.delivery_intervals (
  id uuid primary key default gen_random_uuid(),
  days smallint not null check (days between 1 and 90),
  discount_percent numeric(5, 2) not null check (discount_percent between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- research.md §2: unique among ACTIVE intervals only — a deactivated interval's day count
-- can be reused by a fresh active row later.
create unique index if not exists delivery_intervals_active_days_unique
  on public.delivery_intervals (days)
  where is_active = true;

alter table public.delivery_intervals enable row level security;

create policy "delivery_intervals_select_all"
  on public.delivery_intervals for select
  using (true);

create policy "delivery_intervals_insert_admin"
  on public.delivery_intervals for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "delivery_intervals_update_admin"
  on public.delivery_intervals for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create or replace function public.set_delivery_intervals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists delivery_intervals_set_updated_at on public.delivery_intervals;

create trigger delivery_intervals_set_updated_at
  before update on public.delivery_intervals
  for each row execute function public.set_delivery_intervals_updated_at();

-- research.md §1: a fourth sentinel value on the existing frequency check, plus three new
-- nullable columns populated iff frequency = 'custom_interval'. Every existing legacy row
-- (weekly/biweekly/monthly, all three new columns null) is completely unaffected.
alter table public.subscriptions
  drop constraint if exists subscriptions_frequency_check;

alter table public.subscriptions
  add constraint subscriptions_frequency_check
  check (frequency in ('weekly', 'biweekly', 'monthly', 'custom_interval'));

alter table public.subscriptions
  add column if not exists delivery_interval_id uuid references public.delivery_intervals (id),
  add column if not exists delivery_interval_days smallint,
  add column if not exists delivery_interval_last_discount_percent numeric(5, 2);

alter table public.subscriptions
  drop constraint if exists subscriptions_delivery_interval_consistency;

alter table public.subscriptions
  add constraint subscriptions_delivery_interval_consistency
  check (
    (
      frequency = 'custom_interval'
      and delivery_interval_id is not null
      and delivery_interval_days is not null
      and delivery_interval_last_discount_percent is not null
    )
    or
    (
      frequency <> 'custom_interval'
      and delivery_interval_id is null
      and delivery_interval_days is null
      and delivery_interval_last_discount_percent is null
    )
  );

-- Pending-edit columns (Phase 6, 20260811120000_dashboard.sql) gain the same sentinel +
-- parallel columns for the deferred-edit case (data-model.md).
alter table public.subscriptions
  drop constraint if exists subscriptions_pending_frequency_check;

alter table public.subscriptions
  add constraint subscriptions_pending_frequency_check
  check (pending_frequency in ('weekly', 'biweekly', 'monthly', 'custom_interval'));

alter table public.subscriptions
  add column if not exists pending_delivery_interval_id uuid references public.delivery_intervals (id),
  add column if not exists pending_delivery_interval_days smallint;
