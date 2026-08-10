-- Phase 5 (Moyasar Integration & First Payment): payment_methods, payments,
-- webhook_events, orders, order_items tables, RLS.
-- See specs/006-phase-5-moyasar-payment/data-model.md and research.md §1.
--
-- Deliberately NO authenticated-role INSERT/UPDATE/DELETE policy on any
-- table here. Every write to these tables (subscription activation, saved
-- cards, payment records, generated orders) happens exclusively through the
-- service-role client from lib/payments/processPaymentOutcome.ts — never a
-- customer's own RLS-scoped session. This is a direct, proactive response to
-- the profiles.role self-escalation gap found in Phase 1
-- (20260810120300_profiles_role_immutable.sql): an owner-scoped UPDATE
-- policy restricts rows, not columns, and the equivalent mistake here would
-- let a customer set their own subscription to 'active' without ever
-- paying. Read-only SELECT policies are owner-scoped as usual.

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  moyasar_token_id text not null unique,
  brand text not null,
  last_four text not null,
  exp_month integer not null check (exp_month >= 1 and exp_month <= 12),
  exp_year integer not null,
  is_default boolean not null default true,
  status text not null default 'active' check (status in ('active', 'expired', 'removed')),
  created_at timestamptz not null default now()
);

alter table public.payment_methods enable row level security;

create policy "payment_methods_select_own"
  on public.payment_methods for select
  using (user_id = auth.uid());

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id),
  user_id uuid not null references public.profiles (id) on delete cascade,
  address_snapshot jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'out_for_delivery', 'delivered', 'cancelled')),
  scheduled_date date not null,
  delivered_at timestamptz,
  price_breakdown jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "orders_select_own"
  on public.orders for select
  using (user_id = auth.uid());

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  product_name_snapshot text not null,
  unit_price_snapshot numeric(10, 2) not null,
  quantity integer not null check (quantity >= 1)
);

alter table public.order_items enable row level security;

-- No user_id column of its own — ownership via the parent order, same
-- join-based pattern as subscription_items (Phase 4).
create policy "order_items_select_own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions (id),
  order_id uuid references public.orders (id),
  user_id uuid not null references public.profiles (id) on delete cascade,
  moyasar_payment_id text not null unique,
  amount_halalas integer not null check (amount_halalas > 0),
  status text not null default 'initiated' check (status in ('initiated', 'paid', 'failed')),
  failure_reason text,
  attempt_number integer not null default 1 check (attempt_number >= 1),
  raw_response jsonb,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "payments_select_own"
  on public.payments for select
  using (user_id = auth.uid());

-- The one deliberate exception to "no authenticated-role writes" on this
-- migration's tables: POST /api/subscriptions/[id]/pay records its own
-- attempt using the caller's normal RLS-scoped session (not service-role),
-- since initiating an attempt is something the customer legitimately does
-- themselves. This is safe because it's INSERT-only and pinned to
-- status = 'initiated' — a customer can create an attempt record for their
-- own subscription, but can never move it to 'paid'/'failed' (no UPDATE
-- policy at all), never set its order_id, and never touch
-- payment_methods/subscriptions/orders directly. Only
-- processPaymentOutcome.ts's service-role client can resolve an attempt's
-- outcome or activate anything (research.md §1).
create policy "payments_insert_own_initiated"
  on public.payments for insert
  with check (user_id = auth.uid() and status = 'initiated');

-- No customer-facing reader — only the service-role webhook handler reads
-- or writes this table.
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  moyasar_event_id text not null unique,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz
);

alter table public.webhook_events enable row level security;
