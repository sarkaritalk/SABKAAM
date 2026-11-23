begin;

select no_plan();

-- All application tables must exist and enforce row-level security.
select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'employers', 'employers table exists');
select has_table('public', 'verification_requests', 'verification_requests table exists');
select has_table('public', 'job_posts', 'job_posts table exists');
select has_table('public', 'applications', 'applications table exists');
select has_table('public', 'reports', 'reports table exists');
select has_table('public', 'notifications', 'notifications table exists');
select has_table('public', 'audit_logs', 'audit_logs table exists');

select ok(
  (select count(*) = 8
   from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname in (
       'profiles', 'employers', 'verification_requests', 'job_posts',
       'applications', 'reports', 'notifications', 'audit_logs'
     )
     and c.relrowsecurity),
  'RLS is enabled on all eight application tables'
);

-- Privilege helpers must be SECURITY DEFINER and have a fixed search_path.
select ok(
  (select p.prosecdef
   from pg_proc p
   where p.oid = to_regprocedure('public.is_sabkaam_staff()')),
  'staff helper is SECURITY DEFINER'
);
select ok(
  (select p.prosecdef
   from pg_proc p
   where p.oid = to_regprocedure('public.is_sabkaam_admin()')),
  'admin helper is SECURITY DEFINER'
);
select ok(
  (select p.proconfig @> array['search_path=""']::text[]
   from pg_proc p
   where p.oid = to_regprocedure('public.is_sabkaam_staff()')),
  'staff helper pins an empty search_path'
);
select ok(
  (select p.proconfig @> array['search_path=""']::text[]
   from pg_proc p
   where p.oid = to_regprocedure('public.is_sabkaam_admin()')),
  'admin helper pins an empty search_path'
);

select ok(
  not has_function_privilege('anon', 'public.is_sabkaam_staff()', 'EXECUTE'),
  'anonymous users cannot execute staff helper'
);
select ok(
  not has_function_privilege('anon', 'public.is_sabkaam_admin()', 'EXECUTE'),
  'anonymous users cannot execute admin helper'
);
select ok(
  has_function_privilege('authenticated', 'public.is_sabkaam_staff()', 'EXECUTE'),
  'authenticated users can execute staff helper'
);
select ok(
  has_function_privilege('authenticated', 'public.is_sabkaam_admin()', 'EXECUTE'),
  'authenticated users can execute admin helper'
);

-- Verify the sensitive staff/admin policies exist on their intended tables.
select ok(exists (
  select 1 from pg_policies
  where schemaname = 'public' and tablename = 'profiles'
    and policyname = 'admins can read all profiles'
    and cmd = 'SELECT'
), 'only the admin read policy is added for broad profile reads');
select ok(exists (
  select 1 from pg_policies
  where schemaname = 'public' and tablename = 'profiles'
    and policyname = 'admins can update profiles'
    and cmd = 'UPDATE'
), 'admin profile update policy exists');
select ok(exists (
  select 1 from pg_policies
  where schemaname = 'public' and tablename = 'employers'
    and policyname = 'staff can read employers'
    and cmd = 'SELECT'
), 'staff employer review read policy exists');
select ok(exists (
  select 1 from pg_policies
  where schemaname = 'public' and tablename = 'employers'
    and policyname = 'staff can update employers'
    and cmd = 'UPDATE'
), 'staff employer review update policy exists');
select ok(exists (
  select 1 from pg_policies
  where schemaname = 'public' and tablename = 'verification_requests'
    and policyname = 'staff can review verification requests'
    and cmd = 'UPDATE'
), 'staff verification review policy exists');
select ok(exists (
  select 1 from pg_policies
  where schemaname = 'public' and tablename = 'job_posts'
    and policyname = 'staff can review jobs'
    and cmd = 'UPDATE'
), 'staff job review policy exists');
select ok(exists (
  select 1 from pg_policies
  where schemaname = 'public' and tablename = 'applications'
    and policyname = 'staff can update applications'
    and cmd = 'UPDATE'
), 'staff application review policy exists');
select ok(exists (
  select 1 from pg_policies
  where schemaname = 'public' and tablename = 'reports'
    and policyname = 'staff can review reports'
    and cmd = 'UPDATE'
), 'staff report review policy exists');
select ok(exists (
  select 1 from pg_policies
  where schemaname = 'public' and tablename = 'audit_logs'
    and policyname = 'admins can read audit logs'
    and cmd = 'SELECT'
), 'audit logs are readable through an admin-only policy');

-- India-wide job/employer schema used by the live discovery and posting clients.
select has_column('public', 'job_posts', 'state_lgd_code', 'job posts store official state LGD codes');
select has_column('public', 'job_posts', 'district_lgd_code', 'job posts store official district LGD codes');
select has_column('public', 'job_posts', 'employer_display_name', 'published jobs expose a safe business display name');
select has_column('public', 'employers', 'state_lgd_code', 'employers store official state LGD codes');
select has_column('public', 'employers', 'district_lgd_code', 'employers store official district LGD codes');
select has_column('public', 'employers', 'contact_person', 'employers store their contact person');
select has_column('public', 'verification_requests', 'state_lgd_code', 'verification requests store official state LGD codes');
select has_column('public', 'verification_requests', 'district_lgd_code', 'verification requests store official district LGD codes');

select ok(not exists (
  select 1 from pg_constraint
  where conrelid in ('public.profiles'::regclass, 'public.employers'::regclass,
    'public.verification_requests'::regclass, 'public.job_posts'::regclass)
    and conname in ('profiles_state_code_check', 'employers_state_code_check',
      'verification_requests_state_code_check', 'job_posts_state_code_check')
), 'legacy two-state checks no longer block India-wide state codes');

select ok(exists (
  select 1 from pg_policies
  where schemaname = 'public' and tablename = 'applications'
    and policyname = 'candidates can apply as themselves'
    and cmd = 'INSERT' and with_check like '%account_type%' 
), 'application insert policy restricts submissions to candidate accounts');

select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.applications'::regclass
    and tgname = 'notify_application_created' and not tgisinternal
), 'new applications trigger employer notifications');
select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.applications'::regclass
    and tgname = 'notify_application_status_changed' and not tgisinternal
), 'application status changes trigger candidate notifications');

select ok(
  not has_function_privilege('anon', 'public.notify_application_event()', 'EXECUTE')
  and not has_function_privilege('authenticated', 'public.notify_application_event()', 'EXECUTE'),
  'notification trigger function is not directly executable by client roles'
);

-- Every table whose reviewed fields are guarded must have its trigger installed.
select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.profiles'::regclass
    and tgname = 'protect_profile_role' and not tgisinternal
), 'profile role guard trigger exists');
select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.employers'::regclass
    and tgname = 'protect_employer_verification' and not tgisinternal
), 'employer verification guard trigger exists');
select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.verification_requests'::regclass
    and tgname = 'protect_verification_review' and not tgisinternal
), 'verification request guard trigger exists');
select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.job_posts'::regclass
    and tgname = 'protect_job_publication' and not tgisinternal
), 'job publication guard trigger exists');
select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.applications'::regclass
    and tgname = 'protect_application_status'
    and not tgisinternal
    and (tgtype & 4) = 4
    and (tgtype & 2) = 2
    and (tgtype & 16) = 16
), 'application guard runs before both INSERT and UPDATE');
select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.reports'::regclass
    and tgname = 'protect_report_status' and not tgisinternal
), 'report status guard trigger exists');
select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.notifications'::regclass
    and tgname = 'protect_notification_content' and not tgisinternal
), 'notification content guard trigger exists');

select * from finish();
rollback;
