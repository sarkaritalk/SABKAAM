-- Validate Indian mobile numbers at the database boundary as well as in the profile form.
-- Empty values remain allowed for accounts that have not completed their candidate profile.
alter table public.profiles
  add constraint profiles_phone_indian_mobile_check
  check (
    phone is null
    or btrim(phone) = ''
    or phone ~ '^[6-9][0-9]{9}$'
  );
