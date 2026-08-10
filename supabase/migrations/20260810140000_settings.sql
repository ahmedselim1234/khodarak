-- Phase 3 (Admin Settings & the Pricing Engine): settings table, RLS, seed.
-- See specs/004-phase-3-pricing-engine/data-model.md and research.md §1.

create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  frequencies jsonb not null,
  min_order_value numeric(10, 2) not null default 0 check (min_order_value >= 0),
  max_items_per_box integer not null default 20 check (max_items_per_box >= 1),
  edit_cutoff_hours integer not null default 24 check (edit_cutoff_hours >= 0),
  first_delivery_lead_days integer not null default 2 check (first_delivery_lead_days >= 0),
  blackout_weekdays integer[] not null default '{}',
  delivery_mode text not null default 'flat'
    check (delivery_mode in ('flat', 'free_above_threshold', 'per_city')),
  delivery_flat_fee numeric(10, 2) not null default 10 check (delivery_flat_fee >= 0),
  delivery_free_threshold numeric(10, 2) not null default 150 check (delivery_free_threshold >= 0),
  max_pause_days integer not null default 30 check (max_pause_days >= 0),
  max_pauses_per_year integer not null default 4 check (max_pauses_per_year >= 0),
  vat_percent numeric(5, 2) not null default 15 check (vat_percent >= 0 and vat_percent <= 100),
  prices_include_vat boolean not null default true,
  rounding_mode text not null default 'nearest_0.5'
    check (rounding_mode in ('none', 'nearest_0.5', 'nearest_1')),
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

-- FR-017a: /pricing-preview is public, so it (running server-side under the
-- anon-key server client, not a service role) must be able to read the
-- current settings without signing in. No PII/sensitive data lives here —
-- it's business rules, same reasoning as products_select_all (Phase 2).
create policy "settings_select_all"
  on public.settings for select
  using (true);

-- Admin-only writes (FR-001-006), same role-lookup pattern as products.
create policy "settings_insert_admin"
  on public.settings for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "settings_update_admin"
  on public.settings for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "settings_delete_admin"
  on public.settings for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create or replace function public.set_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists settings_set_updated_at on public.settings;

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_settings_updated_at();

-- Seed the single row so the pricing engine has something real to
-- calculate against immediately (data-model.md Seed data).
insert into public.settings (id, frequencies)
values (
  1,
  '{
    "weekly":   { "enabled": true, "discountPercent": 5,  "deliveriesPerMonth": 4 },
    "biweekly": { "enabled": true, "discountPercent": 8,  "deliveriesPerMonth": 2 },
    "monthly":  { "enabled": true, "discountPercent": 12, "deliveriesPerMonth": 1 }
  }'::jsonb
)
on conflict (id) do nothing;
