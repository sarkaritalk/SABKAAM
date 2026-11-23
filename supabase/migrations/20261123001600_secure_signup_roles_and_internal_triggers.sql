-- Assign only the two self-service signup roles; privileged roles remain admin-managed.
-- The profile role is persisted in the protected profiles table and is not read from mutable metadata later.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'account_type' = 'employer'
        then 'employer'::public.account_role
      else 'candidate'::public.account_role
    end
  );
  return new;
end;
$function$;

-- These functions are invoked only by their attached database triggers, never as client RPCs.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
