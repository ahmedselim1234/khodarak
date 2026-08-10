-- Phase 2 (Catalog + Admin Product CRUD): cart_items table, RLS.
-- See specs/003-phase-2-catalog-admin-crud/data-model.md — server-synced
-- cart per Clarifications (2026-08-10).

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity integer not null check (quantity >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

-- FR-013/FR-014: owner-only — a customer reads/writes only their own cart;
-- RLS is the authorization boundary (Constitution Principle V).
create policy "cart_items_select_own"
  on public.cart_items for select
  using (user_id = auth.uid());

create policy "cart_items_insert_own"
  on public.cart_items for insert
  with check (user_id = auth.uid());

create policy "cart_items_update_own"
  on public.cart_items for update
  using (user_id = auth.uid());

create policy "cart_items_delete_own"
  on public.cart_items for delete
  using (user_id = auth.uid());

create or replace function public.set_cart_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cart_items_set_updated_at on public.cart_items;

create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row execute function public.set_cart_items_updated_at();
