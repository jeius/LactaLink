-- 1. Create the trigger function
create or replace function public.delete_auth_user_on_public_user_soft_delete()
returns trigger
language plpgsql
security definer
as $$
declare
  auth_user_exists boolean;
begin
  -- Only proceed when deleted_at transitions from NULL to non-NULL
  if new.deleted_at is null or old.deleted_at is not null then
    return old;
  end if;

  if old.auth_id is not null then
    -- Check if the auth user actually exists
    select exists (select 1 from auth.users where id = old.auth_id) into auth_user_exists;

    if auth_user_exists then
      delete from auth.users where id = old.auth_id;
    else
      raise warning 'Auth user with id % not found when deleting user %', old.auth_id, old.auth_id;
    end if;

    -- Clear the auth_id reference so it doesn't point to a non-existing auth user
    update public.users set auth_id = null where id = old.id;
  end if;

  return old;
end;
$$;



-- 2. Create the trigger on public.users
create or replace trigger trigger_delete_auth_user_on_public_user_soft_delete
after update on public.users
for each row
when (new.deleted_at is not null and old.deleted_at is null)
execute function public.delete_auth_user_on_public_user_soft_delete();
