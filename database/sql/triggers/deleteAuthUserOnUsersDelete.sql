-- 1. Create the trigger function
create or replace function public.delete_auth_user_on_public_user_delete()
returns trigger
language plpgsql
security definer
as $$
declare
  auth_user_exists boolean;
begin
  if old.auth_id is not null then
    -- Check if the auth user actually exists
    select exists (select 1 from auth.users where id = old.auth_id) into auth_user_exists;

    if auth_user_exists then
      delete from auth.users where id = old.auth_id;
    else
      raise warning 'Auth user with id % not found when deleting user %', old.auth_id, old.auth_id;
    end if;
  end if;

  return old;
end;
$$;



-- 2. Create the trigger on public.users
create or replace trigger trigger_delete_auth_user
after delete on public.users
for each row
execute function public.delete_auth_user_on_public_user_delete();
