-- Phase 2 (Catalog + Admin Product CRUD): products table, RLS.
-- See specs/003-phase-2-catalog-admin-crud/data-model.md and research.md.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  category text not null check (category in ('vegetables', 'fruits')),
  price numeric(10, 2) not null check (price > 0),
  unit text not null check (unit in ('kg', 'piece')),
  image_url text not null,
  is_available boolean not null default true,
  min_qty integer not null default 1 check (min_qty >= 1),
  max_qty integer not null check (max_qty >= min_qty),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- FR-006/FR-007: the storefront (including signed-out visitors) reads the
-- full catalog, unavailable products included — they're filtered/flagged in
-- the UI (FR-004), not hidden at the data layer.
create policy "products_select_all"
  on public.products for select
  using (true);

-- Admin-only writes (FR-001/002/003/004), matching the profiles.role lookup
-- pattern established in Phase 1's migrations.
create policy "products_insert_admin"
  on public.products for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "products_update_admin"
  on public.products for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "products_delete_admin"
  on public.products for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Keeps updated_at accurate for FR-002's "reflected on next load" behavior
-- without relying on every call site to set it manually.
create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_products_updated_at();
