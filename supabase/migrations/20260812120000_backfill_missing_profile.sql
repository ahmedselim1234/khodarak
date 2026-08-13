
insert into public.profiles (id, full_name, phone, role, email)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  coalesce(u.raw_user_meta_data ->> 'phone', ''),
  'customer',
  u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
