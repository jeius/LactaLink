-- 1. Create the update function with field change checks
create or replace function public.update_public_user_on_auth_user_update () returns trigger language plpgsql security definer as $$
declare
  v_user record;
begin
  -- Load matching public user
  select * into v_user from public.users where auth_id = new.id;

  if not found then
    raise notice 'No matching public.users record found for auth_id %', new.id;
    return new;
  end if;

  -- Only update if values actually differ from what's stored
  update public.users
  set
    email = case when new.email is distinct from v_user.email then new.email else v_user.email end,
    email_confirmed_at = case when new.email_confirmed_at is distinct from v_user.email_confirmed_at then new.email_confirmed_at else v_user.email_confirmed_at end,
    phone = case when new.phone is distinct from v_user.phone then new.phone else v_user.phone end,
    phone_confirmed_at = case when new.phone_confirmed_at is distinct from v_user.phone_confirmed_at then new.phone_confirmed_at else v_user.phone_confirmed_at end,
    last_sign_in_at = case when new.last_sign_in_at is distinct from v_user.last_sign_in_at then new.last_sign_in_at else v_user.last_sign_in_at end,
    picture = case when new.raw_user_meta_data->>'picture' is distinct from v_user.picture then new.raw_user_meta_data->>'picture' else v_user.picture end,
    updated_at = new.updated_at
  where auth_id = new.id
    and (
      new.email is distinct from v_user.email or
      new.email_confirmed_at is distinct from v_user.email_confirmed_at or
      new.phone is distinct from v_user.phone or
      new.phone_confirmed_at is distinct from v_user.phone_confirmed_at or
      new.last_sign_in_at is distinct from v_user.last_sign_in_at or
      new.raw_user_meta_data->>'picture' is distinct from v_user.picture
    );

  return new;
end;
$$;

-- 2. Create the trigger on auth.users
create
or replace trigger trigger_update_public_user
after
update on auth.users for each row
execute function public.update_public_user_on_auth_user_update ();