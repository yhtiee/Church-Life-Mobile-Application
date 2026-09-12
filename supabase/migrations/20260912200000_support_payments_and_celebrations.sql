-- Parish support, celebrations, and one verification queue for all payments.
--
-- No money moves through the app. Every payment is a bank transfer made
-- outside it; these tables are the record and the parish admin's
-- verification of it.

-- ─────────────────────────────────────────────────────────────
-- 1. Parish bank accounts
-- ─────────────────────────────────────────────────────────────

-- A table rather than columns on `parishes`, so a parish can publish more
-- than one account, e.g. general offerings separate from a building fund.
create table if not exists public.parish_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  -- What the account is for, shown as the heading, e.g. 'General Offerings'.
  label text not null,
  bank_name text not null,
  account_name text not null,
  -- Text, not a number: account numbers have leading zeros and are never
  -- arithmetic.
  account_number text not null,
  instructions text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists parish_bank_accounts_parish_idx
  on public.parish_bank_accounts (parish_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- 2. Celebrations
-- ─────────────────────────────────────────────────────────────

-- Posted by a parish admin the way ads are, naming the member being
-- celebrated. Nothing is derived from profile birth dates: the app only
-- stores a birth month, so it could never tell who is celebrating today.
create table if not exists public.celebrations (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  -- The member being celebrated. Nullable so a parish can post a
  -- celebration for someone without an account.
  member_id uuid references public.profiles(id) on delete set null,
  celebrant_name text not null,
  kind text not null,
  title text not null,
  body text,
  image_url text,
  celebration_date date,
  starts_on date not null default current_date,
  ends_on date,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint celebrations_kind_check
    check (kind in ('birthday', 'wedding_anniversary', 'ordination', 'profession', 'other'))
);

create index if not exists celebrations_parish_active_idx
  on public.celebrations (parish_id, is_active, starts_on desc);

-- ─────────────────────────────────────────────────────────────
-- 3. One payment record for everything
-- ─────────────────────────────────────────────────────────────

-- Parish support and celebration offerings are recorded as donations rather
-- than in tables of their own, so they land in the pending queue the admin
-- finances screen already reads. A third table would have meant a third
-- queue for the same job.
alter table public.donations
  add column if not exists kind text not null default 'offering',
  -- The celebration this was given towards, if any.
  add column if not exists celebration_id uuid references public.celebrations(id) on delete set null,
  -- The member being celebrated. Denormalised from the celebration so the
  -- record survives the celebration post being removed.
  add column if not exists beneficiary_id uuid references public.profiles(id) on delete set null,
  -- The supporter's prayer or message for the celebrant.
  add column if not exists prayer_note text,
  -- Which of the parish's accounts the sender says they paid into.
  add column if not exists bank_account_id uuid references public.parish_bank_accounts(id) on delete set null;

alter table public.donations
  drop constraint if exists donations_kind_check;
alter table public.donations
  add constraint donations_kind_check
  check (kind in ('offering', 'support', 'celebration'));

create index if not exists donations_pending_by_parish_idx
  on public.donations (parish_id, status);

create index if not exists donations_celebration_idx
  on public.donations (celebration_id)
  where celebration_id is not null;

-- ─────────────────────────────────────────────────────────────
-- 4. Keep updated_at honest
-- ─────────────────────────────────────────────────────────────

drop trigger if exists parish_bank_accounts_touch on public.parish_bank_accounts;
create trigger parish_bank_accounts_touch
  before update on public.parish_bank_accounts
  for each row execute function public.touch_updated_at();

drop trigger if exists celebrations_touch on public.celebrations;
create trigger celebrations_touch
  before update on public.celebrations
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 5. Row level security
-- ─────────────────────────────────────────────────────────────

alter table public.parish_bank_accounts enable row level security;
alter table public.celebrations enable row level security;

-- Members need the account details to make a transfer, so any signed-in
-- user can read them. They are published payment details, not secrets.
drop policy if exists "Signed in users read bank accounts" on public.parish_bank_accounts;
create policy "Signed in users read bank accounts"
  on public.parish_bank_accounts for select
  using (auth.uid() is not null);

drop policy if exists "Parish admins manage bank accounts" on public.parish_bank_accounts;
create policy "Parish admins manage bank accounts"
  on public.parish_bank_accounts for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'parish_admin'
        and p."parishId" = parish_bank_accounts.parish_id
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'parish_admin'
        and p."parishId" = parish_bank_accounts.parish_id
    )
  );

-- Celebrations are parish notices, readable by that parish's members.
drop policy if exists "Parish members read celebrations" on public.celebrations;
create policy "Parish members read celebrations"
  on public.celebrations for select
  using (
    auth.uid() is not null
    and parish_id = (select p."parishId" from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "Parish admins manage celebrations" on public.celebrations;
create policy "Parish admins manage celebrations"
  on public.celebrations for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'parish_admin'
        and p."parishId" = celebrations.parish_id
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'parish_admin'
        and p."parishId" = celebrations.parish_id
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 6. Mark a payment verified
-- ─────────────────────────────────────────────────────────────

-- The existing screen updates donations directly under an RLS policy that
-- lets an admin write any column. That is fine for approving an offering,
-- but it would also let an admin rewrite the amount a member reported after
-- the fact. This records the decision without touching what was claimed.
create or replace function public.verify_payment(
  donation_id uuid,
  approve boolean,
  note text default null,
  confirmed_amount numeric default null
)
returns public.donations
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  target public.donations;
  updated public.donations;
begin
  select * into caller from public.profiles where id = auth.uid();
  if not found then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if caller.role <> 'parish_admin' then
    raise exception 'Only a parish admin can verify payments' using errcode = '42501';
  end if;

  select * into target from public.donations where id = donation_id for update;
  if not found then
    raise exception 'Payment not found' using errcode = 'P0002';
  end if;
  if caller."parishId" is null or target.parish_id is distinct from caller."parishId" then
    raise exception 'That payment belongs to a different parish' using errcode = '42501';
  end if;
  if target.status in ('fulfilled', 'rejected') then
    raise exception 'This payment has already been decided' using errcode = '23505';
  end if;

  update public.donations
  set status = case when approve then 'fulfilled' else 'rejected' end,
      -- What the admin actually saw land, which may differ from the amount
      -- the member reported. `amount` is left as reported, on purpose.
      fulfilled_amount = case
        when approve then coalesce(confirmed_amount, target.amount)
        else null
      end,
      approved_at = now(),
      approved_by = caller.id,
      admin_notes = note
  where id = donation_id
  returning * into updated;

  return updated;
end;
$$;

revoke all on function public.verify_payment(uuid, boolean, text, numeric) from public;
grant execute on function public.verify_payment(uuid, boolean, text, numeric) to authenticated;
