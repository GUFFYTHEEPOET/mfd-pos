-- MFD POS: one owner account only.
-- "Create the owner account" asks this before creating anything. It answers only
-- yes/no (does the shop already have an owner? does this email already have a login?)
-- and never returns any account data.

create or replace function public.mfd_account_check(p_email text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'owner', exists (
      select 1 from public.staff s
      where not s.deleted
        and s.data->>'role' = 'admin'
        and coalesce(s.data->>'pwHash', '') <> ''
    ),
    'email', exists (
      select 1 from public.staff s
      where not s.deleted
        and lower(s.data->>'email') = lower(trim(coalesce(p_email, '')))
        and trim(coalesce(p_email, '')) <> ''
    )
  );
$$;

revoke all on function public.mfd_account_check(text) from public;
grant execute on function public.mfd_account_check(text) to anon, authenticated;
