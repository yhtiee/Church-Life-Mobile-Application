-- Platform-level administration.
--
-- Two things are impossible in the app without this. Nobody can create a
-- parish: the only write policy on parishes is an update restricted to that
-- parish's own admin. And a new parish can never get its first admin, because
-- promoting someone requires already being an admin of the same parish. Every
-- parish so far has been created by running SQL by hand.
--
-- Implemented as a flag rather than a fourth `role` value on purpose. Roughly
-- 55 policies across 11 tables test for role = 'parish_admin'; making super
-- admin a role would silently strip those abilities from whoever held it, and
-- their parishId is usually null anyway. A separate flag leaves every existing
-- policy correct and untouched.
--
-- Powers are granted through security definer functions rather than by adding
-- an escape hatch to those 55 policies. One missed WITH CHECK in a rewrite of
-- that size is a hole; a fixed set of functions is a surface you can read.

-- ─────────────────────────────────────────────────────────────
-- 1. The flag
-- ─────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

create or replace function public.is_super_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_super_admin from public.profiles p where p.id = uid), false);
$$;

grant execute on function public.is_super_admin(uuid) to authenticated;

-- The first one has to be seeded: appointing a super admin requires being one.
update public.profiles
set is_super_admin = true
where lower(email) = 'workerspie@gmail.com';

-- ─────────────────────────────────────────────────────────────
-- 2. Audit trail
-- ─────────────────────────────────────────────────────────────

-- Nothing has recorded who changed a role or created a parish until now.
-- Worth having from the start rather than reconstructing it later.
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  -- Kept as text as well as a reference, so the record still reads correctly
  -- if the actor's account is later removed.
  actor_name text,
  action text not null,
  target_type text,
  target_id uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_recent_idx
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Super admins read the audit log" on public.admin_audit_log;
create policy "Super admins read the audit log"
  on public.admin_audit_log for select
  using (public.is_super_admin());

-- No insert policy: rows are written only by the definer functions below, so
-- the log cannot be forged from a client.

-- ─────────────────────────────────────────────────────────────
-- 3. Shared guard and logging
-- ─────────────────────────────────────────────────────────────

create or replace function public.sa_guard()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
begin
  select * into caller from public.profiles p where p.id = auth.uid();
  if not found then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if not caller.is_super_admin then
    raise exception 'This action needs platform administrator access'
      using errcode = '42501';
  end if;
  return caller;
end;
$$;

revoke all on function public.sa_guard() from public;

