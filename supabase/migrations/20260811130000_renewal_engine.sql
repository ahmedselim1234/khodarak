-- Phase 7 (Renewal Engine & Dunning): renewal-scheduling columns on
-- subscriptions, payments.kind, payments.moyasar_payment_id now nullable.
-- See specs/008-phase-7-renewal-engine/data-model.md and research.md §1/§6.
--
-- Deliberately NO authenticated-role INSERT/UPDATE/DELETE policy added for
-- these columns. Every write this phase makes (claiming a subscription for
-- renewal, resolving a renewal outcome) goes exclusively through the
-- service-role client from lib/subscription/mutateSubscription.ts and
-- lib/payments/processRenewalOutcome.ts — the same rule Phase 5/6 already
-- established for exactly this class of financial/subscription state.

alter table public.subscriptions
  add column if not exists renewal_attempt_count integer not null default 0
    check (renewal_attempt_count >= 0),
  add column if not exists next_renewal_attempt_date date,
  add column if not exists renewal_claimed_at timestamptz;

-- Existing subscriptions (from Phase 4/6) have no next_renewal_attempt_date
-- yet — it starts equal to next_delivery_date, same as any subscription
-- with no open failure (data-model.md).
update public.subscriptions
set next_renewal_attempt_date = next_delivery_date
where next_renewal_attempt_date is null;

alter table public.payments
  add column if not exists kind text not null default 'initial'
    check (kind in ('initial', 'renewal'));

-- An automatically-suspended subscription (dunning exhausted, spec.md
-- Clarification 2) is paused with NO resume date — Phase 6's original
-- schema assumed every pause was customer-initiated with a chosen date.
alter table public.subscription_pauses
  alter column resume_date drop not null;

-- A renewal attempt that never reaches Moyasar at all (no available items,
-- an already-expired card, no saved payment method, or a request-level
-- provider error — contracts/cron-renewals-api.md) still gets its own
-- payments row per FR-012, with no id and no computed amount to record.
-- Postgres's unique constraint permits multiple nulls, so uniqueness among
-- real ids is unaffected.
alter table public.payments
  alter column moyasar_payment_id drop not null;

alter table public.payments
  drop constraint if exists payments_amount_halalas_check;

alter table public.payments
  alter column amount_halalas drop not null,
  add constraint payments_amount_halalas_check check (amount_halalas is null or amount_halalas > 0);

-- Durable record of exactly what a renewal attempt was re-priced for
-- (frequency, address, surviving items, breakdown, whether it resolved a
-- pending change) — read back by processRenewalOutcome.ts's 'paid' branch
-- regardless of whether the cron route's own synchronous handling or a
-- later webhook delivery is what actually resolves the outcome, so neither
-- path needs the other's in-memory state (research.md §1/§6).
alter table public.payments
  add column if not exists renewal_charge_context jsonb;

create index if not exists subscriptions_renewal_due_idx
  on public.subscriptions (next_renewal_attempt_date)
  where status = 'active';
