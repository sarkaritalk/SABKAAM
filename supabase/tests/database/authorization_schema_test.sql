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
  (select p.proconfig @> array['search_path=']::text[]
   from pg_proc p
   where p.oid = to_regprocedure('public.is_sabkaam_staff()')),
  'staff helper pins an empty search_path'
);
select ok(
  (select p.proconfig @> array['search_path=']::text[]
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
