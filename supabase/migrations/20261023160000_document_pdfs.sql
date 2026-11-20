-- MFD POS: PDF documents sent on WhatsApp (invoices, quotations, delivery notes,
-- statements, purchase orders).
-- Each PDF is saved under a long random name and opened through MFD's own web address
-- (https://mfd-pos.netlify.app/doc/<name>). Only the signed-in MFD account can add
-- files; nobody can list, change or delete them through the app's key.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mfd-docs', 'mfd-docs', true, 5242880, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "MFD POS adds document PDFs" on storage.objects;
create policy "MFD POS adds document PDFs"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'mfd-docs');
