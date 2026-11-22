-- SABKAAM authorization hardening
-- Additive migration: preserves existing tables and rows.
-- Apply only after reviewing and backing up the Supabase project.

-- SECURITY DEFINER helpers avoid recursive RLS checks when reading the caller's role.
-- The fixed empty search_path and schema-qualified objects prevent search_path attacks.
create or replace function public.is_sabkaam_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role in (
        'moderator'::public.account_role,
        'admin'::public.account_role
      )
  );
$$;

create or replace function public.is_sabkaam_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'::public.account_role
  );
$$;

revoke all on function public.is_sabkaam_staff() from public, anon;
revoke all on function public.is_sabkaam_admin() from public, anon;
grant execute on function public.is_sabkaam_staff() to authenticated;
grant execute on function public.is_sabkaam_admin() to authenticated;

-- Staff can review operational records. Only admins can inspect audit logs
-- or change account roles.
drop policy if exists "staff can read all profiles" on public.profiles;
create policy "staff can read all profiles"
on public.profiles for select to authenticated
using (public.is_sabkaam_staff());

drop policy if exists "admins can update profiles" on public.profiles;
create policy "admins can update profiles"
on public.profiles for update to authenticated
using (public.is_sabkaam_admin())
with check (public.is_sabkaam_admin());

drop policy if exists "staff can read employers" on public.employers;
create policy "staff can read employers"
on public.employers for select to authenticated
using (public.is_sabkaam_staff());

drop policy if exists "staff can update employers" on public.employers;
create policy "staff can update employers"
on public.employers for update to authenticated
using (public.is_sabkaam_staff())
with check (public.is_sabkaam_staff());

drop policy if exists "staff can read verification requests" on public.verification_requests;
create policy "staff can read verification requests"
on public.verification_requests for select to authenticated
using (public.is_sabkaam_staff());

drop policy if exists "staff can review verification requests" on public.verification_requests;
create policy "staff can review verification requests"
on public.verification_requests for update to authenticated
using (public.is_sabkaam_staff())
with check (public.is_sabkaam_staff());

drop policy if exists "staff can read all jobs" on public.job_posts;
create policy "staff can read all jobs"
on public.job_posts for select to authenticated
using (public.is_sabkaam_staff());

drop policy if exists "staff can review jobs" on public.job_posts;
create policy "staff can review jobs"
on public.job_posts for update to authenticated
using (public.is_sabkaam_staff())
with check (public.is_sabkaam_staff());

drop policy if exists "staff can read applications" on public.applications;
create policy "staff can read applications"
on public.applications for select to authenticated
using (public.is_sabkaam_staff());

drop policy if exists "employers can update applications for their jobs" on public.applications;
create policy "employers can update applications for their jobs"
on public.applications for update to authenticated
using (
  exists (
    select 1
    from public.job_posts j
    join public.employers e on e.id = j.employer_id
    where j.id = job_id
      and e.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.job_posts j
    join public.employers e on e.id = j.employer_id
    where j.id = job_id
      and e.owner_id = (select auth.uid())
  )
);

drop policy if exists "staff can update applications" on public.applications;
create policy "staff can update applications"
on public.applications for update to authenticated
using (public.is_sabkaam_staff())
with check (public.is_sabkaam_staff());

drop policy if exists "staff can read reports" on public.reports;
create policy "staff can read reports"
on public.reports for select to authenticated
using (public.is_sabkaam_staff());

drop policy if exists "staff can review reports" on public.reports;
create policy "staff can review reports"
on public.reports for update to authenticated
using (public.is_sabkaam_staff())
with check (public.is_sabkaam_staff());

drop policy if exists "admins can read audit logs" on public.audit_logs;
create policy "admins can read audit logs"
on public.audit_logs for select to authenticated
using (public.is_sabkaam_admin());

