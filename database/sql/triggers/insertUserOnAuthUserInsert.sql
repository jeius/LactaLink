-- 1. Create trigger function
create or replace function public.insert_public_user_on_auth_user_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_user_id uuid;
  existing_auth_id uuid;
begin
  -- Check if a user already exists with the same email
  select id, auth_id into existing_user_id, existing_auth_id
  from public.users
  where lower(email) = lower(new.email)
  limit 1;

  if existing_user_id is not null then
    if existing_auth_id = new.id then
      -- Same auth_id, no action needed
      return new;
    elsif existing_auth_id is null then
      -- Re-register a previously deleted account as a fresh account.
      update public.users
      set auth_id = new.id,
          deleted_at = null,
          phone = null,
          profile_type = 'INDIVIDUAL',
          role = 'AUTHENTICATED',
          updated_at = new.updated_at
      where id = existing_user_id;

      -- Remove the relationship to the old soft-deleted profile so the app
      -- sends the user through profile setup again.
      delete from public.users_rels
      where parent_id = existing_user_id and path = 'profile';
    else
      -- Email exists and auth_id belongs to another user, throw error
      raise exception 'Email % is already associated with another user.', new.email
        using errcode = 'unique_violation';
    end if;
  else
    -- If no user with that email, insert new user
    insert into public.users (auth_id, email)
    values (new.id, new.email);
  end if;

  return new;
end;
$$;


-- 2. Create trigger
create or replace trigger trigger_insert_public_user
after insert on auth.users
for each row
execute function public.insert_public_user_on_auth_user_insert();
