-- Allow users to choose candidate or employer at signup.
-- Privileged moderator/admin roles remain impossible to self-select.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.account_role;
begin
  v_role := case
    when new.raw_user_meta_data ->> 'account_type' = 'employer'
      then 'employer'::public.account_role
    else 'candidate'::public.account_role
  end;

  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;
