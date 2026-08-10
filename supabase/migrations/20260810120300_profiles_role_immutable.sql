-- Fixes a privilege-escalation gap found during RLS verification: RLS
-- policies restrict *rows* (id = auth.uid()), not *columns*, so
-- "profiles_update_own" from 20260810120000_profiles.sql let a signed-in
-- customer PATCH their own `role` to 'admin' directly via the REST API
-- (the app UI never exposes this, but nothing stopped a direct API call —
-- confirmed live: a test customer successfully self-promoted). FR-008
-- requires no client-writable path to admin; this closes it at the
-- database level, the only place it can be closed unconditionally.

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_immutable on public.profiles;

create trigger profiles_role_immutable
  before update on public.profiles
  for each row execute function public.prevent_role_change();