create or replace function public.sa_log(
  caller public.profiles,
  action text,
  target_type text,
  target_id uuid,
  detail jsonb default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_audit_log (actor_id, actor_name, action, target_type, target_id, detail)
  values (caller.id, caller."fullName", action, target_type, target_id, detail);
$$;

revoke all on function public.sa_log(public.profiles, text, text, uuid, jsonb) from public;

-- ─────────────────────────────────────────────────────────────
-- 4. Parishes
-- ─────────────────────────────────────────────────────────────

create or replace function public.sa_save_parish(
  parish_name text,
  parish_diocese text,
  parish_state text,
  parish_country text,
  parish_id uuid default null
)
returns public.parishes
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  saved public.parishes;
begin
  caller := public.sa_guard();

  if btrim(coalesce(parish_name, '')) = '' then
    raise exception 'A parish needs a name' using errcode = '22023';
  end if;

  if parish_id is null then
    -- Names are not unique in the schema, but two parishes with the same name
    -- in the same diocese is almost certainly a mistake rather than intent.
    if exists (
      select 1 from public.parishes p
      where lower(btrim(p.name)) = lower(btrim(parish_name))
        and lower(btrim(coalesce(p.diocese, ''))) = lower(btrim(coalesce(parish_diocese, '')))
    ) then
      raise exception 'A parish with that name already exists in this diocese'
        using errcode = '23505';
    end if;

    insert into public.parishes (id, name, diocese, state, country)
    values (gen_random_uuid(), btrim(parish_name), btrim(parish_diocese),
            btrim(parish_state), btrim(parish_country))
    returning * into saved;

    -- A parish with no schedule leaves its booking form with nothing to offer,
    -- so give it the same starting point every other parish was seeded with.
    insert into public.parish_schedule_items (parish_id, kind, label, times, icon, sort_order)
    select saved.id, 'mass', d.label, d.times, 'calendar-sharp', d.sort_order
    from (values
      ('Sunday',   array['6:00 AM', '8:30 AM', '10:30 AM', '6:00 PM'], 0),
      ('Weekdays', array['6:30 AM', '12:00 PM'],                       1),
      ('Saturday', array['7:00 AM', '5:00 PM'],                        2)
    ) as d(label, times, sort_order);

    perform public.sa_log(caller, 'parish.create', 'parish', saved.id,
      jsonb_build_object('name', saved.name, 'diocese', saved.diocese));
  else
    update public.parishes
    set name = btrim(parish_name),
        diocese = btrim(parish_diocese),
        state = btrim(parish_state),
        country = btrim(parish_country)
    where id = parish_id
    returning * into saved;

    if not found then
      raise exception 'Parish not found' using errcode = 'P0002';
    end if;

    perform public.sa_log(caller, 'parish.update', 'parish', saved.id,
      jsonb_build_object('name', saved.name, 'diocese', saved.diocese));
  end if;

  return saved;
end;
$$;

revoke all on function public.sa_save_parish(text, text, text, text, uuid) from public;
grant execute on function public.sa_save_parish(text, text, text, text, uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. Members and parish admins
-- ─────────────────────────────────────────────────────────────

-- Appointing across parish boundaries is the whole point: a newly created
-- parish has no admin, and the parish-scoped assign_parish_member_roles
-- cannot give it one.
create or replace function public.sa_set_parish_admin(
  target_user_id uuid,
  make_admin boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  target public.profiles;
  updated public.profiles;
begin
  caller := public.sa_guard();

  select * into target from public.profiles p where p.id = target_user_id;
  if not found then
    raise exception 'Member not found' using errcode = 'P0002';
  end if;

  if make_admin and target."parishId" is null then
    raise exception 'Give this member a parish before making them its admin'
      using errcode = '22023';
  end if;

  update public.profiles
  set role = case when make_admin then 'parish_admin' else 'member' end
  where id = target_user_id
  returning * into updated;

  perform public.sa_log(caller,
    case when make_admin then 'admin.grant' else 'admin.revoke' end,
    'profile', target_user_id,
    jsonb_build_object('name', updated."fullName", 'parishId', updated."parishId"));

  return updated;
end;
$$;

revoke all on function public.sa_set_parish_admin(uuid, boolean) from public;
grant execute on function public.sa_set_parish_admin(uuid, boolean) to authenticated;

create or replace function public.sa_set_member_parish(
  target_user_id uuid,
  new_parish_id uuid
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  target public.profiles;
  parish public.parishes;
  updated public.profiles;
begin
  caller := public.sa_guard();

  select * into target from public.profiles p where p.id = target_user_id;
  if not found then
    raise exception 'Member not found' using errcode = 'P0002';
  end if;

  select * into parish from public.parishes p where p.id = new_parish_id;
  if not found then
    raise exception 'Parish not found' using errcode = 'P0002';
  end if;

  -- Groups belong to the parish being left, so membership does not travel.
  -- Same rule the member-initiated transfer follows.
  update public.groups
  set member_ids = array_remove(member_ids, target_user_id)
  where member_ids @> array[target_user_id];

  update public.profiles
  set "parishId" = parish.id,
      "parishName" = parish.name,
      "groupId" = null,
      "groupName" = null,
      duty_role = null
  where id = target_user_id
  returning * into updated;

  perform public.sa_log(caller, 'member.move', 'profile', target_user_id,
    jsonb_build_object('name', updated."fullName",
                       'from', target."parishId", 'to', parish.id));

  return updated;
end;
$$;

revoke all on function public.sa_set_member_parish(uuid, uuid) from public;
grant execute on function public.sa_set_member_parish(uuid, uuid) to authenticated;

create or replace function public.sa_set_super_admin(
  target_user_id uuid,
  grant_access boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  remaining integer;
  updated public.profiles;
begin
  caller := public.sa_guard();

  -- Locking yourself out is never the intent, and someone must remain able
  -- to appoint the next one.
  if target_user_id = caller.id and not grant_access then
    raise exception 'You cannot remove your own platform access'
      using errcode = '42501';
  end if;

  if not grant_access then
    select count(*) into remaining
    from public.profiles p
    where p.is_super_admin and p.id <> target_user_id;

    if remaining = 0 then
      raise exception 'At least one platform administrator must remain'
        using errcode = '23514';
    end if;
  end if;

  update public.profiles
  set is_super_admin = grant_access
  where id = target_user_id
  returning * into updated;

  if not found then
    raise exception 'Member not found' using errcode = 'P0002';
  end if;

  perform public.sa_log(caller,
    case when grant_access then 'superadmin.grant' else 'superadmin.revoke' end,
    'profile', target_user_id,
    jsonb_build_object('name', updated."fullName", 'email', updated.email));

  return updated;
end;
$$;

revoke all on function public.sa_set_super_admin(uuid, boolean) from public;
grant execute on function public.sa_set_super_admin(uuid, boolean) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 6. Global groups
-- ─────────────────────────────────────────────────────────────

-- Groups with a null parish_id are shared by every parish. There is no
-- in-app way to add one today.
create or replace function public.sa_save_global_group(
  group_name text,
  group_description text,
  group_is_secure boolean default false,
  group_id uuid default null
)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  saved public.groups;
begin
  caller := public.sa_guard();

  if btrim(coalesce(group_name, '')) = '' then
    raise exception 'A group needs a name' using errcode = '22023';
  end if;

  if group_id is null then
    if exists (
      select 1 from public.groups g
      where lower(btrim(g.name)) = lower(btrim(group_name)) and g.parish_id is null
    ) then
      raise exception 'A group with that name already exists' using errcode = '23505';
    end if;

    insert into public.groups (name, description, is_secure, parish_id)
    values (btrim(group_name), coalesce(btrim(group_description), ''), group_is_secure, null)
    returning * into saved;

    perform public.sa_log(caller, 'group.create', 'group', saved.id,
      jsonb_build_object('name', saved.name, 'secured', saved.is_secure));
  else
    update public.groups
    set name = btrim(group_name),
        description = coalesce(btrim(group_description), ''),
        is_secure = group_is_secure
    where id = group_id
    returning * into saved;

    if not found then
      raise exception 'Group not found' using errcode = 'P0002';
    end if;

    perform public.sa_log(caller, 'group.update', 'group', saved.id,
      jsonb_build_object('name', saved.name, 'secured', saved.is_secure));
  end if;

  return saved;
end;
$$;

revoke all on function public.sa_save_global_group(text, text, boolean, uuid) from public;
grant execute on function public.sa_save_global_group(text, text, boolean, uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 7. Oversight
-- ─────────────────────────────────────────────────────────────

-- Counts only. A platform administrator does not need the detail of any
-- parish's giving to do this job, so amounts are deliberately absent and
-- there is no function that returns them.
create or replace function public.sa_parish_overview()
returns table (
  parish_id uuid,
  parish_name text,
  diocese text,
  member_count bigint,
  admin_count bigint,
  unverified_payments bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sa_guard();

  return query
  select
    p.id,
    p.name,
    p.diocese,
    count(distinct pr.id),
    count(distinct pr.id) filter (where pr.role = 'parish_admin'),
    (select count(*) from public.donations d
      where d.parish_id = p.id and d.status = 'pending')
  from public.parishes p
  left join public.profiles pr on pr."parishId" = p.id
  group by p.id, p.name, p.diocese
  order by p.diocese, p.name;
end;
$$;

revoke all on function public.sa_parish_overview() from public;
grant execute on function public.sa_parish_overview() to authenticated;
