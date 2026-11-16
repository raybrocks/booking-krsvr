-- Add accounting voucher destination email (e.g. Fiken inbox for daily settlements)
alter table public."StoreSettings"
  add column if not exists "voucherEmail" text default 'krs-vr-arena-as@bilag.fiken.no';

update public."StoreSettings"
set "voucherEmail" = 'krs-vr-arena-as@bilag.fiken.no'
where "id" = 'default' and "voucherEmail" is null;
