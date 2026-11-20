-- MFD POS go-live, part 2 (MFD's confirmation form, price list, Portia's WhatsApp, PPE list and
-- the Master Daily Report of 23 Oct 2026). Every device picks it up at its next sync.
-- Run after 20261027120000_mfd_price_list_zones_orders.sql. Safe to run more than once.
--   products: Cement R122 (cost R119) · Maxi Brick pallet of 250 for R1,075 · Water 20 L (was 25 L)
--             · building materials (Concrete 7.5 ton and the per-ton list) are not sold: removed if added before
--   workers:  the PPE list (work suit and boot sizes) — new table
--   yard:     Portia's reports of 21, 22 and 23 Oct 2026 (the Master Daily Report of 23 Oct included)

-- 1. the workers / PPE list is stored and synced like every other MFD POS record
create table if not exists public.workers (
  owner_id uuid not null default auth.uid(),
  id text not null,
  data jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (owner_id, id)
);
alter table public.workers enable row level security;
drop policy if exists "Users manage their own rows" on public.workers;
create policy "Users manage their own rows" on public.workers
  for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
grant select, insert, update on public.workers to authenticated;
drop trigger if exists set_updated_at on public.workers;
create trigger set_updated_at before update on public.workers
  for each row execute function public.mfd_pos_set_updated_at();

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

  -- 2. prices from the returned confirmation form
  update public.products set data = data || '{"up":122,"cost":119,"unit":"bag"}'
    where owner_id = o and not deleted and lower(data->>'name') = 'cement 50kg';
  update public.products set data = data || '{"up":4.3,"unit":"each","bp":4.3,"bm":250,"pallet":{"qty":250,"price":1075}}'
    where owner_id = o and not deleted and lower(data->>'name') = 'maxi brick';
  update public.products set data = data || '{"name":"Water – 20 L","unit":"20 L","size":"20 L","up":2,"noStock":true}'
    where owner_id = o and not deleted and lower(data->>'name') = 'water – 25 l';

  -- 3. building materials are not sold through the POS: Concrete 7.5 ton and the materials sold per
  --    ton (crusher stone, river stones, riversand, concrete mixes, filling, gabion, dump rock, crusher
  --    dust, building sand) are removed if an earlier run of this file added them
  update public.products set deleted = true
    where owner_id = o and not deleted and data->>'cat' = 'stone';

  -- 4. the PPE list of 23 Oct 2026 (Portia). Nos. 11 and 24 are not on the list.
  insert into public.workers (owner_id, id, data)
  select o, w.no::text, jsonb_build_object('id', w.no, 'no', w.no, 'name', w.name, 'suit', w.suit, 'boots', w.boots, 'note', '')
    from (values
      (1,'Lordwish Mphaphuli','34','8'),(2,'Prince Mulambo','30','6'),(3,'Simbarashe Katsuro','32','9'),
      (4,'Labani Mathebula','32','10'),(5,'Sedzani Ramukhuvhathi','32','9'),(6,'Wayne Martin','32','8'),
      (7,'Elias Makamu','30','7'),(8,'Innocent Mucheki','30','12'),(9,'Ndou Khuliso','32','9'),
      (10,'Muronga Thinandavha','30','7'),(12,'Vonani Khosa','38','6'),(13,'Ndlovu Peter','34','10'),
      (14,'Chauke Phylls','28','4'),(15,'Mukondi Mabasa','28','5'),(16,'Amukelani Mathebula','36','4'),
      (17,'Elvis Mulaudzi','30','7'),(18,'Days Diesel','32','9'),(19,'Peter Dzivhani','32','9'),
      (20,'Mashau Nthatheni','34','8'),(21,'Kuhlula Zitha','34','7'),(22,'Matsokoto Matsokoto','34','9'),
      (23,'Thendo Mulaudzi','40','10'),(25,'Masindi Murunwa','30','8'),(26,'Nakonde Enock','34','7'),
      (27,'Shandukani Mphephu','30','7'),(28,'Remember Mathebula','30','8')
    ) as w(no, name, suit, boots)
  on conflict (owner_id, id) do nothing;
  update public.store_settings set data = data || jsonb_build_object('nextWorkerId',
      greatest(coalesce((data->>'nextWorkerId')::numeric, 1), 29))
   where owner_id = o and id = 'counters';
  -- everything for the boss goes to the boss WhatsApp 075 258 4582
  update public.store_settings set data = data || '{"ownerWa":"075 258 4582"}'::jsonb
   where owner_id = o and id = 'settings';
  update public.store_settings set data = data || '{"ppeNote":"Tiyani is not included: size not known yet."}'::jsonb
   where owner_id = o and id = 'settings' and coalesce(data->>'ppeNote', '') = '';

  -- 5. Master Daily Report, 23 Oct 2026 (imported: it does not change stock)
  insert into public.yard_reports (owner_id, id, data) values (o, 'RPT-R231026-F', $j${
    "id":"RPT-R231026-F","type":"final","date":"2026-10-23","time":"2026-10-23T17:00:00+02:00","by":"Portia",
    "to":"Mr Mufamadi — The Boss","imported":true,"stockApplied":{},
    "absent":["Tiyani","Vukosi"],"leave":["Prince (requested leave from 13:00)"],
    "bays":[
      {"name":"Bay 1","machine":"working","acts":[],"pid":"","produced":5310,"cement":65,"sand":4,"note":"Watered — 2 machines"},
      {"name":"Bay 2","machine":"working","acts":[],"pid":"","produced":5456,"cement":34,"sand":4,"note":"Watered — 1 machine"}],
    "fuel":[{"driver":"Solly","amount":1001.89,"litres":28.35,"invoice":"129784"}],
    "money":[
      {"who":"Tshilowa Khodani","amount":2000,"spent":"Petrol transport — used R1,530 (invoice 129750)","change":470},
      {"who":"Innocent Tshikalange","amount":"","spent":"ULP93 45.01 L — R1,377.76","change":""},
      {"who":"Solly","amount":1600,"spent":"Diesel","change":""},
      {"who":"Solly","amount":1800,"spent":"Diesel 2 sand","change":""}],
    "shortages":"Packing materials shortage — status: not safe.",
    "complaints":[{"name":"Richard Masungo","contact":"083 524 3498","complaint":"Stock Bricks – 6 pallets (3,000 bricks) not good quality. Customer very angry, came to the office.","action":"Urgent management attention required"}],
    "issues":"Money handling — status: not safe. Total handled R5,400 · change R470 · spent R4,930.",
    "notes":"Diesel for the truck (driver Solly), 3 occasions, average R333.96 per occasion. Bottom Line Trading t/a Global Crossroads, VAT no. 4600262929, 23 Oct 2026 09:15:52, pump 8, nozzle 1, DSL50, R35.34 per litre, paid in cash.\nPPE distributed to 28 workers — work suits: 28×2 · 30×8 · 32×9 · 34×6 · 36×1 · 38×1 · 40×1; boots: 4×2 · 5×1 · 6×2 · 7×6 · 8×6 · 9×7 · 10×3 · 12×1."
  }$j$::jsonb)
  on conflict (owner_id, id) do nothing;
  -- 6. Portia's reports of 21–22 Oct 2026 (imported: they do not change stock). The 21 Oct report carries
  --    the payment and deliveries of that day inside it, as on her sheet.
  insert into public.yard_reports (owner_id, id, data) values
  (o, 'RPT-R211026-F', $j${"id":"RPT-R211026-F","type":"final","date":"2026-10-21","time":"2026-10-21T16:30:00+02:00","by":"Portia",
     "to":"The Boss – M.F.D Bricks and Sand Supply","imported":true,"absent":[],"stockApplied":{},
     "bays":[{"name":"Bay 1","machine":"working","acts":[],"pid":"","produced":5200,"cement":60,"note":"Bricks watered, others are not watered but they will water them before knocking off. Production ongoing."},
             {"name":"Bay 2","machine":"working","acts":[],"pid":"","produced":6400,"cement":37,"note":""}],
     "snap":{"payments":[{"cust":"Manyatsha Mukondi","today":40000,"before":10000,"totalPaid":50000,"remaining":41150,"previous":91150}],
             "deliveries":[{"cust":"Maungedzo","loads":1,"what":"Sand"},{"cust":"Mutanda Solly","loads":5,"what":"Sand"}],"sandLoads":6},
     "issues":"","notes":"Final Combined Daily Report – all updates including Bay 1 & Bay 2. Client payment (Manyatsha Mukondi): payment received. MFD Brickyard total: 6 loads (no prices on the report)."}$j$::jsonb),
  (o, 'RPT-R221026-M', $j${"id":"RPT-R221026-M","type":"morning","date":"2026-10-22","time":"2026-10-22T08:30:00+02:00","by":"Portia",
     "to":"The Boss – M.F.D Bricks and Sand Supply","imported":true,"absent":["Khuliso Ndou","Remember","Vukosi"],
     "bays":[{"name":"Bay 1","machine":"working","acts":["mixing","producing","watering","packing"],"note":"Production ongoing, all activities active"},
             {"name":"Bay 2","machine":"working","acts":["packing","mixing","producing"],"note":"Workers were watering the bricks – now stopped: the hose pipe is being used by the builders"}],
     "issues":"Shortage of water: the water supply is supplying 2 places (brickyard and builders). Production continues with the available water; packing and mixing in progress.","notes":"Absenteeism: 3 workers absent today."}$j$::jsonb),
  (o, 'RPT-R221026-A', $j${"id":"RPT-R221026-A","type":"afternoon","date":"2026-10-22","time":"2026-10-22T14:00:00+02:00","by":"Portia",
     "to":"The Boss – M.F.D Bricks and Sand Supply","imported":true,"absent":["Khuliso Ndou","Remember","Vukosi"],
     "bays":[{"name":"Bay 1","machine":"working","acts":["mixing","producing","watering","packing"],"note":"Morning: mixing sand and cement, producing, watering and packing bricks"},
             {"name":"Bay 2","machine":"repair","acts":["packing","mixing","producing"],"note":"1 machine was not working properly. The mechanic is currently fixing it – under repair."}],
     "issues":"Bay 2: machine under repair. Morning: Bay 2 watering stopped temporarily – hose pipe used by builders – water shortage (supplying 2 places).",
     "notes":"Afternoon site inspection – just now: workers are busy packing the bricks on the pallets, wrapping them and watering them. (Absent: from the morning report.)"}$j$::jsonb),
  (o, 'RPT-R221026-U', $j${"id":"RPT-R221026-U","type":"update","date":"2026-10-22","time":"2026-10-22T15:30:00+02:00","by":"Portia",
     "to":"The Boss – M.F.D Bricks and Sand Supply","imported":true,"absent":[],
     "bays":[{"name":"Bay 2","machine":"stopped","acts":["mixing","watering","packing"],"note":"No machine is operating at the moment. Workers are mixing sand and cement, watering the bricks; others are packing the bricks."}],
     "issues":"Bay 2: machines not operating – manual activities (mixing, watering, packing) ongoing.","notes":""}$j$::jsonb)
  on conflict (owner_id, id) do nothing;

  -- 7. the 5 outstanding orders: the internal reminder ("Still needed: phone number…") printed on the
  --    customer's delivery note, so it is taken off (only if it was not changed since)
  update public.deliveries set data = data || '{"notes":""}'::jsonb
   where owner_id = o and not deleted and id ~ '^DEL-R191026-\d+$'
     and data->>'notes' like 'Outstanding order from Portia''s report of 19 Oct 2026%';
end
$$;
