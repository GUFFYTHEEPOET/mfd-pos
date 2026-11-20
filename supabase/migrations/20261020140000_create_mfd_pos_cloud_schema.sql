-- MFD POS cloud sync schema.
-- Apply this migration to the Supabase project before connecting the app.
-- The app authenticates users and stores its Supabase URL/key in its own
-- Settings; no project keys belong in this file.

do $$
declare
  table_name text;
  table_names text[] := array[
    'staff',
    'products',
    'customers',
    'suppliers',
    'zones',
    'sales',
    'quotes',
    'deliveries',
    'purchases',
    'returns',
    'cashups',
    'stock_adjustments',
    'held_sales',
    'audit_log',
    'store_settings'
  ];
begin
  foreach table_name in array table_names loop
    execute format(
      'create table if not exists public.%I (
        owner_id uuid not null default auth.uid(),
        id text not null,
        data jsonb not null,
        deleted boolean not null default false,
        updated_at timestamptz not null default now(),
        primary key (owner_id, id)
      )',
      table_name
    );

    execute format(
      'alter table public.%I enable row level security',
      table_name
    );

    execute format('drop policy if exists "Users manage their own rows" on public.%I', table_name);
    execute format(
      'create policy "Users manage their own rows"
        on public.%I
        for all
        to authenticated
        using (owner_id = (select auth.uid()))
        with check (owner_id = (select auth.uid()))',
      table_name
    );

    execute format(
      'grant select, insert, update on public.%I to authenticated',
      table_name
    );
  end loop;
end
$$;

create or replace function public.mfd_pos_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  table_name text;
  table_names text[] := array[
    'staff',
    'products',
    'customers',
    'suppliers',
    'zones',
    'sales',
    'quotes',
    'deliveries',
    'purchases',
    'returns',
    'cashups',
    'stock_adjustments',
    'held_sales',
    'audit_log',
    'store_settings'
  ];
begin
  foreach table_name in array table_names loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at
        before update on public.%I
        for each row execute function public.mfd_pos_set_updated_at()',
      table_name
    );
  end loop;
end
$$;
