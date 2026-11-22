-- Only candidate accounts may submit job applications.
drop policy if exists "candidates can apply as themselves" on public.applications;

create policy "candidates can apply as themselves"
on public.applications for insert to authenticated
with check (
  candidate_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'candidate'::public.account_role
  )
  and exists (
    select 1
    from public.job_posts j
    where j.id = job_id
      and j.status = 'published'::public.job_status
  )
);
