create or replace function public.admin_list_students()
returns table (
  id         uuid,
  email      text,
  full_name  text,
  role       text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.email::text, p.full_name, p.role, u.created_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  where public.is_admin()
  order by u.created_at desc;
$$;

revoke all on function public.admin_list_students() from public, anon;
grant execute on function public.admin_list_students() to authenticated;