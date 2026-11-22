-- SABKAAM role-level RLS and trigger regression tests.
-- Runs only against the disposable local Supabase database in CI.
begin;

select no_plan();

-- Deterministic identities for this isolated test database.
insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'candidate-a@test.invalid', '', now(), '{}'::jsonb, '{"full_name":"Candidate A"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'candidate-b@test.invalid', '', now(), '{}'::jsonb, '{"full_name":"Candidate B"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'employer-a@test.invalid', '', now(), '{}'::jsonb, '{"full_name":"Employer A"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'employer-b@test.invalid', '', now(), '{}'::jsonb, '{"full_name":"Employer B"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'moderator@test.invalid', '', now(), '{}'::jsonb, '{"full_name":"Moderator"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'admin@test.invalid', '', now(), '{}'::jsonb, '{"full_name":"Admin"}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'employer-new@test.invalid', '', now(), '{}'::jsonb, '{"full_name":"Employer New"}'::jsonb, now(), now());

update public.profiles set role = 'employer' where id in (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000007'
);
update public.profiles set role = 'moderator' where id = '00000000-0000-0000-0000-000000000005';
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000006';

insert into public.employers (
  id, owner_id, business_name, verification_status
) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Employer A Ltd', 'pending'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'Employer B Ltd', 'pending');

insert into public.verification_requests (
  id, employer_id, business_name
) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Employer A Ltd');

insert into public.job_posts (
  id, employer_id, title, category, description, work_type,
  state_code, district, status
) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Published role', 'Retail', 'Test job', 'full_time', 'BR', 'Patna', 'published'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Draft role', 'Retail', 'Draft test job', 'full_time', 'BR', 'Patna', 'draft'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Other employer role', 'Retail', 'Other test job', 'full_time', 'JH', 'Ranchi', 'published');

insert into public.applications (
  id, job_id, candidate_id, full_name, phone
) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Candidate A', '9000000001'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Candidate B', '9000000002');

insert into public.reports (id, reporter_id, reason)
values ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'test report');

insert into public.notifications (id, user_id, title, body)
values ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Test notification', 'Hello');

insert into public.audit_logs (actor_id, action, entity_type)
values ('00000000-0000-0000-0000-000000000006', 'test.seed', 'test');

-- Anonymous: public published jobs only; no private profile access or helper execution.
set local role anon;
select is((select count(*)::int from public.job_posts), 2, 'anonymous users see published jobs only');
select is((select count(*)::int from public.profiles), 0, 'anonymous users cannot read profiles');
select is((select count(*)::int from public.employers), 0, 'anonymous users cannot read employer records');
reset role;

-- Candidate A: own profile/application/report/notification only.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
select is((select count(*)::int from public.profiles), 1, 'candidate reads only their own profile');
select is((select count(*)::int from public.applications), 1, 'candidate reads only their own application');
select is((select count(*)::int from public.reports), 1, 'candidate reads only their own report');
select is((select count(*)::int from public.notifications), 1, 'candidate reads only their own notifications');
select is((select count(*)::int from public.job_posts), 2, 'candidate sees published jobs but not drafts');
select ok(not public.is_sabkaam_staff(), 'candidate is not staff');
select ok(not public.is_sabkaam_admin(), 'candidate is not admin');

select throws_ok(
  $$ insert into public.employers (id, owner_id, business_name, verification_status)
     values ('10000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000001', 'Candidate Fake Ltd', 'pending') $$,
  '42501',
  'new row violates row-level security policy for table "employers"',
  'candidate cannot create an employer record'
);
select throws_ok(
  $$ update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000001' $$,
  'P0001',
  'Only an administrator can change account roles',
  'candidate cannot promote their own account'
);
select throws_ok(
  $$ update public.applications set status = 'hired' where id = '40000000-0000-0000-0000-000000000001' $$,
  'P0001',
  'Only the candidate can withdraw or the job owner can update application status',
  'candidate cannot set a hiring decision'
);
select lives_ok(
  $$ update public.applications set status = 'withdrawn' where id = '40000000-0000-0000-0000-000000000001' $$,
  'candidate can withdraw their own application'
);
reset role;

-- Employer A: own employer/jobs and applications to own jobs; no other employer's data.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
set local role authenticated;
select is((select count(*)::int from public.employers), 1, 'employer reads only their own employer record');
select is((select count(*)::int from public.job_posts), 3, 'employer reads their own jobs plus public published jobs');
select is((select count(*)::int from public.applications), 1, 'employer reads applications to their own jobs');
select ok(not public.is_sabkaam_staff(), 'employer is not staff');

select lives_ok(
  $$ insert into public.employers (id, owner_id, business_name, verification_status)
     values ('10000000-0000-0000-0000-000000000098', '00000000-0000-0000-0000-000000000007', 'Employer New Ltd', 'pending') $$,
  'employer-role account can create its own employer record'
);
select throws_ok(
  $$ update public.job_posts set status = 'published' where id = '30000000-0000-0000-0000-000000000002' $$,
  'P0001',
  'Only reviewers can publish or change reviewed job status',
  'employer cannot directly publish a draft job'
);
select lives_ok(
  $$ update public.job_posts set status = 'pending_review' where id = '30000000-0000-0000-0000-000000000002' $$,
  'employer can submit a draft job for review'
);
select lives_ok(
  $$ update public.applications set status = 'shortlisted' where id = '40000000-0000-0000-0000-000000000001' $$,
  'employer can shortlist an applicant to their job'
);
select throws_ok(
  $$ update public.applications set phone = '9999999999' where id = '40000000-0000-0000-0000-000000000001' $$,
  'P0001',
  'Application details cannot be edited after submission',
  'employer cannot edit candidate-submitted application details'
);
reset role;

-- Moderator: staff operational review, but no broad profile or audit-log access.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', true);
set local role authenticated;
select ok(public.is_sabkaam_staff(), 'moderator is staff');
select ok(not public.is_sabkaam_admin(), 'moderator is not admin');
select is((select count(*)::int from public.profiles), 1, 'moderator cannot browse all profiles');
select is((select count(*)::int from public.employers), 3, 'moderator can review all employer records');
select is((select count(*)::int from public.verification_requests), 1, 'moderator can review verification requests');
select is((select count(*)::int from public.applications), 2, 'moderator can review all applications');
select is((select count(*)::int from public.reports), 1, 'moderator can review reports');
select is((select count(*)::int from public.audit_logs), 0, 'moderator cannot read audit logs');
select lives_ok(
  $$ update public.verification_requests set status = 'approved', reviewer_notes = 'Verified', reviewed_by = '00000000-0000-0000-0000-000000000005', reviewed_at = now() where id = '20000000-0000-0000-0000-000000000001' $$,
  'moderator can complete a verification review'
);
select lives_ok(
  $$ update public.reports set status = 'resolved' where id = '50000000-0000-0000-0000-000000000001' $$,
  'moderator can resolve a report'
);
reset role;

-- Admin: staff capabilities plus broad profile and audit-log access.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000006', true);
set local role authenticated;
select ok(public.is_sabkaam_staff(), 'admin is staff');
select ok(public.is_sabkaam_admin(), 'admin helper identifies admin');
select is((select count(*)::int from public.profiles), 7, 'admin can read all profiles');
select is((select count(*)::int from public.audit_logs), 1, 'admin can read audit logs');
select lives_ok(
  $$ update public.profiles set role = 'moderator' where id = '00000000-0000-0000-0000-000000000002' $$,
  'admin can assign a permitted account role'
);
reset role;

select * from finish();
rollback;
