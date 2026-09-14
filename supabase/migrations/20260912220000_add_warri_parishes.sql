-- Adds ten parishes in the Catholic Diocese of Warri, Delta State.
--
-- Matched on name rather than id so re-running is harmless and so a parish
-- already present under a different id is not duplicated. Ids are generated
-- rather than fixed because nothing outside the database references them yet.
--
-- Note on `diocese`: the four rows already in this table use it for the
-- locality (Agbarho, Effurun, Ekpan) rather than the ecclesiastical diocese.
-- These ten all sit in the Diocese of Warri, and each locality is already
-- part of the parish name, so the field carries the actual diocese here.
insert into public.parishes (id, name, diocese, state, country)
select gen_random_uuid(), v.name, 'Warri', 'Delta', 'Nigeria'
from (values
  ('Sacred Heart Catholic Cathedral, Warri'),
  ('St. Anthony Catholic Church, Ugborikoko'),
  ('Corpus Christi Catholic Church, Jakpa, Effurun'),
  ('Catholic Church of the Ascension, Shagoulor Refinery Area, Ekpan'),
  ('Catholic Church of Epiphany, Jakpa'),
  ('Catholic Church of Assumption, Idama'),
  ('Blessed Tansi Catholic Church, Ugboroke, Effurun'),
  ('Annunciation Catholic Church, Ogunu'),
  ('Our Lady of Apostles Catholic Church, Jeddo'),
  ('St. Jude Catholic Church, GRA, Effurun')
) as v(name)
where not exists (
  select 1 from public.parishes p where lower(btrim(p.name)) = lower(btrim(v.name))
);

-- Every parish needs a mass schedule, otherwise the booking form has no days
-- or times to offer. The earlier schedules migration seeded the parishes that
-- existed then; these ten need the same starting point.
insert into public.parish_schedule_items (parish_id, kind, label, times, icon, sort_order)
select p.id, 'mass', d.label, d.times, 'calendar-sharp', d.sort_order
from public.parishes p
cross join (values
  ('Sunday',   array['6:00 AM', '8:30 AM', '10:30 AM', '6:00 PM'], 0),
  ('Weekdays', array['6:30 AM', '12:00 PM'],                       1),
  ('Saturday', array['7:00 AM', '5:00 PM'],                        2)
) as d(label, times, sort_order)
where not exists (
  select 1 from public.parish_schedule_items existing
  where existing.parish_id = p.id
    and existing.kind = 'mass'
    and lower(existing.label) = lower(d.label)
);

insert into public.parish_schedule_items (parish_id, kind, label, details, icon, sort_order)
select p.id, 'sacrament', 'Confession Times',
  'Every Saturday after the Morning Mass (approx. 7:45 AM) and before the Evening Mass (4:15 PM - 4:45 PM). Or by private appointment with the Parish Priest.',
  'heart-half-sharp', 0
from public.parishes p
where not exists (
  select 1 from public.parish_schedule_items existing
  where existing.parish_id = p.id and existing.kind = 'sacrament'
);

insert into public.parish_schedule_items (parish_id, kind, label, details, icon, sort_order)
select p.id, 'devotion', 'Eucharistic Adoration',
  'Every Thursday evening at 5:30 PM followed by Benediction. Come and spend quiet time in the presence of the Blessed Sacrament.',
  'flame-sharp', 0
from public.parishes p
where not exists (
  select 1 from public.parish_schedule_items existing
  where existing.parish_id = p.id and existing.kind = 'devotion'
);
