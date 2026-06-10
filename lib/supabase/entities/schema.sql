-- Enable UUID and pg_net extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_net;

-- 1. Parishes Table
create table public.parishes (
    id text primary key,
    name text not null,
    diocese text not null,
    state text not null,
    country text not null
);

-- 2. Profiles Table (linked to auth.users)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    "fullName" text not null,
    "baptismalName" text,
    email text not null unique,
    sex text check (sex in ('Male', 'Female')),
    "birthdayMonth" text not null,
    "parishId" text references public.parishes(id) on delete set null,
    "parishName" text,
    "groupId" text not null,
    "groupName" text,
    role text not null default 'member' check (role in ('member', 'group_admin', 'parish_admin')),
    "hasParishAccess" boolean not null default false,
    "createdAt" timestamptz not null default now()
);

-- 3. Announcements Table
create table public.announcements (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    body text not null,
    category text not null,
    date text not null, -- YYYY-MM-DD
    important boolean not null default false,
    author text not null
);

-- 4. Donations Table
create table public.donations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    description text not null,
    amount numeric not null,
    currency text not null,
    date text not null, -- YYYY-MM-DD
    category text not null,
    receipt text
);

-- 5. Pledges Table
create table public.pledges (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    "targetAmount" numeric not null,
    currency text not null,
    "dueDate" text not null, -- YYYY-MM-DD
    "isPaid" boolean not null default false,
    "paidDate" text, -- YYYY-MM-DD
    "paidAmount" numeric
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  image text null,
  group_admin_id uuid null references public.profiles(id) on delete set null,
  parish_id uuid null references public.parishes(id) on delete set null,
  is_secure boolean not null default false,
  member_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
  update_at timestamptz not null default now()
);

insert into public.groups (name, description, is_secure) values
('Catholic Men Organization', 'A fraternal organization for Catholic men committed to serving the Church, their families, and the community through faith, works, and charity.', false),
('Catholic Women Organization', 'An association of Catholic women dedicated to the spiritual, social, and economic development of women in the Church and society.', false),
('Catholic Youth Organization of Nigeria', 'The youth wing of the Catholic Church in Nigeria, committed to the spiritual, social, and moral development of young people.', false),
('Holy Childhood Association', 'A missionary movement for children, helping them to pray, sacrifice, and give to their peers in mission territories.', false),

-- 6. Group Updates Table
create table public.group_updates (
    id uuid primary key default gen_random_uuid(),
    "groupId" uuid not null references public.groups(id) on delete cascade,
    title text not null,
    body text not null,
    date text not null, -- YYYY-MM-DD
    author text not null
);

-- 7. Group Requests Table
create table public.group_requests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade,
    "userName" text not null,
    "targetGroupId" uuid references public.groups(id) on delete cascade,
    "currentGroupId" uuid references public.groups(id) on delete set null,
    "requestDate" timestamptz not null default now()
);

-- 8. Group Messages Table
create table public.group_messages (
    id uuid primary key default gen_random_uuid(),
    "groupId" uuid not null references public.groups(id) on delete cascade,
    sender uuid not null references public.profiles(id) on delete cascade,
    "senderRole" text not null,
    content text not null,
    timestamp text not null -- HH:MM AM/PM
);

-- 9. Mass Bookings Table
create table public.mass_bookings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade,
    "bookerName" text not null,
    day text not null,
    time text not null,
    date text not null, -- YYYY-MM-DD
    "formattedDate" text not null,
    "intentionType" text not null,
    "intentionDetails" text not null,
    "offertoryAmount" text not null,
    "parishName" text not null,
    "createdAt" timestamptz not null default now(),
    "refId" text not null unique
);

