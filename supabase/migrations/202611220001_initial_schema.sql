-- SABKAAM initial Supabase schema
-- Apply with Supabase CLI or SQL Editor only after reviewing in the project.
-- No secrets or user data belong in this file.

create extension if not exists pgcrypto;

create type public.account_role as enum ('candidate', 'employer', 'moderator', 'admin');
create type public.job_status as enum ('draft', 'pending_review', 'published', 'paused', 'closed', 'rejected');
create type public.work_type as enum ('full_time', 'part_time', 'daily_wage', 'contract', 'work_from_home', 'freelance', 'internship');
create type public.application_status as enum ('submitted', 'viewed', 'shortlisted', 'interview', 'hired', 'rejected', 'withdrawn');
create type public.verification_status as enum ('pending', 'in_review', 'approved', 'rejected', 'needs_information');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.account_role not null default 'candidate',
  full_name text,
  phone text,
  preferred_language text not null default 'hi',
  district text,
  state_code text check (state_code in ('BR', 'JH')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.employers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  business_name text not null,
  business_type text,
  contact_phone text,
  district text,
  state_code text check (state_code in ('BR', 'JH')),
  address text,
  verification_status public.verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  status public.verification_status not null default 'pending',
  business_name text not null,
  business_type text,
  contact_phone text,
  district text,
  state_code text check (state_code in ('BR', 'JH')),
  address text,
  reviewer_notes text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.job_posts (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  title text not null,
  category text not null,
  description text not null,
  work_type public.work_type not null,
  state_code text not null check (state_code in ('BR', 'JH')),
  district text not null,
  town_or_market text,
  locality text,
  salary_min numeric(12,2) check (salary_min is null or salary_min >= 0),
  salary_max numeric(12,2) check (salary_max is null or salary_max >= 0),
  salary_period text,
  vacancies integer not null default 1 check (vacancies > 0),
  qualification text,
  experience text,
  food_or_stay text,
  status public.job_status not null default 'draft',
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (salary_min is null or salary_max is null or salary_max >= salary_min)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_posts(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  experience text,
  message text,
  status public.application_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, candidate_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.job_posts(id) on delete set null,
  employer_id uuid references public.employers(id) on delete set null,
  reason text not null,
  details text,
  contact_phone text,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null default 'general',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index job_posts_discovery_idx on public.job_posts (state_code, district, status, created_at desc);
create index job_posts_employer_idx on public.job_posts (employer_id, created_at desc);
create index applications_candidate_idx on public.applications (candidate_id, created_at desc);
create index applications_job_idx on public.applications (job_id, created_at desc);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index reports_status_idx on public.reports (status, created_at);

-- Create a candidate profile automatically when Supabase Auth creates a user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS everywhere. Access is granted explicitly below.
alter table public.profiles enable row level security;
alter table public.employers enable row level security;
alter table public.verification_requests enable row level security;
alter table public.job_posts enable row level security;
alter table public.applications enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles are readable by their owner"
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy "profiles can be created by their owner"
on public.profiles for insert to authenticated
with check (id = (select auth.uid()));

create policy "profiles can be updated by their owner"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "employers are readable by their owner"
on public.employers for select to authenticated
using (owner_id = (select auth.uid()));

create policy "users can create their own employer record"
on public.employers for insert to authenticated
with check (owner_id = (select auth.uid()));

create policy "employers can update their own record"
on public.employers for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "employer owners can read verification requests"
on public.verification_requests for select to authenticated
using (exists (
  select 1 from public.employers e
  where e.id = employer_id and e.owner_id = (select auth.uid())
));

create policy "employer owners can submit verification requests"
on public.verification_requests for insert to authenticated
with check (exists (
  select 1 from public.employers e
  where e.id = employer_id and e.owner_id = (select auth.uid())
));

create policy "published jobs are publicly readable"
on public.job_posts for select to anon, authenticated
using (status = 'published');

create policy "employers can read their own jobs"
on public.job_posts for select to authenticated
using (exists (
  select 1 from public.employers e
  where e.id = employer_id and e.owner_id = (select auth.uid())
));

create policy "employers can create their own jobs"
on public.job_posts for insert to authenticated
with check (exists (
  select 1 from public.employers e
  where e.id = employer_id and e.owner_id = (select auth.uid())
));

create policy "employers can update their own jobs"
on public.job_posts for update to authenticated
using (exists (
  select 1 from public.employers e
  where e.id = employer_id and e.owner_id = (select auth.uid())
))
with check (exists (
  select 1 from public.employers e
  where e.id = employer_id and e.owner_id = (select auth.uid())
));

create policy "candidates can read their applications"
on public.applications for select to authenticated
using (
  candidate_id = (select auth.uid())
  or exists (
    select 1 from public.job_posts j
    join public.employers e on e.id = j.employer_id
    where j.id = job_id and e.owner_id = (select auth.uid())
  )
);

create policy "candidates can apply as themselves"
on public.applications for insert to authenticated
with check (
  candidate_id = (select auth.uid())
  and exists (select 1 from public.job_posts j where j.id = job_id and j.status = 'published')
);

create policy "candidates can update their own application"
on public.applications for update to authenticated
using (candidate_id = (select auth.uid()))
with check (candidate_id = (select auth.uid()));

create policy "reporters can submit reports"
on public.reports for insert to authenticated
with check (reporter_id = (select auth.uid()));

create policy "reporters can read their own reports"
on public.reports for select to authenticated
using (reporter_id = (select auth.uid()));

create policy "users can read their own notifications"
on public.notifications for select to authenticated
using (user_id = (select auth.uid()));

create policy "users can mark their own notifications read"
on public.notifications for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- audit_logs intentionally has no client policies: server-side trusted writes only.
