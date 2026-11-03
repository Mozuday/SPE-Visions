-- =========================================================
-- Phase 1: enrollments, orders, lesson progress, video
-- protection, certificate storage
-- =========================================================

-- ---------- helper: is this course free? ----------
create or replace function public.is_course_free(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select price is null or price = 0
       from public.courses
      where id = p_course_id and is_published = true),
    false
  );
$$;

-- ---------- enrollments ----------
create table public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  source      text not null default 'purchase'
              check (source in ('purchase', 'free', 'admin')),
  order_id    uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, course_id)
);
create index enrollments_course_idx on public.enrollments (course_id);

-- ---------- orders (Razorpay) ----------
create table public.orders (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete restrict,
  course_id            uuid not null references public.courses(id) on delete restrict,
  amount               integer not null check (amount >= 0),   -- in paise
  currency             text not null default 'INR',
  status               text not null default 'created'
                       check (status in ('created', 'paid', 'failed', 'refunded')),
  razorpay_order_id    text not null unique,
  razorpay_payment_id  text unique,
  paid_at              timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id);

alter table public.enrollments
  add constraint enrollments_order_fk
  foreign key (order_id) references public.orders(id) on delete set null;

-- ---------- lesson progress ----------
create table public.lesson_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  course_id     uuid not null references public.courses(id) on delete cascade,
  video_id      uuid not null references public.course_videos(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  unique (user_id, video_id)
);
create index lesson_progress_user_course_idx
  on public.lesson_progress (user_id, course_id);

-- ---------- updated_at triggers ----------
create trigger set_updated_at before update on public.enrollments
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------- access helper ----------
create or replace function public.has_course_access(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1 from public.enrollments
      where user_id = auth.uid() and course_id = p_course_id
    )
    or (auth.uid() is not null and public.is_course_free(p_course_id));
$$;

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.enrollments     enable row level security;
alter table public.orders          enable row level security;
alter table public.lesson_progress enable row level security;

-- Admins manage everything
create policy "Admins manage enrollments" on public.enrollments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage orders" on public.orders
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage lesson_progress" on public.lesson_progress
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Students read only their own enrollments and orders.
-- Nobody but admins/Edge Functions (service role) can write these.
create policy "Users read own enrollments" on public.enrollments
  for select to authenticated
  using (user_id = auth.uid());

create policy "Users read own orders" on public.orders
  for select to authenticated
  using (user_id = auth.uid());

-- Students read and record their own progress, only for courses
-- they can access.
create policy "Users read own progress" on public.lesson_progress
  for select to authenticated
  using (user_id = auth.uid());

create policy "Users record own progress" on public.lesson_progress
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.has_course_access(course_id)
    and exists (
      select 1 from public.course_videos v
      where v.id = video_id and v.course_id = lesson_progress.course_id
    )
  );

create policy "Users clear own progress" on public.lesson_progress
  for delete to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- Video protection
-- =========================================================

-- Old policy exposed every published video URL to the world.
drop policy if exists "Public reads published course_videos"
  on public.course_videos;

-- Only students with access (or admins, via the existing admin
-- policy) can read the real rows, including video URLs.
create policy "Students read videos they can access"
  on public.course_videos
  for select to authenticated
  using (is_published = true and public.has_course_access(course_id));

-- Public lesson list: NO video_url / provider_video_id columns.
create or replace view public.course_lessons
with (security_invoker = false)
as
  select
    v.id,
    v.course_id,
    v.title,
    v.description,
    v.duration,
    v.order_index
  from public.course_videos v
  join public.courses c on c.id = v.course_id
  where v.is_published = true and c.is_published = true;

grant select on public.course_lessons to anon, authenticated;

-- =========================================================
-- Certificates: private PDF storage
-- =========================================================
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', false)
on conflict (id) do nothing;

-- Files are stored as <user_id>/<certificate_number>.pdf, so the
-- first folder name identifies the owner.
create policy "Users read own certificate files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins manage certificate files"
  on storage.objects for all to authenticated
  using (bucket_id = 'certificates' and public.is_admin())
  with check (bucket_id = 'certificates' and public.is_admin());