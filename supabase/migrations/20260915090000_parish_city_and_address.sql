-- City and street address for parishes.
--
-- The super admin parish form gained City and Address fields, but nothing
-- stored them: there were no columns and sa_save_parish took no such
-- arguments, so whatever an admin typed was silently discarded on save.
--
-- Both are optional. Existing parishes keep null until someone fills them in.

alter table public.parishes
  add column if not exists city text,
  add column if not exists address text;

-- New trailing parameters with defaults, so the function still resolves for
-- a caller that does not send them. Dropped and recreated because Postgres
-- treats a different argument list as a separate function.
drop function if exists public.sa_save_parish(text, text, text, text, uuid);

create function public.sa_save_parish(
  parish_name text,
  parish_diocese text,
  parish_state text,
  parish_country text,
  parish_id uuid default null,
  parish_city text default null,
  parish_address text default null
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

    insert into public.parishes (id, name, diocese, state, country, city, address)
    values (gen_random_uuid(), btrim(parish_name), btrim(parish_diocese),
            btrim(parish_state), btrim(parish_country),
            nullif(btrim(coalesce(parish_city, '')), ''),
            nullif(btrim(coalesce(parish_address, '')), ''))
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
    -- The form always sends both fields, pre-filled from the saved row, so
    -- clearing one in the form is meant to clear it here too.
    update public.parishes
    set name = btrim(parish_name),
        diocese = btrim(parish_diocese),
        state = btrim(parish_state),
        country = btrim(parish_country),
        city = nullif(btrim(coalesce(parish_city, '')), ''),
        address = nullif(btrim(coalesce(parish_address, '')), '')
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

revoke all on function public.sa_save_parish(text, text, text, text, uuid, text, text) from public;
grant execute on function public.sa_save_parish(text, text, text, text, uuid, text, text) to authenticated;
