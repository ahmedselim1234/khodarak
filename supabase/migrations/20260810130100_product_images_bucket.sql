-- Phase 2 (Catalog + Admin Product CRUD): product-images storage bucket, RLS.
-- See specs/003-phase-2-catalog-admin-crud/research.md §3 and data-model.md.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Public read — product photos must render for signed-out visitors browsing
-- /browse.
create policy "product_images_select_all"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Admin-only writes — this bucket policy (not the /api/admin/products Route
-- Handler) is what actually restricts uploads to admins, since the browser
-- uploads directly to Storage.
create policy "product_images_insert_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "product_images_update_admin"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "product_images_delete_admin"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
