-- Phase 1 (Auth & Address): profiles table, role resolution, auto-creation trigger, RLS.
-- See specs/002-phase-1-auth-address/data-model.md and research.md for rationale.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user reads/updates only their own profile. Role is intentionally not
-- excluded at the RLS layer (Postgres RLS policies gate rows, not columns);
-- the client-facing update path (lib/validation/auth.ts + the settings form)
-- never sends a `role` field, so self-escalation isn't reachable in practice
-- for this phase (FR-008). No INSERT/DELETE policy is granted to regular
-- users — creation is trigger-only, deletion cascades from auth.users.
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

-- Creates the matching profiles row atomically with account creation, reading
-- full_name/phone from the signUp() call's options.data metadata and always
-- defaulting role to 'customer' — there is no client-writable path to admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
