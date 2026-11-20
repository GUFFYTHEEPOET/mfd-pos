-- MFD POS go-live: clear every test record, keep what was just added. Run once, after
-- 20261027120000_mfd_price_list_zones_orders.sql. Safe to run again (it clears again).
--   deleted: sales, quotes, deliveries, purchases, returns, cash-ups, held sales, yard reports,
--            customers, suppliers, the activity log and every sign-in except the owner
--   kept:    products, prices, stock levels and stock history, the 5 delivery zones, company
--            settings, the owner sign-in, the 5 outstanding orders of 19 Oct with their customers,
--            Portia's yard reports of 21–23 Oct and the workers / PPE list
-- Each till clears its own copy at its next sync (also records it never sent), and invoice,
-- quote and delivery numbers start again at 001.

do $$
declare
  o uuid;
  at text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  t text;
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

  -- everything in these lists is test data
  foreach t in array array['sales','quotes','purchases','returns','cashups','held_sales','audit_log','suppliers'] loop
    execute format('update public.%I set deleted = true where owner_id = $1 and not deleted', t) using o;
  end loop;

  -- yard reports: only Portia's reports of 21–23 Oct 2026 stay (…_products_ppe_yard_report.sql)
  update public.yard_reports set deleted = true
   where owner_id = o and not deleted and id !~ '^RPT-R2[123]1026-';

  -- deliveries: only the 5 outstanding orders stay
  update public.deliveries set deleted = true
   where owner_id = o and not deleted and id !~ '^DEL-R191026-\d+$';

  -- customers: only the people on those orders stay
  update public.customers set deleted = true
   where owner_id = o and not deleted
     and lower(trim(coalesce(data->>'name', ''))) not in (
       select lower(trim(coalesce(d.data->>'cust', ''))) from public.deliveries d
        where d.owner_id = o and not d.deleted and d.id ~ '^DEL-R191026-\d+$');

  -- sign-ins: only the owner stays
  update public.staff set deleted = true
   where owner_id = o and not deleted and coalesce(data->>'role', '') <> 'admin';

  -- numbering starts again, the shift is closed
  update public.store_settings set data = data || '{"nextTxId":1,"nextQId":1,"nextDelId":1,"nextCustId":1,"nextPurchId":1,
      "nextSupplierId":1,"nextReturnId":1,"nextAuditId":1,"nextHeldId":1,"nextRptId":1}'::jsonb
   where owner_id = o and id = 'counters';
  insert into public.store_settings (owner_id, id, data, deleted)
    values (o, 'shift', jsonb_build_object('shift', jsonb_build_object('open', false), 'shiftStartTime', at), false)
  on conflict (owner_id, id) do update set data = excluded.data, deleted = false;

  -- the clear marker: each till that last synced before it clears its own copy the same way
  insert into public.store_settings (owner_id, id, data, deleted)
    values (o, 'meta', jsonb_build_object('lastWeekly', null, 'wipe',
      jsonb_build_object('at', at, 'keepReal', true, 'renum', true, 'staff', true, 'by', 'Go-live')), false)
  on conflict (owner_id, id) do update
    set data = coalesce(public.store_settings.data, '{}'::jsonb) || excluded.data, deleted = false;
end
$$;
