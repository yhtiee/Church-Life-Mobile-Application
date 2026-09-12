-- Working group transfers, and parish transfers.
--
-- Group membership is tracked in two places that must agree: groups.member_ids
-- and profiles.groupId / profiles.groupName. Today the client writes them in
-- separate round trips with no transaction, and joining an open group updates
-- only the profile, so the member never appears in groups.member_ids. Every
-- membership change now goes through one function and commits atomically.
--
-- Both member-facing request screens also write to `activities` rather than
-- `group_requests`, which is why the admin queue reads empty. The functions
-- below write `group_requests`, leaving `activities` as the audit log.

-- ─────────────────────────────────────────────────────────────
-- 1. Request bookkeeping
-- ─────────────────────────────────────────────────────────────

alter table public.group_requests
  add column if not exists reason text,
  add column if not exists status text not null default 'pending',
  add column if not exists decided_at timestamptz,
  add column if not exists decided_by uuid references public.profiles(id) on delete set null;

alter table public.group_requests
  drop constraint if exists group_requests_status_check;
alter table public.group_requests
  add constraint group_requests_status_check
  check (status in ('pending', 'approved', 'rejected'));

-- One outstanding request per member at a time.
create unique index if not exists group_requests_one_pending_per_member
  on public.group_requests (user_id)
  where status = 'pending';

-- ─────────────────────────────────────────────────────────────
-- 2. Parish transfer requests
-- ─────────────────────────────────────────────────────────────

create table if not exists public.parish_transfer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  "userName" text not null,
  -- The parish being left. The admin of THIS parish decides the request.
  from_parish_id uuid references public.parishes(id) on delete set null,
  to_parish_id uuid not null references public.parishes(id) on delete cascade,
  reason text,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references public.profiles(id) on delete set null,
  decision_note text,
  constraint parish_transfer_status_check
    check (status in ('pending', 'approved', 'rejected')),
  constraint parish_transfer_distinct_parishes
    check (from_parish_id is distinct from to_parish_id)
);

create unique index if not exists parish_transfer_one_pending_per_member
  on public.parish_transfer_requests (user_id)
  where status = 'pending';

create index if not exists parish_transfer_from_parish_idx
  on public.parish_transfer_requests (from_parish_id, status);

alter table public.parish_transfer_requests enable row level security;

drop policy if exists "Members see their own transfer requests" on public.parish_transfer_requests;
create policy "Members see their own transfer requests"
  on public.parish_transfer_requests for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'parish_admin'
        -- The releasing parish decides, so only its admins see the request.
        and p."parishId" = parish_transfer_requests.from_parish_id
    )
  );

-- Writes go through the functions below, which run as definer. No insert,
-- update or delete policy is granted deliberately.

-- ─────────────────────────────────────────────────────────────
-- 3. Shared helper: move a member between groups atomically
-- ─────────────────────────────────────────────────────────────