-- ─── PARISH SEED DATA ───
insert into public.parishes (id, name, diocese, state, country) values
('48b25785-3f2a-4a36-90b8-ae81721dd135', 'Holy Cross Cathedral', 'Lagos', 'Lagos', 'Nigeria'),
  ('95d71feb-3435-4c1c-9340-65c22b93e899', 'St. Patrick''s Parish Ikeja', 'Lagos', 'Lagos', 'Nigeria'),
  ('759dc013-d42d-4790-a2fb-72c98d464283', 'Our Lady of Fatima Parish', 'Lagos', 'Lagos', 'Nigeria'),
  ('b4c27928-6a89-49e8-aaad-199c8b6b19e8', 'St. Agnes Parish Maryland', 'Lagos', 'Lagos', 'Nigeria'),
  ('4c189d66-5bf8-465d-b7a3-292c30ac87d9', 'Christ the King Parish Mushin', 'Lagos', 'Lagos', 'Nigeria'),
  ('030794b0-75e6-41d7-9606-f8a53e93967a', 'St. Paul''s Parish Ebute-Metta', 'Lagos', 'Lagos', 'Nigeria'),
  ('79de3156-b132-46de-9e68-711e7c9fb648', 'St. Dominic''s Parish Yaba', 'Lagos', 'Lagos', 'Nigeria'),
  ('c3631eea-069a-479a-bfae-178e2d5c2224', 'National Christian Centre Abuja', 'Abuja', 'FCT', 'Nigeria'),
  ('9a32c5f6-c6dd-4698-b715-643304f92981', 'Our Lady Queen of Nigeria Pro-Cathedral', 'Abuja', 'FCT', 'Nigeria'),
  ('2a654283-af19-4fe0-bec6-72381d0b47b6', 'St. Michael''s Parish Garki', 'Abuja', 'FCT', 'Nigeria'),
  ('558aebb9-15b0-4ae9-962b-a998087c752f', 'Holy Trinity Parish Maitama', 'Abuja', 'FCT', 'Nigeria'),
  ('64d57b46-f565-46c2-b136-2bb7698b3b20', 'Holy Ghost Cathedral Enugu', 'Enugu', 'Enugu', 'Nigeria'),
  ('c5330644-00ac-44df-9912-e3d84dd10a45', 'St. Theresa''s Parish Enugu', 'Enugu', 'Enugu', 'Nigeria'),
  ('e216d1c3-db65-49e2-b6e3-e796a00534a6', 'St. John''s Parish Nsukka', 'Enugu', 'Enugu', 'Nigeria'),
  ('ec0f7107-f151-43e2-840a-81d02011e413', 'All Saints Cathedral Onitsha', 'Onitsha', 'Anambra', 'Nigeria'),
  ('3e9ec7ad-2071-46ef-99b3-a30ccd80c1b9', 'St. Joseph''s Parish Awka', 'Onitsha', 'Anambra', 'Nigeria'),
  ('6a7c28f2-fad2-4bb4-b0e8-9d9f36bb5396', 'Our Lady of Lourdes Parish Nnewi', 'Onitsha', 'Anambra', 'Nigeria'),
  ('4b87e14f-3158-41e4-ac1e-750f27ea8fd0', 'St. Anne''s Cathedral Ibadan', 'Ibadan', 'Oyo', 'Nigeria'),
  ('52071baa-21f0-4319-b3d6-7d103df173cd', 'Christ the King Parish Bodija', 'Ibadan', 'Oyo', 'Nigeria'),
  ('bcd6802c-eedd-45a5-ae2b-00c8a7162440', 'St. Ignatius Cathedral Port Harcourt', 'Port Harcourt', 'Rivers', 'Nigeria'),
  ('ff38dc0e-1c2e-4d3e-a1ac-d9316dbcf786', 'Our Lady of Perpetual Help Parish', 'Port Harcourt', 'Rivers', 'Nigeria'),
  ('7823f59c-1e21-41f1-9863-4ddc2a328e56', 'St. Patrick''s Cathedral New York', 'New York', 'New York', 'USA'),
  ('09675a52-ca9a-4708-8e9e-a979164d6d55', 'Westminster Cathedral', 'Westminster', 'London', 'UK'),
  ('ea0dd478-e8e1-4757-b9c2-353f61246c1c', 'St. Peter''s Basilica', 'Vatican', 'Vatican City', 'Vatican'),
  ('9b0aed11-2e17-4917-ae80-963916491575', 'Sacred Heart Parish Toronto', 'Toronto', 'Ontario', 'Canada')
on conflict (id) do update set
  name = excluded.name,
  diocese = excluded.diocese,
  state = excluded.state,
  country = excluded.country;

-- ─── ROW LEVEL SECURITY (RLS) POLICIES ───

-- Enable RLS on all tables
alter table public.parishes enable row level security;
alter table public.profiles enable row level security;
alter table public.announcements enable row level security;
alter table public.donations enable row level security;
alter table public.pledges enable row level security;
alter table public.group_updates enable row level security;
alter table public.group_requests enable row level security;
alter table public.group_messages enable row level security;
alter table public.mass_bookings enable row level security;

