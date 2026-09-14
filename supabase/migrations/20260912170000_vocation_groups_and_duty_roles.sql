-- Vocation groups and duty roles.
--
-- 1. Adds Bishop, Clergy and Religious as secured groups, so joining them
--    needs parish admin approval rather than self-selection at registration.
-- 2. Adds profiles.duty_role, a title only. Access control stays on
--    profiles.role, which is unchanged.
-- 3. Adds assign_parish_member_roles(), the only supported way for a parish
--    admin to set another member's role or duty role.

-- ─────────────────────────────────────────────────────────────
-- 1. Secured vocation groups
-- ─────────────────────────────────────────────────────────────

-- Seeded globally (parish_id null) to match how the existing groups were
-- created. Matched case-insensitively on name because there is no unique
-- constraint to conflict on.
insert into public.groups (name, description, is_secure)
select v.name, v.description, true
from (values
  (
    'Bishop',
    'The bishop of the diocese, exercising pastoral oversight of the parishes and clergy entrusted to his care.'
  ),
  (
    'Clergy',
    'Ordained ministers serving the parish, including priests and deacons engaged in sacramental and pastoral ministry.'
  ),
  (
    'Religious',
    'Members of consecrated religious institutes, living under vows and serving the parish community in their charism.'
  )
) as v(name, description)
where not exists (
  select 1 from public.groups g where lower(g.name) = lower(v.name)
);

-- ─────────────────────────────────────────────────────────────
-- 2. Duty roles
-- ─────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists duty_role text;

alter table public.profiles
  drop constraint if exists profiles_duty_role_check;

alter table public.profiles
  add constraint profiles_duty_role_check
  check (
    duty_role is null
    or duty_role in ('parish_priest', 'assistant_priest', 'parish_secretary')
  );

-- A parish has exactly one parish priest. Profiles with no parish are exempt,
-- since a partial unique index treats each null parish as distinct.
create unique index if not exists profiles_single_parish_priest_per_parish
  on public.profiles ("parishId")
  where duty_role = 'parish_priest';

-- ─────────────────────────────────────────────────────────────
-- 3. Admin-controlled role and duty role assignment
-- ─────────────────────────────────────────────────────────────

-- Row level security cannot restrict which *columns* an update touches, and a
-- policy broad enough to let admins edit members would also let them rewrite
-- names and emails. A security definer function keeps the write surface to
-- exactly these two columns and enforces the parish boundary.
create or replace function public.assign_parish_member_roles(
  target_user_id uuid,
  new_role text default null,
  new_duty_role text default null,
  clear_duty_role boolean default false
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  caller public.profiles;
  target public.profiles;
  other_admins integer;
  existing_priest uuid;
  updated public.profiles;
begin
  select * into caller from public.profiles where id = auth.uid();
  if not found then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if caller.role <> 'parish_admin' then
    raise exception 'Only a parish admin can assign roles' using errcode = '42501';
  end if;

  select * into target from public.profiles where id = target_user_id;
  if not found then
    raise exception 'Member not found' using errcode = 'P0002';
  end if;

  if caller."parishId" is null
     or target."parishId" is distinct from caller."parishId" then
    raise exception 'That member belongs to a different parish' using errcode = '42501';
  end if;

  if new_role is not null then
    -- group_admin is deliberately excluded: nothing in the app assigns it.
    if new_role not in ('member', 'parish_admin') then
      raise exception 'Unsupported role: %', new_role using errcode = '22023';
    end if;

    if target.id = caller.id and new_role <> caller.role then
      raise exception 'You cannot change your own role' using errcode = '42501';
    end if;

    -- Never leave a parish without an administrator.
    if target.role = 'parish_admin' and new_role <> 'parish_admin' then
      select count(*) into other_admins
      from public.profiles
      where "parishId" = caller."parishId"
        and role = 'parish_admin'
        and id <> target.id;

      if other_admins = 0 then
        raise exception 'A parish must keep at least one parish admin'
          using errcode = '23514';
      end if;
    end if;
  end if;

  -- Pre-check the parish priest rule so callers get a readable message rather
  -- than a raw unique index violation.
  if not clear_duty_role and new_duty_role = 'parish_priest' then
    select id into existing_priest
    from public.profiles
    where "parishId" = caller."parishId"
      and duty_role = 'parish_priest'
      and id <> target_user_id;

    if found then
      raise exception 'This parish already has a parish priest'
        using errcode = '23505';
    end if;
  end if;

  update public.profiles
  set
    role = coalesce(new_role, role),
    duty_role = case
      when clear_duty_role then null
      when new_duty_role is not null then new_duty_role
      else duty_role
    end
  where id = target_user_id
  returning * into updated;

  return updated;
end;
$$;

revoke all on function public.assign_parish_member_roles(uuid, text, text, boolean) from public;
grant execute on function public.assign_parish_member_roles(uuid, text, text, boolean) to authenticated;
