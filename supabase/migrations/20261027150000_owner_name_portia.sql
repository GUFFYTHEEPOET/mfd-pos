-- The owner's name on every till, receipt, invoice, quote, yard report and WhatsApp message
-- ("Kind regards, …") becomes Portia. Each till shows the new name at its next sync.
-- Safe to run more than once.

do $$
declare o uuid;
begin
  -- MFD's account: the one the owner signs in with (portiamfd@gmail.com); else the oldest owner
  select s.owner_id into o from public.staff s join auth.users u on u.id = s.owner_id
   where not s.deleted and s.data->>'role' = 'admin' and lower(u.email) = 'portiamfd@gmail.com'
   order by s.updated_at limit 1;
  if o is null then
    select owner_id into o from public.staff
     where not deleted and data->>'role' = 'admin' order by updated_at limit 1;
  end if;
  if o is null then raise exception 'No MFD owner in the cloud yet: sign in on the main till first.'; end if;
  update public.staff set data = data || '{"name":"Portia"}'::jsonb
   where owner_id = o and not deleted and data->>'role' = 'admin';
end
$$;

-- check: select id, data->>'name' as name, data->>'email' as email, data->>'role' as role from public.staff where not deleted;
