-- Search, filtering and pagination for the platform parish overview.
--
-- The other platform lists page with ordinary table queries, but this one
-- aggregates member, admin and payment counts per parish, which a table query
-- cannot do, so the paging and filtering have to happen inside the function.
-- Filtering after counting also means "no admin" and "unverified payments"
-- filter on the real counts rather than on whatever page was fetched.

drop function if exists public.sa_parish_overview();

create function public.sa_parish_overview(
  search_term text default null,
  diocese_filter text default null,
  -- null for every parish, 'no_admin', or 'unverified'.
  status_filter text default null,
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
begin
  perform public.sa_guard();

  if status_filter is not null and status_filter not in ('no_admin', 'unverified') then
    raise exception 'Unknown status filter: %', status_filter using errcode = '22023';
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
      and (diocese_filter is null or p.diocese = diocese_filter)
    group by p.id, p.name, p.diocese
  )
  select c.id, c.name, c.diocese, c.members, c.admins, c.unverified
  from counted c
  where status_filter is null
     or (status_filter = 'no_admin' and c.admins = 0)
     or (status_filter = 'unverified' and c.unverified > 0)
  order by c.diocese, c.name
  limit safe_limit
  offset safe_offset;
end;
$$;

revoke all on function public.sa_parish_overview(text, text, text, integer, integer) from public;
grant execute on function public.sa_parish_overview(text, text, text, integer, integer) to authenticated;
