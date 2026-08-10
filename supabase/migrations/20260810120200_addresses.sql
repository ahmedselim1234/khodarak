-- Phase 1 (Auth & Address): addresses table, default-address invariant, RLS.
-- See specs/002-phase-1-auth-address/data-model.md and research.md.

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  city_id uuid not null references public.cities (id),
  district text not null,
  street_details text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- FR-014/FR-015/SC-005: exactly one default address per customer, enforced
-- at the database level so it holds even under concurrent requests (a
-- double-submitted "set default" click, or two tabs) — the Route Handler's
-- unset-then-set transaction is the normal-path behavior; this index is the
-- backstop.
create unique index if not exists addresses_one_default_per_user
  on public.addresses (user_id)
  where is_default;

alter table public.addresses enable row level security;

-- FR-013: a customer reads/writes only their own addresses; RLS is the
-- authorization boundary, not just the Route Handler's own filtering
-- (Constitution Principle V).
create policy "addresses_select_own"
  on public.addresses for select
  using (user_id = auth.uid());

create policy "addresses_insert_own"
  on public.addresses for insert
  with check (user_id = auth.uid());

create policy "addresses_update_own"
  on public.addresses for update
  using (user_id = auth.uid());

create policy "addresses_delete_own"
  on public.addresses for delete
  using (user_id = auth.uid());
