-- Store candidate skills and preferred work type on their profile.
alter table public.profiles
  add column if not exists skills text,
  add column if not exists preferred_work_type text;
