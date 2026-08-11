-- Phase 9 audit fix (post-launch-migration discovery, not caught by the
-- earlier file-based RLS review because these migrations had never actually
-- been applied to a live database until this session): every admin-role RLS
-- policy across the app checks `exists (select 1 from public.profiles where
-- profiles.id = auth.uid() and profiles.role = 'admin')`. Phase 8's own
-- `profiles_select_admin` policy (20260811140000_admin_operations.sql) put
-- that exact same subquery ON `profiles` itself — a SELECT policy on
-- `profiles` that queries `profiles` to decide visibility. Postgres has to
-- evaluate `profiles_select_own OR profiles_select_admin` for every row
-- read from `profiles`, and evaluating `profiles_select_admin` requires
-- re-reading `profiles` under the same RLS, forever: `42P17 infinite
-- recursion detected in policy for relation "profiles"`. Because nearly
-- every other admin-select/write policy in the app also subqueries
-- `profiles`, that inner read hits the same recursion — breaking
-- `subscriptions`, `payments`, `orders`, `order_items`,
-- `subscription_pauses` reads (confirmed via direct REST calls), and would
-- break every admin write path (`products`, `settings`, `cities`, storage
-- uploads) the moment an admin session tried to use them.
--
-- Fix: a `security definer` helper function. Functions created by the
-- migration role run with that role's privileges, which bypasses RLS for
-- the function's own internal query (the standard Supabase-documented
-- pattern for exactly this recursion class) — so `is_admin()` can read
-- `profiles` without re-triggering `profiles`' own RLS policies. Every
-- policy that inlined the subquery is dropped and recreated to call
-- `public.is_admin()` instead; none of their *semantics* change, only how
-- the admin check is evaluated.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;

-- profiles ------------------------------------------------------------------

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

-- products --------------------------------------------------------------------

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin"
  on public.products for insert
  with check (public.is_admin());

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin"
  on public.products for update
  using (public.is_admin());

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin"
  on public.products for delete
  using (public.is_admin());

-- product-images storage bucket ----------------------------------------------

drop policy if exists "product_images_insert_admin" on storage.objects;
create policy "product_images_insert_admin"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_update_admin" on storage.objects;
create policy "product_images_update_admin"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_delete_admin" on storage.objects;
create policy "product_images_delete_admin"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- settings --------------------------------------------------------------------

drop policy if exists "settings_insert_admin" on public.settings;
create policy "settings_insert_admin"
  on public.settings for insert
  with check (public.is_admin());

drop policy if exists "settings_update_admin" on public.settings;
create policy "settings_update_admin"
  on public.settings for update
  using (public.is_admin());

drop policy if exists "settings_delete_admin" on public.settings;
create policy "settings_delete_admin"
  on public.settings for delete
  using (public.is_admin());

-- orders / order_items --------------------------------------------------------

drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
  on public.orders for update
  using (public.is_admin());

drop policy if exists "order_items_select_admin" on public.order_items;
create policy "order_items_select_admin"
  on public.order_items for select
  using (public.is_admin());

-- subscriptions / subscription_items -------------------------------------------

drop policy if exists "subscriptions_select_admin" on public.subscriptions;
create policy "subscriptions_select_admin"
  on public.subscriptions for select
  using (public.is_admin());

drop policy if exists "subscription_items_select_admin" on public.subscription_items;
create policy "subscription_items_select_admin"
  on public.subscription_items for select
  using (public.is_admin());

-- subscription_pauses ----------------------------------------------------------

drop policy if exists "subscription_pauses_select_admin" on public.subscription_pauses;
create policy "subscription_pauses_select_admin"
  on public.subscription_pauses for select
  using (public.is_admin());

-- payments ----------------------------------------------------------------------

drop policy if exists "payments_select_admin" on public.payments;
create policy "payments_select_admin"
  on public.payments for select
  using (public.is_admin());

-- cities ---------------------------------------------------------------------

drop policy if exists "cities_insert_admin" on public.cities;
create policy "cities_insert_admin"
  on public.cities for insert
  with check (public.is_admin());

drop policy if exists "cities_update_admin" on public.cities;
create policy "cities_update_admin"
  on public.cities for update
  using (public.is_admin());

-- addresses ---------------------------------------------------------------------

drop policy if exists "addresses_select_admin" on public.addresses;
create policy "addresses_select_admin"
  on public.addresses for select
  using (public.is_admin());
