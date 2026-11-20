-- MFD POS go-live changes (change list of 26–27 October 2026), applied to the data already in
-- the system. Every device picks them up at its next sync. Safe to run more than once.
--   1  delivery zones: MFD's 5 distance prices per load (6 m³), each with its code
--   2  products: new selling price, unit, cost and pallet price
--   3  Pave Bricks and Concrete Block removed
--   4  Water added (3 sizes), never out of stock
--   5  Pillar: one product on the till with 3 sizes (Small, Medium, Large)
--  10  cashier account removed for now
--   7  outstanding orders from Portia's report of 19 Oct (to recheck against the 30 Oct report)

do $$
declare
  o uuid;
  nid numeric;
  r record;
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

  -- 1. delivery zones (ids 1–5 reused, any other zone switched off)
  insert into public.zones (owner_id, id, data, deleted) values
    (o, '1', '{"id":1,"name":"0 – 10 km","fee":800,"code":"TRSVERZ"}', false),
    (o, '2', '{"id":2,"name":"11 – 20 km","fee":1090,"code":"TRS1VERZ"}', false),
    (o, '3', '{"id":3,"name":"21 – 40 km","fee":1390,"code":"TRS2VERZ"}', false),
    (o, '4', '{"id":4,"name":"41 – 60 km","fee":1990,"code":"TRS3VERZ"}', false),
    (o, '5', '{"id":5,"name":"61 – 80 km","fee":2290,"code":"TRS4VERZ"}', false)
  on conflict (owner_id, id) do update set data = excluded.data, deleted = false;
  update public.zones set deleted = true where owner_id = o and id not in ('1','2','3','4','5') and not deleted;

  -- 2. prices (matched by name). Bricks change from "per 1000" to "each": stock, alert level
  --    and cost are converted from thousands to single bricks once.
  update public.products set data = data
      || jsonb_build_object('stk', round((data->>'stk')::numeric * 1000), 'ls', round(coalesce((data->>'ls')::numeric,0) * 1000),
                            'cost', case when data->>'cost' is null then null else round((data->>'cost')::numeric / 1000, 4) end, 'unit', 'each')
    where owner_id = o and not deleted and data->>'unit' = 'per 1000'
      and lower(data->>'name') in ('stock bricks','maxi brick');
  update public.products set data = data || '{"up":1600,"cost":400,"unit":"load"}'
    where owner_id = o and not deleted and lower(data->>'name') in ('river sand','bou sand','paving sand');
  update public.products set data = data || '{"up":2.5,"bp":2.5,"bm":500,"unit":"each","pallet":{"qty":500,"price":1250}}'
    where owner_id = o and not deleted and lower(data->>'name') = 'stock bricks';
  update public.products set data = data || '{"up":4.3,"unit":"each","pallet":{"qty":500,"price":null}}'
    where owner_id = o and not deleted and lower(data->>'name') = 'maxi brick';
  update public.products set data = data || '{"up":120,"cost":105,"unit":"bag"}'
    where owner_id = o and not deleted and lower(data->>'name') = 'cement 50kg';
  update public.products set data = data || '{"up":300,"group":"Pillar","size":"Small"}'
    where owner_id = o and not deleted and lower(data->>'name') = 'pillar – small';
  update public.products set data = data || '{"up":400,"group":"Pillar","size":"Large"}'
    where owner_id = o and not deleted and lower(data->>'name') = 'pillar – large';

  -- 3. not sold any more
  update public.products set deleted = true
    where owner_id = o and not deleted and lower(data->>'name') in ('pave bricks','concrete block');

  -- 4 + 5. new products: Pillar – Medium and the 3 water sizes (each once)
  for r in select * from (values
      ('Pillar – Medium','concrete','each',350::numeric,'🏗️','Pillar','Medium',false),
      ('Water – 25 L','water','25 L',2::numeric,'💧','Water','25 L',true),
      ('Water – 200 L','water','200 L',10::numeric,'💧','Water','200 L',true),
      ('Water – 1,000 L','water','1,000 L',30::numeric,'💧','Water','1,000 L',true)
    ) as v(name, cat, unit, up, ico, grp, size, nostock)
  loop
    if not exists (select 1 from public.products where owner_id = o and not deleted and lower(data->>'name') = lower(r.name)) then
      select coalesce(max((data->>'id')::numeric), 0) + 1 into nid from public.products
        where owner_id = o and (data->>'id') ~ '^\d+$' and (data->>'id')::numeric < 1000000;
      insert into public.products (owner_id, id, data) values (o, nid::text, jsonb_build_object(
        'id', nid, 'name', r.name, 'cat', r.cat, 'unit', r.unit, 'up', r.up, 'bp', null, 'bm', null,
        'stk', 0, 'ls', case when r.nostock then 0 else 10 end, 'ico', r.ico, 'cost', null,
        'group', r.grp, 'size', r.size, 'noStock', r.nostock));
    end if;
  end loop;

  -- 10. only the owner uses the till for now
  update public.staff set deleted = true where owner_id = o and not deleted and data->>'role' = 'cashier';

  -- 7. outstanding orders (Portia, 19 Oct 2026): waiting for production and delivery
  for r in select * from (values
      ('DEL-R191026-1','Eric Matsikinya','Machele','[{"name":"Maxi Brick","qty":1000,"unit":"each"}]','Maxi Brick × 1,000'),
      ('DEL-R191026-2','Wisani Sithole','Mbhalati','[{"name":"Maxi Brick","qty":5000,"unit":"each"},{"name":"Stock Bricks","qty":3000,"unit":"each"}]','Maxi Brick × 5,000 + Stock Bricks × 3,000'),
      ('DEL-R191026-3','Melford Khosa','Tribal','[{"name":"Maxi Brick","qty":2567,"unit":"each"},{"name":"Stock Bricks","qty":1500,"unit":"each"}]','Maxi Brick × 2,567 + Stock Bricks × 1,500'),
      ('DEL-R191026-4','Donmind Bila','','[{"name":"Maxi Brick","qty":2500,"unit":"each"}]','Maxi Brick × 2,500'),
      ('DEL-R191026-5','TTE Groups','','[{"name":"Stock Bricks","qty":28000,"unit":"each"}]','Stock Bricks × 28,000')
    ) as v(id, cust, area, items, load)
  loop
    insert into public.deliveries (owner_id, id, data) values (o, r.id, jsonb_build_object(
      'id', r.id, 'cust', r.cust, 'phone', '', 'load', r.load, 'items', r.items::jsonb, 'addr', r.area,
      'driver', '', 'truck', '', 'date', '2026-10-19', 'reqDate', '', 'depart', '', 'ret', '', 'status', 'pending',
      'times', jsonb_build_object('pending', '2026-10-19T08:00:00+02:00'), 'slip', false, 'inv', '',
      'notes', 'Outstanding order from Portia''s report of 19 Oct 2026 (waiting for production). Still needed: phone number, amount already paid, delivery address. Recheck against the 30 Oct month-end report.'))
    on conflict (owner_id, id) do nothing;
    if not exists (select 1 from public.customers where owner_id = o and not deleted and lower(data->>'name') = lower(r.cust)) then
      select coalesce(max((data->>'id')::numeric), 0) + 1 into nid from public.customers
        where owner_id = o and (data->>'id') ~ '^\d+$' and (data->>'id')::numeric < 1000000;
      insert into public.customers (owner_id, id, data) values (o, nid::text, jsonb_build_object(
        'id', nid, 'name', r.cust, 'phone', '', 'addr', r.area, 'email', '', 'type', 'contact', 'credit', 0, 'balance', 0,
        'total', 0, 'purchaseCount', 0, 'lastPurchase', '', 'since', '2026-10-19', 'payments', '[]'::jsonb, 'txHistory', '[]'::jsonb));
    end if;
  end loop;
end
$$;