create or replace function public.apply_group_membership(
  member_id uuid,
  target_group_id uuid,
  leave_group_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_name text;
begin
  select name into target_name from public.groups where id = target_group_id;
  if not found then
    raise exception 'Group not found' using errcode = 'P0002';
  end if;

  -- Drop the member from whichever group they are leaving. When no group is
  -- named, fall back to every group that still lists them, so stale rows from
  -- earlier non-transactional writes get cleaned up on the way through.
  if leave_group_id is not null then
    update public.groups
    set member_ids = array_remove(member_ids, member_id)
    where id = leave_group_id;
  else
    update public.groups
    set member_ids = array_remove(member_ids, member_id)
    where id <> target_group_id
      and member_ids @> array[member_id];
  end if;

  update public.groups
  set member_ids = array_append(member_ids, member_id)
  where id = target_group_id
    and not (member_ids @> array[member_id]);

  update public.profiles
  set "groupId" = target_group_id::text,
      "groupName" = target_name
  where id = member_id;
end;
$$;

revoke all on function public.apply_group_membership(uuid, uuid, uuid) from public;

-- ─────────────────────────────────────────────────────────────
-- 4. Joining and requesting groups
-- ─────────────────────────────────────────────────────────────

create or replace function public.join_open_group(target_group_id uuid)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  target public.groups;
begin
  select * into caller from public.profiles where id = auth.uid();
  if not found then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into target from public.groups where id = target_group_id;
  if not found then
    raise exception 'Group not found' using errcode = 'P0002';
  end if;

  if target.is_secure then
    raise exception 'This group needs approval. Submit a request instead.'
      using errcode = '42501';
  end if;

  if target.parish_id is not null and target.parish_id is distinct from caller."parishId" then
    raise exception 'That group belongs to a different parish' using errcode = '42501';
  end if;

  perform public.apply_group_membership(caller.id, target_group_id, null);

  select * into target from public.groups where id = target_group_id;
  return target;
end;
$$;

revoke all on function public.join_open_group(uuid) from public;
grant execute on function public.join_open_group(uuid) to authenticated;

create or replace function public.request_group_change(
  target_group_id uuid,
  reason text default null
)
returns public.group_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  target public.groups;
  current_group_id uuid;
  created public.group_requests;
begin
  select * into caller from public.profiles where id = auth.uid();
  if not found then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into target from public.groups where id = target_group_id;
  if not found then
    raise exception 'Group not found' using errcode = 'P0002';
  end if;

  if target.parish_id is not null and target.parish_id is distinct from caller."parishId" then
    raise exception 'That group belongs to a different parish' using errcode = '42501';
  end if;

  if target.member_ids @> array[caller.id] then
    raise exception 'You are already in this group' using errcode = '23505';
  end if;

  -- The group being left, read from the membership arrays rather than the
  -- profile, since the arrays are what the approval has to update.
  select g.id into current_group_id
  from public.groups g
  where g.member_ids @> array[caller.id]
  limit 1;

  if exists (
    select 1 from public.group_requests r
    where r.user_id = caller.id and r.status = 'pending'
  ) then
    raise exception 'You already have a request awaiting a decision'
      using errcode = '23505';
  end if;

  insert into public.group_requests (
    user_id, "userName", "targetGroupId", "currentGroupId", parish_id, reason
  )
  values (
    caller.id, caller."fullName", target_group_id, current_group_id,
    caller."parishId", reason
  )
  returning * into created;

  return created;
end;
$$;

revoke all on function public.request_group_change(uuid, text) from public;
grant execute on function public.request_group_change(uuid, text) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. Deciding group requests
-- ─────────────────────────────────────────────────────────────

create or replace function public.decide_group_request(
  request_id uuid,
  approve boolean
)
returns public.group_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  req public.group_requests;
  updated public.group_requests;
begin
  select * into caller from public.profiles where id = auth.uid();
  if not found then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if caller.role <> 'parish_admin' then
    raise exception 'Only a parish admin can decide group requests' using errcode = '42501';
  end if;

  select * into req from public.group_requests where id = request_id for update;
  if not found then
    raise exception 'Request not found' using errcode = 'P0002';
  end if;
  if req.status <> 'pending' then
    raise exception 'This request has already been decided' using errcode = '23505';
  end if;
  if caller."parishId" is null or req.parish_id is distinct from caller."parishId" then
    raise exception 'That request belongs to a different parish' using errcode = '42501';
  end if;

  if approve then
    perform public.apply_group_membership(
      req.user_id, req."targetGroupId", req."currentGroupId"
    );
  end if;

  update public.group_requests
  set status = case when approve then 'approved' else 'rejected' end,
      decided_at = now(),
      decided_by = caller.id
  where id = request_id
  returning * into updated;

  return updated;
end;
$$;

revoke all on function public.decide_group_request(uuid, boolean) from public;
grant execute on function public.decide_group_request(uuid, boolean) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 6. Parish transfers
-- ─────────────────────────────────────────────────────────────

create or replace function public.request_parish_transfer(
  target_parish_id uuid,
  reason text default null
)
returns public.parish_transfer_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  created public.parish_transfer_requests;
begin
  select * into caller from public.profiles where id = auth.uid();
  if not found then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if caller."parishId" is null then
    raise exception 'You need a parish before you can transfer out of one'
      using errcode = '42501';
  end if;
  if caller."parishId" = target_parish_id then
    raise exception 'You already belong to that parish' using errcode = '22023';
  end if;
  if not exists (select 1 from public.parishes where id = target_parish_id) then
    raise exception 'Parish not found' using errcode = 'P0002';
  end if;

  -- An admin leaving would strand the parish, so make them hand over first.
  if caller.role = 'parish_admin' and not exists (
    select 1 from public.profiles p
    where p."parishId" = caller."parishId"
      and p.role = 'parish_admin'
      and p.id <> caller.id
  ) then
    raise exception 'Appoint another parish admin before transferring out'
      using errcode = '23514';
  end if;

  if exists (
    select 1 from public.parish_transfer_requests r
    where r.user_id = caller.id and r.status = 'pending'
  ) then
    raise exception 'You already have a transfer awaiting a decision'
      using errcode = '23505';
  end if;

  insert into public.parish_transfer_requests (
    user_id, "userName", from_parish_id, to_parish_id, reason
  )
  values (caller.id, caller."fullName", caller."parishId", target_parish_id, reason)
  returning * into created;

  return created;
end;
$$;

revoke all on function public.request_parish_transfer(uuid, text) from public;
grant execute on function public.request_parish_transfer(uuid, text) to authenticated;

create or replace function public.decide_parish_transfer(
  request_id uuid,
  approve boolean,
  note text default null
)
returns public.parish_transfer_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  req public.parish_transfer_requests;
  target_parish public.parishes;
  updated public.parish_transfer_requests;
begin
  select * into caller from public.profiles where id = auth.uid();
  if not found then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if caller.role <> 'parish_admin' then
    raise exception 'Only a parish admin can decide transfers' using errcode = '42501';
  end if;

  select * into req from public.parish_transfer_requests where id = request_id for update;
  if not found then
    raise exception 'Request not found' using errcode = 'P0002';
  end if;
  if req.status <> 'pending' then
    raise exception 'This transfer has already been decided' using errcode = '23505';
  end if;

  -- The releasing parish decides.
  if caller."parishId" is null or req.from_parish_id is distinct from caller."parishId" then
    raise exception 'Only the member''s current parish can decide this transfer'
      using errcode = '42501';
  end if;

  if approve then
    select * into target_parish from public.parishes where id = req.to_parish_id;
    if not found then
      raise exception 'Destination parish no longer exists' using errcode = 'P0002';
    end if;

    -- Groups belong to the parish being left, so membership does not travel.
    update public.groups
    set member_ids = array_remove(member_ids, req.user_id)
    where member_ids @> array[req.user_id];

    -- A duty title is granted by a parish and does not travel either.
    -- Donations, pledges and bookings keep their original parish_id on
    -- purpose: they record what happened at that parish.
    update public.profiles
    set "parishId" = req.to_parish_id,
        "parishName" = target_parish.name,
        "groupId" = null,
        "groupName" = null,
        duty_role = null
    where id = req.user_id;

    -- Any group request in flight is void now the member has left.
    update public.group_requests
    set status = 'rejected', decided_at = now(), decided_by = caller.id
    where user_id = req.user_id and status = 'pending';
  end if;

  update public.parish_transfer_requests
  set status = case when approve then 'approved' else 'rejected' end,
      decided_at = now(),
      decided_by = caller.id,
      decision_note = note
  where id = request_id
  returning * into updated;

  return updated;
end;
$$;

revoke all on function public.decide_parish_transfer(uuid, boolean, text) from public;
grant execute on function public.decide_parish_transfer(uuid, boolean, text) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 7. Reconcile membership written before this migration
-- ─────────────────────────────────────────────────────────────

-- joinOpenGroup only ever set profiles.groupId, so members who joined an open
-- group are missing from groups.member_ids. Add them back.
update public.groups g
set member_ids = array_append(g.member_ids, p.id)
from public.profiles p
where p."groupId" is not null
  and p."groupId" ~ '^[0-9a-fA-F-]{36}$'
  and g.id = p."groupId"::uuid
  and not (g.member_ids @> array[p.id]);
