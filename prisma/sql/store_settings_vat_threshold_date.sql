-- Replace manual VAT on/off toggle workflow with date when 50,000 NOK threshold was/will be passed
-- Experiences in Norway use 12% VAT (lav sats: opplevelser / fornøyelsespark)
alter table public."StoreSettings"
  add column if not exists "vatThresholdPassedDate" text default '2026-09-04';

update public."StoreSettings"
set
  "vatThresholdPassedDate" = coalesce(nullif("vatThresholdPassedDate", ''), '2026-09-04'),
  "defaultVatRate" = 12,
  "isVatRegistered" = true
where "id" = 'default';
