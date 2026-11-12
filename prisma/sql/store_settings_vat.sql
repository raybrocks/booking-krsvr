-- Supabase Data API GRANTs, RLS & initial seed for StoreSettings
-- Required per .agents/AGENTS.md for all newly created tables in public schema.

revoke all on table public."StoreSettings" from anon;
grant select, insert, update, delete on public."StoreSettings" to authenticated;
grant select, insert, update, delete on public."StoreSettings" to service_role;

alter table public."StoreSettings" enable row level security;

drop policy if exists "Authenticated users can manage StoreSettings" on public."StoreSettings";
create policy "Authenticated users can manage StoreSettings"
  on public."StoreSettings"
  for all
  to authenticated
  using (true)
  with check (true);

insert into public."StoreSettings" ("id", "isVatRegistered", "defaultVatRate", "updatedAt")
values ('default', false, 25, now())
on conflict ("id") do nothing;