-- Replace the initial trigger function with explicit role-aware field guards.
-- A null auth.uid() is reserved for trusted SQL/service-role operations; never
-- expose a service-role key to browsers or mobile clients.
create or replace function public.protect_reviewed_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_is_staff boolean;
  v_is_admin boolean;
  v_is_job_owner boolean;
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  v_is_staff := public.is_sabkaam_staff();
  v_is_admin := public.is_sabkaam_admin();

  if tg_table_name = 'profiles' then
    if tg_op = 'INSERT' then
      if new.role <> 'candidate' then
        raise exception 'New accounts must start as candidates';
      end if;
    elsif new.role is distinct from old.role and not v_is_admin then
      raise exception 'Only an administrator can change account roles';
    end if;

  elsif tg_table_name = 'employers' then
    if tg_op = 'INSERT' then
      if new.verification_status <> 'pending' then
        raise exception 'New employers must start pending verification';
      end if;
    elsif new.verification_status is distinct from old.verification_status
      and not v_is_staff then
      raise exception 'Only reviewers can change employer verification status';
    end if;

  elsif tg_table_name = 'verification_requests' then
    if tg_op = 'INSERT' then
      if new.status <> 'pending'
        or new.reviewer_notes is not null
        or new.reviewed_by is not null
        or new.reviewed_at is not null then
        raise exception 'New verification requests must start pending review';
      end if;
    elsif (
      new.status is distinct from old.status
      or new.reviewer_notes is distinct from old.reviewer_notes
      or new.reviewed_by is distinct from old.reviewed_by
      or new.reviewed_at is distinct from old.reviewed_at
    ) and not v_is_staff then
      raise exception 'Verification review fields are managed by reviewers';
    end if;

  elsif tg_table_name = 'job_posts' then
    if tg_op = 'INSERT' then
      if new.status <> 'draft' or new.published_at is not null then
        raise exception 'New jobs must start as unpublished drafts';
      end if;
    else
      if new.published_at is distinct from old.published_at and not v_is_staff then
        raise exception 'Only reviewers can set the publication timestamp';
      end if;

      if new.status is distinct from old.status then
        select exists (
          select 1
          from public.employers e
          where e.id = old.employer_id
            and e.owner_id = (select auth.uid())
        ) into v_is_job_owner;

        if v_is_staff then
          null;
        elsif v_is_job_owner
          and old.status = 'draft'::public.job_status
          and new.status = 'pending_review'::public.job_status then
          null;
        else
          raise exception 'Only reviewers can publish or change reviewed job status';
        end if;
      end if;
    end if;

  elsif tg_table_name = 'applications' then
    if tg_op = 'INSERT' then
      if new.status <> 'submitted' then
        raise exception 'New applications must start as submitted';
      end if;
    else
      -- Application identity and candidate-submitted content are immutable
      -- through client updates; only the workflow status may change.
      if new.job_id is distinct from old.job_id
        or new.candidate_id is distinct from old.candidate_id
        or new.full_name is distinct from old.full_name
        or new.phone is distinct from old.phone
        or new.experience is distinct from old.experience
        or new.message is distinct from old.message
        or new.created_at is distinct from old.created_at then
        raise exception 'Application details cannot be edited after submission';
      end if;

      if new.status is distinct from old.status then
        if v_is_staff then
          null;
        elsif old.candidate_id = (select auth.uid())
          and new.status = 'withdrawn'::public.application_status then
          null;
        else
          select exists (
            select 1
            from public.job_posts j
            join public.employers e on e.id = j.employer_id
            where j.id = old.job_id
              and e.owner_id = (select auth.uid())
          ) into v_is_job_owner;

          if not v_is_job_owner
            or new.status not in (
              'viewed'::public.application_status,
              'shortlisted'::public.application_status,
              'interview'::public.application_status,
              'hired'::public.application_status,
              'rejected'::public.application_status
            ) then
            raise exception 'Only the candidate can withdraw or the job owner can update application status';
          end if;
        end if;
      end if;
    end if;

  elsif tg_table_name = 'reports' then
    if tg_op = 'INSERT' then
      if new.status <> 'open' then
        raise exception 'New reports must start open';
      end if;
    else
      if new.reporter_id is distinct from old.reporter_id
        or new.job_id is distinct from old.job_id
        or new.employer_id is distinct from old.employer_id
        or new.reason is distinct from old.reason
        or new.details is distinct from old.details
        or new.contact_phone is distinct from old.contact_phone
        or new.created_at is distinct from old.created_at then
        raise exception 'Report submission details cannot be edited';
      end if;

      if new.status is distinct from old.status and not v_is_staff then
        raise exception 'Only moderators or administrators can review reports';
      end if;
    end if;

  elsif tg_table_name = 'notifications' and tg_op = 'UPDATE' then
    if new.user_id is distinct from old.user_id
      or new.title is distinct from old.title
      or new.body is distinct from old.body
      or new.kind is distinct from old.kind
      or new.created_at is distinct from old.created_at then
      raise exception 'Users may only mark their own notifications as read';
    end if;

    if not v_is_staff and new.read_at is null then
      raise exception 'Users may mark notifications as read but cannot clear read status';
    end if;
  end if;

  return new;
end;
$$;

-- Enforce the initial application state as well as update-time workflow guards.
drop trigger if exists protect_application_status on public.applications;
create trigger protect_application_status
before insert or update on public.applications
for each row execute function public.protect_reviewed_fields();

-- This migration adds policies and strengthens trigger checks. It does not
-- create a moderator/admin account. Provision the first admin out-of-band
-- from the Supabase SQL Editor after verifying the target auth user UUID.
