-- Celebration wishes: anonymity, a private read for the celebrant, and a
-- notification when one arrives.
--
-- Wishes are deliberately not gated on payment verification. Money needs
-- checking; a prayer does not. If a wish only appeared once an admin had
-- confirmed a bank transfer, the occasion would be over before the messages
-- arrived, and rejecting a transfer that never landed would erase kind words
-- that had nothing to do with the money.

-- ─────────────────────────────────────────────────────────────
-- 1. Sending quietly
-- ─────────────────────────────────────────────────────────────

alter table public.donations
  add column if not exists is_anonymous boolean not null default false;

-- ─────────────────────────────────────────────────────────────
-- 2. The celebrant's private read
-- ─────────────────────────────────────────────────────────────

-- Row level security can restrict which ROWS are visible but not which
-- COLUMNS, and the celebrant must not see amounts: the money goes to the
-- parish account, not to them, so showing figures would promise something
-- the app does not deliver and turn good wishes into a leaderboard.
--
-- Returning a fixed column list from a definer function is the only way to
-- hand back the message without the amount attached to it.
create or replace function public.get_celebration_wishes(target_celebration_id uuid)
returns table (
  id uuid,
  sender_name text,
  prayer_note text,
  wished_on text,
  is_anonymous boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  celebration public.celebrations;
begin
  select * into caller from public.profiles where id = auth.uid();
  if not found then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into celebration from public.celebrations c where c.id = target_celebration_id;
  if not found then
    raise exception 'Celebration not found' using errcode = 'P0002';
  end if;

  -- Private to the person being celebrated. Parish admins can already see
  -- the underlying payments, so they are allowed through too.
  if not (
    celebration.member_id = caller.id
    or (caller.role = 'parish_admin' and caller."parishId" = celebration.parish_id)
  ) then
    raise exception 'These wishes are private to the person being celebrated'
      using errcode = '42501';
  end if;

  return query
  select
    d.id,
    case
      when d.is_anonymous then 'Someone'::text
      else coalesce(p."fullName", 'A parishioner')
    end,
    d.prayer_note,
    d.date,
    d.is_anonymous
  from public.donations d
  left join public.profiles p on p.id = d.user_id
  where d.celebration_id = target_celebration_id
    and d.prayer_note is not null
    and btrim(d.prayer_note) <> ''
  order by d.date desc, d.id;
end;
$$;

revoke all on function public.get_celebration_wishes(uuid) from public;
grant execute on function public.get_celebration_wishes(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. Telling the celebrant
-- ─────────────────────────────────────────────────────────────

-- Done in a trigger rather than from the client: the notifications policy
-- only lets a user insert rows for themselves, so a supporter cannot write a
-- notification addressed to the celebrant. A definer trigger also guarantees
-- the notification is written in the same transaction as the wish.
create or replace function public.notify_celebration_beneficiary()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_name text;
  note text;
begin
  if new.kind is distinct from 'celebration' or new.beneficiary_id is null then
    return new;
  end if;

  -- Nobody needs telling about their own gift.
  if new.beneficiary_id = new.user_id then
    return new;
  end if;

  if new.is_anonymous then
    sender_name := 'Someone';
  else
    select p."fullName" into sender_name from public.profiles p where p.id = new.user_id;
    sender_name := coalesce(sender_name, 'A parishioner');
  end if;

  note := btrim(coalesce(new.prayer_note, ''));

  insert into public.notifications (user_id, title, body, type)
  values (
    new.beneficiary_id,
    'A celebration wish for you',
    case
      when note <> '' then sender_name || ' sent you a message: "' || left(note, 140) || '"'
      else sender_name || ' is celebrating with you.'
    end,
    'giving'
  );

  return new;
end;
$$;

drop trigger if exists donations_notify_beneficiary on public.donations;
create trigger donations_notify_beneficiary
  after insert on public.donations
  for each row execute function public.notify_celebration_beneficiary();
