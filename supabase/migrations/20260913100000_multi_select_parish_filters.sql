-- Lets the parish overview filter on several values at once.
--
-- The filter UI moved from single-choice chips to a checkbox modal, so a
-- super admin can tick more than one status or diocese. Within a group the
-- ticked values are alternatives (No admin OR Unverified payments; Warri OR
-- Effurun); across groups they narrow together.

drop function if exists public.sa_parish_overview(text, text, text, integer, integer);

create function public.sa_parish_overview(
  search_term text default null,
  -- null or empty for every diocese.
  diocese_filters text[] default null,
  -- any of 'no_admin', 'unverified'; null or empty for every parish.
  status_filters text[] default null,
  page_limit integer default 20,
  page_offset integer default 0
)
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
declare
  safe_limit integer := least(greatest(coalesce(page_limit, 20), 1), 100);
  safe_offset integer := greatest(coalesce(page_offset, 0), 0);
  term text := nullif(btrim(coalesce(search_term, '')), '');
  statuses text[] := coalesce(status_filters, '{}');
  dioceses text[] := coalesce(diocese_filters, '{}');
begin
  perform public.sa_guard();

  if exists (select 1 from unnest(statuses) s where s not in ('no_admin', 'unverified')) then
    raise exception 'Unknown status filter in %', statuses using errcode = '22023';
  end if;

  return query
  with counted as (
    select
      p.id,
      p.name,
      p.diocese,
      count(distinct pr.id) as members,
      count(distinct pr.id) filter (where pr.role = 'parish_admin') as admins,
      (select count(*) from public.donations d
        where d.parish_id = p.id and d.status = 'pending') as unverified
    from public.parishes p
    left join public.profiles pr on pr."parishId" = p.id
    where (term is null or p.name ilike '%' || term || '%' or p.diocese ilike '%' || term || '%')
      and (cardinality(dioceses) = 0 or p.diocese = any (dioceses))
    group by p.id, p.name, p.diocese
  )
  select c.id, c.name, c.diocese, c.members, c.admins, c.unverified
  from counted c
  where cardinality(statuses) = 0
     or ('no_admin' = any (statuses) and c.admins = 0)
     or ('unverified' = any (statuses) and c.unverified > 0)
  order by c.diocese, c.name
  limit safe_limit
  offset safe_offset;
end;
$$;

revoke all on function public.sa_parish_overview(text, text[], text[], integer, integer) from public;
grant execute on function public.sa_parish_overview(text, text[], text[], integer, integer) to authenticated;
