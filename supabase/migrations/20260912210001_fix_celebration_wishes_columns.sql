-- Fixes get_celebration_wishes, which raised "column reference id is
-- ambiguous" on every call.
--
-- A plpgsql OUT parameter shadows any unqualified column of the same name for
-- the whole function body. The previous version declared an output column
-- called `id`, so the unqualified `id` in the caller lookup resolved to the
-- output parameter instead of profiles.id.
--
-- Output names are now distinct from the columns they are drawn from, and the
-- lookup is qualified, so neither can collide again.

drop function if exists public.get_celebration_wishes(uuid);

create function public.get_celebration_wishes(target_celebration_id uuid)
returns table (
  wish_id uuid,
  sender_name text,
  message text,
  wished_on text,
  sent_anonymously boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  celebration public.celebrations;
begin
  select * into caller from public.profiles p where p.id = auth.uid();
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

  -- Amounts are deliberately absent: the money goes to the parish account,
  -- not to the celebrant. Wishes are returned whatever the payment's status,
  -- because verification gates the money, not the message.
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
