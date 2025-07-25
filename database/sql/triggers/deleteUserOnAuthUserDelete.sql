-- 1. Create the trigger function
create or replace function public.delete_public_user_on_auth_user_delete()
returns trigger
language plpgsql
security definer
as $$
declare
  public_user_exists boolean;
begin
  if old.id is not null then
    -- Check if the public user actually exists
    select exists (select 1 from public.users where auth_id = old.id) into public_user_exists;

    if public_user_exists then
      delete from public.users where auth_id = old.id;
    else
      raise warning 'Public user with auth_id % not found when deleting user %', old.id, old.id;
    end if;
  end if;

  return old;
end;
$$;



-- 2. Create the trigger on public.users
create or replace trigger trigger_delete_public_user
after delete on auth.users
for each row
execute function public.delete_public_user_on_auth_user_delete();