-- 1. Parishes Policies (Read for all, Insert/Update/Delete for Admins)
create policy "Allow read access for anyone" on public.parishes for select using (true);
create policy "Allow parish admins to edit parishes" on public.parishes for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and role = 'parish_admin'));

-- 2. Profiles Policies (Read for all authenticated, Update for self)
create policy "Allow profiles reading for authenticated users" on public.profiles for select using (auth.uid() is not null);
create policy "Allow individuals to update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow profiles registration during signup" on public.profiles for insert with check (true);

-- 3. Announcements Policies (Read for all, Write for group/parish admins)
create policy "Allow announcements reading for anyone" on public.announcements for select using (true);
create policy "Allow admins to manage announcements" on public.announcements for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and role in ('group_admin', 'parish_admin')));

-- 4. Donations Policies (Read/Write for owner only)
create policy "Allow owner select on donations" on public.donations for select using (auth.uid() = user_id);
create policy "Allow owner insert on donations" on public.donations for insert with check (auth.uid() = user_id);

-- 5. Pledges Policies (Read/Write/Update for owner only)
create policy "Allow owner operations on pledges" on public.pledges for all using (auth.uid() = user_id);

-- 6. Group Updates Policies (Read for all authenticated, Write for group/parish admins)
create policy "Allow select on group updates" on public.group_updates for select using (auth.uid() is not null);
create policy "Allow admin write on group updates" on public.group_updates for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and role in ('group_admin', 'parish_admin')));

create policy "Allow select on groups" on public.groups for select using (true);
create policy "Allow admin write on groups" on public.groups for all
  using (exists (select 1 from public.profiles where profiles.id = auth.uid() and role in ('group_admin', 'parish_admin')));

create policy "Allow users to join open groups" on public.groups for update
  using (is_secure = false)
  with check (is_secure = false);

-- 7. Group Requests Policies (Read for owner & group admins, Write for owner)
create policy "Allow owner and admin select on requests" on public.group_requests for select 
  using (auth.uid() = user_id or exists (select 1 from public.profiles where profiles.id = auth.uid() and role in ('group_admin', 'parish_admin')));
create policy "Allow owner insert on requests" on public.group_requests for insert with check (auth.uid() = user_id);

-- 8. Group Messages Policies (Read/Write for all authenticated users)
create policy "Allow select on group messages" on public.group_messages for select using (auth.uid() is not null);
create policy "Allow insert on group messages" on public.group_messages for insert with check (auth.uid() is not null);

-- 9. Mass Bookings Policies (Read/Write for owner, Read for parish admins)
create policy "Allow owner select on mass bookings" on public.mass_bookings for select 
  using (auth.uid() = user_id or exists (select 1 from public.profiles where profiles.id = auth.uid() and role = 'parish_admin'));
create policy "Allow insert on mass bookings" on public.mass_bookings for insert with check (auth.uid() = user_id or user_id is null);
create policy "Allow owner delete on mass bookings" on public.mass_bookings for delete using (auth.uid() = user_id);

-- 10. Notifications Table
create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    body text not null,
    unread boolean not null default true,
    type text not null check (type in ('giving', 'announcement', 'group', 'system')),
    created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Allow owner select on notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Allow owner update on notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Allow owner delete on notifications" on public.notifications for delete using (auth.uid() = user_id);
create policy "Allow owner insert on notifications" on public.notifications for insert with check (auth.uid() = user_id);

-- 11. Push Notifications Trigger & Migration
alter table public.profiles add column if not exists push_token text;

-- Create helper function to invoke Edge Function
create or replace function public.on_notification_inserted()
returns trigger as $$
declare
  req_headers text;
  auth_header text := '';
begin
  req_headers := current_setting('request.headers', true);
  if req_headers is not null and req_headers <> '' then
    begin
      auth_header := req_headers::json->>'authorization';
    exception when others then
      auth_header := '';
    end;
  end if;

  perform net.http_post(
    url := 'https://eivpztqeitqsmykxlwuh.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', coalesce(auth_header, '')
    ),
    body := jsonb_build_object('record', row_to_json(new))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger on notifications table
create or replace trigger trigger_notification_inserted
  after insert on public.notifications
  for each row execute function public.on_notification_inserted();
