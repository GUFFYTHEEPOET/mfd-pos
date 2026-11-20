-- Make MFD's cloud sign-in (Supabase → Authentication → Users) the same as the owner's POS login.
-- The cloud sign-in is a user INSIDE this project, not the login you use for supabase.com.
-- Run in the SQL Editor after typing the owner's POS password between the quotes below.
-- It changes the user that holds MFD's data (found through the owner record), confirms the
-- email straight away (no confirmation link) and cancels any email change still waiting.

do $$
declare
  new_email text := 'portiamfd@gmail.com';
  new_pw    text := 'TYPE-THE-OWNER-POS-PASSWORD-HERE';
  u uuid;
  other uuid;
begin
  if new_pw = 'TYPE-THE-OWNER-POS-PASSWORD-HERE' or length(new_pw) < 8 then
    raise exception 'Type the owner''s POS password (at least 8 characters) in new_pw first.';
  end if;

  select owner_id into u from public.staff
   where not deleted and data->>'role' = 'admin' order by updated_at limit 1;
  if u is null or not exists (select 1 from auth.users where id = u) then
    raise exception 'The cloud user that holds MFD''s data was not found.';
  end if;

  -- this email already has its own cloud account
  select id into other from auth.users where lower(email) = lower(new_email) and id <> u;
  if other is not null then
    if exists (select 1 from public.staff where owner_id = other and not deleted) then
      -- it already holds MFD's owner record: that is the account to use, nothing to change here
      raise exception 'The cloud account % already exists and holds an MFD owner record: sign in with it (Settings → Cloud database). Nothing was changed.', new_email;
    end if;
    raise exception 'Another cloud user (%) already uses % but holds no MFD data. Delete it in Authentication → Users, then run this again.', other, new_email;
  end if;

  update auth.users set
      email = new_email,
      encrypted_password = extensions.crypt(new_pw, extensions.gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      email_change = '', email_change_token_new = '', email_change_token_current = '',
      email_change_confirm_status = 0,
      updated_at = now()
    where id = u;

  update auth.identities set
      identity_data = identity_data || jsonb_build_object('email', new_email, 'email_verified', true),
      updated_at = now()
    where user_id = u and provider = 'email';

  raise notice 'Cloud sign-in is now % with the owner''s POS password.', new_email;
end
$$;

-- check (shows no password):
-- select id, email, email_confirmed_at, email_change from auth.users;
