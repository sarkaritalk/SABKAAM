-- Add the candidate profile fields used by the application and validate Indian mobile numbers.
-- All columns are nullable so existing accounts remain valid and profiles can be completed gradually.
alter table public.profiles
  add column if not exists skills text,
  add column if not exists preferred_work_type text,
  add column if not exists state_lgd_code integer,
  add column if not exists district_lgd_code integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_state_lgd_code_positive_check'
  ) then
    alter table public.profiles
      add constraint profiles_state_lgd_code_positive_check
      check (state_lgd_code is null or state_lgd_code > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_district_lgd_code_positive_check'
  ) then
    alter table public.profiles
      add constraint profiles_district_lgd_code_positive_check
      check (district_lgd_code is null or district_lgd_code > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_phone_indian_mobile_check'
  ) then
    alter table public.profiles
      add constraint profiles_phone_indian_mobile_check
      check (
        phone is null
        or btrim(phone) = ''
        or phone ~ '^[6-9][0-9]{9}$'
      );
  end if;
end
$$;
