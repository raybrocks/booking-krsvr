-- Sequential unbroken receipt numbering (KV-1001, KV-1002, ...)
-- Assigns existing receipts strictly chronologically (createdAt ASC, id ASC)
-- starting at 1001 without altering amount, createdAt, paymentRef, or VAT fields.

alter table public."Receipt" add column if not exists "receiptNumber" integer;

create sequence if not exists public."Receipt_receiptNumber_seq" as integer start with 1001 increment by 1;

with ordered as (
  select id, 1000 + row_number() over (order by "createdAt" asc, id asc) as seq_num
  from public."Receipt"
)
update public."Receipt" r
set "receiptNumber" = ordered.seq_num
from ordered
where r.id = ordered.id
  and r."receiptNumber" is null;

alter table public."Receipt" alter column "receiptNumber" set not null;

alter sequence public."Receipt_receiptNumber_seq" owned by public."Receipt"."receiptNumber";
alter table public."Receipt" alter column "receiptNumber" set default nextval('public."Receipt_receiptNumber_seq"'::regclass);

create unique index if not exists "Receipt_receiptNumber_key" on public."Receipt"("receiptNumber");

select setval(
  'public."Receipt_receiptNumber_seq"',
  greatest(coalesce((select max("receiptNumber") from public."Receipt"), 1000), 1000),
  true
);

grant usage, select on sequence public."Receipt_receiptNumber_seq" to authenticated, service_role;
