-- Notify employers when a candidate applies and candidates when application status changes.
create or replace function public.notify_application_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_employer_owner uuid;
  v_job_title text;
begin
  select e.owner_id, j.title
    into v_employer_owner, v_job_title
  from public.job_posts j
  join public.employers e on e.id = j.employer_id
  where j.id = new.job_id;

  if tg_op = 'INSERT' then
    if v_employer_owner is not null then
      insert into public.notifications (user_id, title, body, kind)
      values (
        v_employer_owner,
        'New job application',
        new.full_name || ' applied for ' || coalesce(v_job_title, 'your job'),
        'application'
      );
    end if;
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.notifications (user_id, title, body, kind)
    values (
      new.candidate_id,
      'Application status updated',
      'Your application for ' || coalesce(v_job_title, 'a job') || ' is now ' || new.status::text,
      'application'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notify_application_created on public.applications;
create trigger notify_application_created
after insert on public.applications
for each row execute function public.notify_application_event();

drop trigger if exists notify_application_status_changed on public.applications;
create trigger notify_application_status_changed
after update of status on public.applications
for each row execute function public.notify_application_event();
