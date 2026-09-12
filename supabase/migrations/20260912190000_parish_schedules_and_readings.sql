-- Per-parish mass schedules, devotions, sacraments and daily readings.
--
-- These were hardcoded: mass times in the MASS_TIMES constant, and the
-- confession, adoration and reflection copy written straight into the JSX.
-- Every parish therefore showed the same details regardless of its own.
--
-- Unlike the role and membership functions in earlier migrations, plain row
-- level security is enough here. These are ordinary content columns, so an
-- admin writing any of them is exactly what is intended; there is no
-- privilege escalation to guard against.

-- ─────────────────────────────────────────────────────────────
-- 1. Schedule items
-- ─────────────────────────────────────────────────────────────

create table if not exists public.parish_schedule_items (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  -- 'mass'      → label is a day name, times holds that day's mass times
  -- 'devotion'  → label is the devotion's name, details describes it
  -- 'sacrament' → label is the sacrament, details gives times and terms
  kind text not null,
  label text not null,
  times text[] not null default '{}',
  details text,
  -- Ionicons name. Null lets the app pick a sensible default per kind.
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parish_schedule_kind_check
    check (kind in ('mass', 'devotion', 'sacrament'))
);

create index if not exists parish_schedule_items_parish_idx
  on public.parish_schedule_items (parish_id, kind, sort_order);

-- A parish lists each mass day once.
create unique index if not exists parish_schedule_one_row_per_mass_day
  on public.parish_schedule_items (parish_id, lower(label))
  where kind = 'mass';

-- ─────────────────────────────────────────────────────────────
-- 2. Daily readings and reflection
-- ─────────────────────────────────────────────────────────────

create table if not exists public.parish_daily_readings (
  id uuid primary key default gen_random_uuid(),
  parish_id uuid not null references public.parishes(id) on delete cascade,
  reading_date date not null,
  first_reading text,
  psalm text,
  second_reading text,
  gospel text,
  reflection text,
  -- Who it is attributed to in the app, e.g. "Fr. Emmanuel". Free text, so a
  -- parish can credit someone who has no account.
  author text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parish_daily_readings_unique_day unique (parish_id, reading_date)
);

create index if not exists parish_daily_readings_lookup_idx
  on public.parish_daily_readings (parish_id, reading_date desc);

-- ─────────────────────────────────────────────────────────────
-- 3. Keep updated_at honest
-- ─────────────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists parish_schedule_items_touch on public.parish_schedule_items;
create trigger parish_schedule_items_touch
  before update on public.parish_schedule_items
  for each row execute function public.touch_updated_at();

drop trigger if exists parish_daily_readings_touch on public.parish_daily_readings;
create trigger parish_daily_readings_touch
  before update on public.parish_daily_readings
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 4. Row level security
-- ─────────────────────────────────────────────────────────────

alter table public.parish_schedule_items enable row level security;
alter table public.parish_daily_readings enable row level security;

-- Readable by any signed-in user, not just the parish's own members. Mass
-- times are public notices, and someone weighing a transfer should be able to
-- see them before they move.
drop policy if exists "Anyone signed in can read schedules" on public.parish_schedule_items;
create policy "Anyone signed in can read schedules"
  on public.parish_schedule_items for select
  using (auth.uid() is not null);

drop policy if exists "Parish admins manage their schedules" on public.parish_schedule_items;
create policy "Parish admins manage their schedules"
  on public.parish_schedule_items for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'parish_admin'
        and p."parishId" = parish_schedule_items.parish_id
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'parish_admin'
        and p."parishId" = parish_schedule_items.parish_id
    )
  );

drop policy if exists "Anyone signed in can read readings" on public.parish_daily_readings;
create policy "Anyone signed in can read readings"
  on public.parish_daily_readings for select
  using (auth.uid() is not null);

drop policy if exists "Parish admins manage their readings" on public.parish_daily_readings;
create policy "Parish admins manage their readings"
  on public.parish_daily_readings for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'parish_admin'
        and p."parishId" = parish_daily_readings.parish_id
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'parish_admin'
        and p."parishId" = parish_daily_readings.parish_id
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 5. Seed every parish with the values that were hardcoded
-- ─────────────────────────────────────────────────────────────

-- Without this the booking form would have no days or times to offer for any
-- parish that has not configured a schedule yet.
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
