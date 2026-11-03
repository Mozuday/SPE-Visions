-- =========================================================
-- SPE Visions: initial schema, RLS and triggers
--
-- RECORD ONLY. Already applied to the remote database.
-- Do not run or push again.
--
-- Note: course_videos has no public-read policy. Video URLs
-- are protected; see 2026..._phase1_enrollments_orders.sql
-- (enrolled students + admins read videos, the public reads
-- the course_lessons view).
-- =========================================================

-- ---------- profiles ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Admin check used by every policy. SECURITY DEFINER avoids
-- recursive RLS when it reads profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- services ----------
create table public.services (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  description  text,
  icon         text,
  is_published boolean not null default true,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- courses ----------
create table public.courses (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  description   text,
  thumbnail_url text,
  price         numeric,
  duration      text not null default '',
  level         text check (level in ('Beginner','Intermediate','Advanced','Beginner to Advanced')),
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- course_videos ----------
create table public.course_videos (
  id                uuid primary key default gen_random_uuid(),
  course_id         uuid not null references public.courses(id) on delete cascade,
  title             text not null,
  description       text,
  provider          text not null default 'external',
  provider_video_id text,
  video_url         text,
  thumbnail_url     text,
  duration          integer,  -- seconds
  order_index       integer not null default 0,
  is_published      boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index course_videos_course_idx on public.course_videos (course_id, order_index);

-- ---------- internships ----------
create table public.internships (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  description  text,
  duration     text,
  stipend      text,
  category     text,
  eligibility  text,
  skills       text[] not null default '{}',
  seats        integer,
  deadline     date,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.internship_applications (
  id            uuid primary key default gen_random_uuid(),
  internship_id uuid references public.internships(id) on delete set null,
  full_name     text not null check (char_length(full_name) between 2 and 120),
  email         text not null check (char_length(email) <= 254),
  phone         text,
  resume_url    text,
  cover_note    text check (char_length(cover_note) <= 5000),
  status        text not null default 'pending' check (status in ('pending','reviewed','accepted','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index internship_applications_unique_email
  on public.internship_applications (internship_id, lower(email));

-- ---------- jobs ----------
create table public.jobs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  description      text,
  location         text,
  employment_type  text check (employment_type in ('Full Time','Part Time','Internship','Contract','Freelance')),
  company          text,
  work_mode        text check (work_mode in ('Remote','On-site','Hybrid')),
  experience       text,
  salary           text,
  skills           text[] not null default '{}',
  application_link text,
  deadline         date,
  is_published     boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.job_applications (
  id          uuid primary key default gen_random_uuid(),
  job_id      uuid references public.jobs(id) on delete set null,
  full_name   text not null,
  email       text not null,
  phone       text,
  resume_url  text,
  cover_note  text,
  status      text not null default 'pending' check (status in ('pending','reviewed','accepted','rejected')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- blogs ----------
create table public.blogs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  excerpt         text,
  content         text,
  cover_image_url text,
  author_id       uuid references public.profiles(id) on delete set null,
  is_published    boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- portfolio_projects ----------
create table public.portfolio_projects (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  description     text,
  cover_image_url text,
  project_url     text,
  tags            text[],
  is_published    boolean not null default true,
  order_index     integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- certificates ----------
create table public.certificates (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  course_id          uuid not null references public.courses(id) on delete cascade,
  certificate_number text not null unique,
  issued_at          timestamptz not null default now(),
  file_url           text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------- contact_messages ----------
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 120),
  email      text not null check (char_length(email) <= 254),
  phone      text,
  subject    text check (char_length(subject) <= 200),
  message    text not null check (char_length(message) between 10 and 5000),
  status     text not null default 'new' check (status in ('new','read','replied','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- updated_at trigger on every table
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','services','courses','course_videos','internships',
    'internship_applications','jobs','job_applications','blogs',
    'portfolio_projects','certificates','contact_messages'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- =========================================================
-- New auth user -> profile row (role is always 'user')
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill for users created before this migration
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- =========================================================
-- Row Level Security
-- =========================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','services','courses','course_videos','internships',
    'internship_applications','jobs','job_applications','blogs',
    'portfolio_projects','certificates','contact_messages'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;

  -- Admins can do everything on content + inbox tables
  foreach t in array array[
    'services','courses','course_videos','internships',
    'internship_applications','jobs','job_applications','blogs',
    'portfolio_projects','certificates','contact_messages'
  ] loop
    execute format(
      'create policy "Admins manage %1$s" on public.%1$I
         for all to authenticated
         using (public.is_admin()) with check (public.is_admin())', t);
  end loop;

  -- Public can read published content only.
  -- course_videos is intentionally NOT listed: video URLs are
  -- protected (see the Phase 1 migration).
  foreach t in array array[
    'services','courses','internships',
    'jobs','blogs','portfolio_projects'
  ] loop
    execute format(
      'create policy "Public reads published %1$s" on public.%1$I
         for select to anon, authenticated
         using (is_published = true)', t);
  end loop;
end $$;

-- profiles: read own (or any, if admin); update own non-role fields
create policy "Read own profile or admin reads all"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Users can never change their own role (or anything but these columns)
revoke update on public.profiles from anon, authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- Public forms: insert only, never read
create policy "Public can submit internship applications"
  on public.internship_applications for insert to anon, authenticated
  with check (status = 'pending');

create policy "Public can send contact messages"
  on public.contact_messages for insert to anon, authenticated
  with check (status = 'new');

-- Users can read their own certificates
create policy "Users read own certificates"
  on public.certificates for select to authenticated
  using (user_id = auth.uid());

-- Public certificate verification: exact number lookup, limited fields
create or replace function public.verify_certificate(p_number text)
returns table (
  certificate_number text,
  issued_at          timestamptz,
  holder_name        text,
  course_title       text
)
language sql
stable
security definer
set search_path = public
as $$
  select c.certificate_number, c.issued_at, p.full_name, co.title
  from public.certificates c
  join public.profiles p  on p.id  = c.user_id
  join public.courses  co on co.id = c.course_id
  where c.certificate_number = p_number;
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;