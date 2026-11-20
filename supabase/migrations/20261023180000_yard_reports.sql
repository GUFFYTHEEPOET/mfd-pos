-- MFD POS: the Yard Reports table. Safe to run more than once.
-- (The sample records from Portia's reports of 21–22 October that used to be added here were removed:
-- the live system starts with only the data in the go-live price-list file.)

-- 1. Yard reports are stored and synced like every other MFD POS record
create table if not exists public.yard_reports (
  owner_id uuid not null default auth.uid(),
  id text not null,
  data jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (owner_id, id)
);
alter table public.yard_reports enable row level security;
drop policy if exists "Users manage their own rows" on public.yard_reports;
create policy "Users manage their own rows" on public.yard_reports
  for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
grant select, insert, update on public.yard_reports to authenticated;
drop trigger if exists set_updated_at on public.yard_reports;
create trigger set_updated_at before update on public.yard_reports
  for each row execute function public.mfd_pos_set_updated_at();
