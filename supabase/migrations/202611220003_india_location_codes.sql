-- Expand SABKAAM location references from Bihar/Jharkhand to all India.
-- Existing text state_code values remain valid for backward compatibility.
-- New writes should store the official LGD identifiers in the *_lgd_code columns.

alter table public.profiles
  drop constraint if exists profiles_state_code_check,
  add column if not exists state_lgd_code integer,
  add column if not exists district_lgd_code integer;

alter table public.employers
  drop constraint if exists employers_state_code_check,
  add column if not exists state_lgd_code integer,
  add column if not exists district_lgd_code integer;

alter table public.verification_requests
  drop constraint if exists verification_requests_state_code_check,
  add column if not exists state_lgd_code integer,
  add column if not exists district_lgd_code integer;

alter table public.job_posts
  drop constraint if exists job_posts_state_code_check,
  add column if not exists state_lgd_code integer,
  add column if not exists district_lgd_code integer;

-- Use the same constraint names as the candidate-profile migration. The live
-- project already has the profile checks under these names, so skip them
-- rather than creating duplicate equivalent constraints.
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.profiles'::regclass and conname = 'profiles_state_lgd_code_positive_check') then
    alter table public.profiles add constraint profiles_state_lgd_code_positive_check check (state_lgd_code is null or state_lgd_code > 0);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.profiles'::regclass and conname = 'profiles_district_lgd_code_positive_check') then
    alter table public.profiles add constraint profiles_district_lgd_code_positive_check check (district_lgd_code is null or district_lgd_code > 0);
  end if;

  if not exists (select 1 from pg_constraint where conrelid = 'public.employers'::regclass and conname = 'employers_state_lgd_code_positive_check') then
    alter table public.employers add constraint employers_state_lgd_code_positive_check check (state_lgd_code is null or state_lgd_code > 0);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.employers'::regclass and conname = 'employers_district_lgd_code_positive_check') then
    alter table public.employers add constraint employers_district_lgd_code_positive_check check (district_lgd_code is null or district_lgd_code > 0);
  end if;

  if not exists (select 1 from pg_constraint where conrelid = 'public.verification_requests'::regclass and conname = 'verification_requests_state_lgd_code_positive_check') then
    alter table public.verification_requests add constraint verification_requests_state_lgd_code_positive_check check (state_lgd_code is null or state_lgd_code > 0);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.verification_requests'::regclass and conname = 'verification_requests_district_lgd_code_positive_check') then
    alter table public.verification_requests add constraint verification_requests_district_lgd_code_positive_check check (district_lgd_code is null or district_lgd_code > 0);
  end if;

  if not exists (select 1 from pg_constraint where conrelid = 'public.job_posts'::regclass and conname = 'job_posts_state_lgd_code_positive_check') then
    alter table public.job_posts add constraint job_posts_state_lgd_code_positive_check check (state_lgd_code is null or state_lgd_code > 0);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.job_posts'::regclass and conname = 'job_posts_district_lgd_code_positive_check') then
    alter table public.job_posts add constraint job_posts_district_lgd_code_positive_check check (district_lgd_code is null or district_lgd_code > 0);
  end if;
end
$$;

create index if not exists job_posts_lgd_discovery_idx
  on public.job_posts (state_lgd_code, district_lgd_code, status, created_at desc);

create index if not exists profiles_lgd_location_idx
  on public.profiles (state_lgd_code, district_lgd_code);

-- Do not infer or rewrite existing Bihar/Jharkhand identifiers automatically:
-- map old values to official LGD codes in a reviewed data migration when
-- real user records exist.
