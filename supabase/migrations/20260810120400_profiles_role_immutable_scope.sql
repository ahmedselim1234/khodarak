-- Refines 20260810120300's role-immutability trigger: as written, it blocks
-- ALL role changes unconditionally, including ones a future privileged
-- context (e.g. Phase 8's admin panel, acting via the service role) would
-- need to make legitimately. Scope the block to normal user sessions only —
-- auth.role() = 'service_role' (the service-role key, which bypasses RLS
-- but not triggers) is exempted, everything else (a signed-in customer's
-- own 'authenticated' session) still cannot change role.

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    new.role := old.role;
  end if;
  return new;
end;
$$;
