-- 1. Create trigger function
create or replace function public.insert_public_user_on_auth_user_insert()
returns trigger
language plpgsql
security definer
as $$
declare
  existing_auth_id uuid;
  existing_email varchar;
begin
  -- Check if a user already exists with the same email
  select auth_id, email into existing_auth_id, existing_email
  from public.users
  where email = new.email;

  if existing_email = new.email then
    if existing_auth_id = new.id then
      -- Same auth_id, no action needed
      return new;
    elsif existing_auth_id is null then
      -- Email exists but auth_id is null, so update the auth_id
      update public.users
      set auth_id = new.id, updated_at = new.updated_at
      where email = new.email
      and auth_id is null; -- ensure only if still NULL
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
