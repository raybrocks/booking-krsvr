-- Supabase Data API GRANTs, RLS & table creation for DailySettlementDispatch
-- Required per .agents/AGENTS.md for all newly created tables in public schema.

create table if not exists public."DailySettlementDispatch" (
  "id" text not null primary key,
  "settlementDate" text not null unique,
  "settlementNumber" integer not null,
  "settlementCode" text not null,
  "firstReceiptNumber" text not null,
  "lastReceiptNumber" text not null,
  "receiptCount" integer not null,
  "netTurnover" double precision not null,
  "outgoingVat" double precision not null,
  "vippsFee" double precision not null default 0,
  "recipientEmail" text not null,
  "resendEmailId" text,
  "status" text not null default 'sent',
  "errorMessage" text,
  "sentAt" timestamp(3) without time zone not null default current_timestamp,
  "createdAt" timestamp(3) without time zone not null default current_timestamp,
  "updatedAt" timestamp(3) without time zone not null default current_timestamp
);

revoke all on table public."DailySettlementDispatch" from anon;
grant select, insert, update, delete on table public."DailySettlementDispatch" to authenticated;
grant select, insert, update, delete on table public."DailySettlementDispatch" to service_role;

alter table public."DailySettlementDispatch" enable row level security;

drop policy if exists "Authenticated users can manage DailySettlementDispatch" on public."DailySettlementDispatch";
create policy "Authenticated users can manage DailySettlementDispatch"
  on public."DailySettlementDispatch"
  for all
  to authenticated
  using (true)
  with check (true);
