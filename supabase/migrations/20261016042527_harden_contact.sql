create or replace function public.limit_contact_spam()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*) from public.contact_messages
    where lower(email) = lower(new.email)
      and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Too many messages. Please try again later.';
  end if;

  if (
    select count(*) from public.contact_messages
    where created_at > now() - interval '1 hour'
  ) >= 60 then
    raise exception 'Too many messages. Please try again later.';
  end if;

  return new;
end;
$$;

create trigger limit_contact_spam
  before insert on public.contact_messages
  for each row execute function public.limit_contact_spam();