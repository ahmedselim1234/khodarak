-- Phase 1 (Auth & Address): cities lookup table.
-- Full target schema from plan.md §2 created now (delivery_fee_override
-- stays unused until Phase 3's delivery-fee rules) — see research.md.

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  is_active boolean not null default true,
  delivery_fee_override numeric
);

alter table public.cities enable row level security;

-- Public read: both customers picking an address city and the as-yet-unbuilt
-- admin panel need to read this table; no per-row sensitivity.
create policy "cities_select_all"
  on public.cities for select
  to authenticated
  using (true);

-- No insert/update/delete policy for non-admin users this phase — city
-- management ships in Phase 8's admin panel; rows are seeded/edited via
-- migration only until then.

-- Seed data so address creation is testable immediately (spec.md Assumptions).
insert into public.cities (name_ar, is_active)
values ('الرياض', true);
