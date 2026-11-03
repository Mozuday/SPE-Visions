-- One certificate per student per course
alter table public.certificates
  add constraint certificates_user_course_unique unique (user_id, course_id);

create or replace function public.issue_certificate(p_course_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user   uuid := auth.uid();
  v_number text;
  v_total  int;
  v_done   int;
  v_code   text;
  v_chars  constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  -- Already issued: return the existing one
  select certificate_number into v_number
  from public.certificates
  where user_id = v_user and course_id = p_course_id;

  if v_number is not null then
    return v_number;
  end if;

  if not public.has_course_access(p_course_id) then
    raise exception 'No access to this course';
  end if;

  select count(*) into v_total
  from public.course_videos
  where course_id = p_course_id and is_published;

  if v_total = 0 then
    raise exception 'This course has no lessons';
  end if;

  select count(*) into v_done
  from public.lesson_progress lp
  join public.course_videos v on v.id = lp.video_id
  where lp.user_id = v_user
    and lp.course_id = p_course_id
    and v.is_published;

  if v_done < v_total then
    raise exception 'Course not completed';
  end if;

  loop
    v_code := '';

    for i in 1..8 loop
      v_code := v_code
        || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
    end loop;

    v_number := 'SPE-' || to_char(now(), 'YYYY') || '-' || v_code;

    begin
      insert into public.certificates (user_id, course_id, certificate_number)
      values (v_user, p_course_id, v_number);

      return v_number;
    exception when unique_violation then
      -- Concurrent call for the same student, or a number clash
      select certificate_number into v_number
      from public.certificates
      where user_id = v_user and course_id = p_course_id;

      if v_number is not null then
        return v_number;
      end if;
    end;
  end loop;
end;
$$;

revoke all on function public.issue_certificate(uuid) from public, anon;
grant execute on function public.issue_certificate(uuid) to authenticated;