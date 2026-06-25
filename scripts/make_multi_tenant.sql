-- Migration: Implement Parish-Level Multi-Tenancy
-- Description: Scopes major tables to a parish UUID and updates RLS policies for admins and users.
-- Created: 2026-06-25

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ 1. GROUPS TABLE FIX ============

-- Drop the old parish_id if it exists to clean up any type mismatch
ALTER TABLE public.groups DROP COLUMN IF EXISTS parish_id;

-- Re-create parish_id as UUID referencing parishes(id)
ALTER TABLE public.groups ADD COLUMN parish_id uuid REFERENCES public.parishes(id) ON DELETE SET NULL;

-- ============ 2. ADD PARISH_ID TO OTHER TABLES ============

-- Announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS parish_id uuid REFERENCES public.parishes(id) ON DELETE CASCADE;

-- Donations
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS parish_id uuid REFERENCES public.parishes(id) ON DELETE CASCADE;

-- Pledges
ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS parish_id uuid REFERENCES public.parishes(id) ON DELETE CASCADE;

-- Mass Bookings
ALTER TABLE public.mass_bookings ADD COLUMN IF NOT EXISTS parish_id uuid REFERENCES public.parishes(id) ON DELETE CASCADE;

-- Group Requests
ALTER TABLE public.group_requests ADD COLUMN IF NOT EXISTS parish_id uuid REFERENCES public.parishes(id) ON DELETE CASCADE;

-- Group Updates
ALTER TABLE public.group_updates ADD COLUMN IF NOT EXISTS parish_id uuid REFERENCES public.parishes(id) ON DELETE CASCADE;

-- Group Messages
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS parish_id uuid REFERENCES public.parishes(id) ON DELETE CASCADE;

-- Activities
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS parish_id uuid REFERENCES public.parishes(id) ON DELETE CASCADE;

-- Ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS parish_id uuid REFERENCES public.parishes(id) ON DELETE CASCADE;

-- ============ 3. ENSURE FINANCE APPROVAL WORKFLOW FIELDS EXIST ============

-- Donations approval workflow fields
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'fulfilled', 'rejected'));
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS fulfilled_amount NUMERIC;
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Pledges approval workflow fields
ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'fulfilled', 'rejected'));
ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS fulfilled_amount NUMERIC;
ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.pledges ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- ============ 4. DATA BACKFILL ============

-- Link existing donations to their users' parishId
UPDATE public.donations d
SET parish_id = p."parishId"
FROM public.profiles p
WHERE d.user_id = p.id AND d.parish_id IS NULL;

-- Link existing pledges to their users' parishId
UPDATE public.pledges pl
SET parish_id = p."parishId"
FROM public.profiles p
WHERE pl.user_id = p.id AND pl.parish_id IS NULL;

-- Link existing mass bookings to their users' parishId
UPDATE public.mass_bookings mb
SET parish_id = p."parishId"
FROM public.profiles p
WHERE mb.user_id = p.id AND mb.parish_id IS NULL;

-- Link existing group requests to their users' parishId
UPDATE public.group_requests gr
SET parish_id = p."parishId"
FROM public.profiles p
WHERE gr.user_id = p.id AND gr.parish_id IS NULL;

-- Link existing group messages to their users' parishId
UPDATE public.group_messages gm
SET parish_id = p."parishId"
FROM public.profiles p
WHERE gm.sender = p.id AND gm.parish_id IS NULL;

-- Link existing group updates to their group's parishId if group has one
UPDATE public.group_updates gu
SET parish_id = g.parish_id
FROM public.groups g
WHERE gu."groupId" = g.id AND gu.parish_id IS NULL;

-- Link existing activities to their users' parishId
UPDATE public.activities act
SET parish_id = p."parishId"
FROM public.profiles p
WHERE act.user_id = p.id AND act.parish_id IS NULL;

-- Link existing ads to their creators' parishId
UPDATE public.ads a
SET parish_id = p."parishId"
FROM public.profiles p
WHERE a.created_by = p.id AND a.parish_id IS NULL;

-- Backfill default parish for seed announcements (using first parish if exists)
DO $$
DECLARE
  first_parish_id uuid;
BEGIN
  SELECT id INTO first_parish_id FROM public.parishes LIMIT 1;
  IF first_parish_id IS NOT NULL THEN
    UPDATE public.announcements SET parish_id = first_parish_id WHERE parish_id IS NULL;
  END IF;
END $$;

-- ============ 5. UPDATE ROW-LEVEL SECURITY (RLS) POLICIES ============

-- --- A. DONATIONS ---
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow owner select on donations" ON public.donations;
DROP POLICY IF EXISTS "Allow owner insert on donations" ON public.donations;
DROP POLICY IF EXISTS "Allow select on donations" ON public.donations;
DROP POLICY IF EXISTS "Allow insert on donations" ON public.donations;
DROP POLICY IF EXISTS "Allow update on donations for admins" ON public.donations;

CREATE POLICY "Allow select on donations" ON public.donations 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('parish_admin', 'group_admin') 
      AND profiles."parishId" = donations.parish_id
    )
  );

CREATE POLICY "Allow insert on donations" ON public.donations 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('parish_admin', 'group_admin') 
      AND profiles."parishId" = donations.parish_id
    )
  );

CREATE POLICY "Allow update on donations for admins" ON public.donations 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('parish_admin', 'group_admin') 
      AND profiles."parishId" = donations.parish_id
    )
  );

-- --- B. PLEDGES ---
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow owner operations on pledges" ON public.pledges;
DROP POLICY IF EXISTS "Allow select on pledges" ON public.pledges;
DROP POLICY IF EXISTS "Allow insert on pledges" ON public.pledges;
DROP POLICY IF EXISTS "Allow update on pledges for admins" ON public.pledges;

CREATE POLICY "Allow select on pledges" ON public.pledges 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('parish_admin', 'group_admin') 
      AND profiles."parishId" = pledges.parish_id
    )
  );

CREATE POLICY "Allow insert on pledges" ON public.pledges 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('parish_admin', 'group_admin') 
      AND profiles."parishId" = pledges.parish_id
    )
  );

CREATE POLICY "Allow update on pledges for admins" ON public.pledges 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('parish_admin', 'group_admin') 
      AND profiles."parishId" = pledges.parish_id
    )
  );

-- --- C. ANNOUNCEMENTS ---
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow announcements reading for anyone" ON public.announcements;
DROP POLICY IF EXISTS "Allow admins to manage announcements" ON public.announcements;

CREATE POLICY "Allow select on announcements" ON public.announcements 
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (
      parish_id = (SELECT "parishId" FROM public.profiles WHERE profiles.id = auth.uid())
      OR parish_id IS NULL
    )
  );

CREATE POLICY "Allow admin write on announcements" ON public.announcements 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('parish_admin', 'group_admin') 
      AND profiles."parishId" = announcements.parish_id
    )
  );

-- --- D. GROUPS ---
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select on groups" ON public.groups;
DROP POLICY IF EXISTS "Allow admin write on groups" ON public.groups;
DROP POLICY IF EXISTS "Allow users to join open groups" ON public.groups;

CREATE POLICY "Allow select on groups" ON public.groups 
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND (
      parish_id IS NULL 
      OR parish_id = (SELECT "parishId" FROM public.profiles WHERE profiles.id = auth.uid())
    )
  );

CREATE POLICY "Allow select on open groups" ON public.groups 
  FOR SELECT USING (
    is_secure = false
    OR (
      auth.uid() IS NOT NULL 
      AND (
        parish_id = (SELECT "parishId" FROM public.profiles WHERE profiles.id = auth.uid())
      )
    )
  );

CREATE POLICY "Allow admin write on groups" ON public.groups 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('parish_admin', 'group_admin') 
      AND (groups.parish_id IS NULL OR profiles."parishId" = groups.parish_id)
    )
  );

-- --- E. GROUP REQUESTS ---
ALTER TABLE public.group_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow owner and admin select on requests" ON public.group_requests;
DROP POLICY IF EXISTS "Allow owner insert on requests" ON public.group_requests;

CREATE POLICY "Allow select on requests" ON public.group_requests 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('parish_admin', 'group_admin') 
      AND profiles."parishId" = group_requests.parish_id
    )
  );

CREATE POLICY "Allow owner insert on requests" ON public.group_requests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin delete on requests" ON public.group_requests 
  FOR DELETE USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('parish_admin', 'group_admin') 
      AND profiles."parishId" = group_requests.parish_id
    )
  );

-- --- F. GROUP UPDATES ---
ALTER TABLE public.group_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select on group updates" ON public.group_updates;
DROP POLICY IF EXISTS "Allow admin write on group updates" ON public.group_updates;

CREATE POLICY "Allow select on group updates" ON public.group_updates 
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND parish_id = (SELECT "parishId" FROM public.profiles WHERE profiles.id = auth.uid())
  );

CREATE POLICY "Allow admin write on group updates" ON public.group_updates 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('parish_admin', 'group_admin') 
      AND profiles."parishId" = group_updates.parish_id
    )
  );

-- --- G. GROUP MESSAGES ---
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select on group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Allow insert on group messages" ON public.group_messages;

CREATE POLICY "Allow select on group messages" ON public.group_messages 
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND parish_id = (SELECT "parishId" FROM public.profiles WHERE profiles.id = auth.uid())
  );

CREATE POLICY "Allow insert on group messages" ON public.group_messages 
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND parish_id = (SELECT "parishId" FROM public.profiles WHERE profiles.id = auth.uid())
  );

-- --- H. MASS BOOKINGS ---
ALTER TABLE public.mass_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow owner select on mass bookings" ON public.mass_bookings;
DROP POLICY IF EXISTS "Allow insert on mass bookings" ON public.mass_bookings;
DROP POLICY IF EXISTS "Allow owner delete on mass bookings" ON public.mass_bookings;

CREATE POLICY "Allow select on mass bookings" ON public.mass_bookings 
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'parish_admin' 
      AND profiles."parishId" = mass_bookings.parish_id
    )
  );

CREATE POLICY "Allow insert on mass bookings" ON public.mass_bookings 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR user_id IS NULL
  );

CREATE POLICY "Allow owner delete on mass bookings" ON public.mass_bookings 
  FOR DELETE USING (auth.uid() = user_id);

-- --- I. ACTIVITIES ---
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS activities_admin_all ON public.activities;
DROP POLICY IF EXISTS activities_users_own ON public.activities;
DROP POLICY IF EXISTS activities_insert_self ON public.activities;
DROP POLICY IF EXISTS activities_update_admin ON public.activities;

CREATE POLICY activities_select ON public.activities
  FOR SELECT USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'parish_admin' 
      AND profiles."parishId" = activities.parish_id
    )
  );

CREATE POLICY activities_insert ON public.activities
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY activities_update ON public.activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'parish_admin' 
      AND profiles."parishId" = activities.parish_id
    )
  );

-- --- J. ADS ---
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ads_admin_all ON public.ads;
DROP POLICY IF EXISTS ads_users_read ON public.ads;

CREATE POLICY ads_select ON public.ads
  FOR SELECT USING (
    is_active = true
    AND start_date <= NOW()
    AND (end_date IS NULL OR end_date > NOW())
    AND parish_id = (SELECT "parishId" FROM public.profiles WHERE profiles.id = auth.uid())
  );

CREATE POLICY ads_admin_all ON public.ads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'parish_admin' 
      AND profiles."parishId" = ads.parish_id
    )
  );

-- ============ 6. PARISH HISTORY FEATURES ============

-- Add history columns to public.parishes table
ALTER TABLE public.parishes ADD COLUMN IF NOT EXISTS founded VARCHAR;
ALTER TABLE public.parishes ADD COLUMN IF NOT EXISTS patron VARCHAR;
ALTER TABLE public.parishes ADD COLUMN IF NOT EXISTS bishop VARCHAR;
ALTER TABLE public.parishes ADD COLUMN IF NOT EXISTS parish_priest VARCHAR;
ALTER TABLE public.parishes ADD COLUMN IF NOT EXISTS brief TEXT;
ALTER TABLE public.parishes ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Enable RLS on parishes table
ALTER TABLE public.parishes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select on parishes for anyone" ON public.parishes;
DROP POLICY IF EXISTS "Allow update on parishes for parish admins" ON public.parishes;

CREATE POLICY "Allow select on parishes for anyone" ON public.parishes
  FOR SELECT USING (true);

CREATE POLICY "Allow update on parishes for parish admins" ON public.parishes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'parish_admin'
      AND profiles."parishId" = parishes.id
    )
  );

-- Backfill history for St. Patrick's Parish Ikeja if it exists
UPDATE public.parishes
SET 
  founded = '1952',
  patron = 'St. Patrick',
  bishop = 'Most Rev. Ignatius Kaigama',
  parish_priest = 'Rev. Fr. Emmanuel Okafor',
  brief = 'St. Patrick''s Parish was founded in 1952 by the Society of African Missions. Over the decades, it has grown from a small mission outpost to a vibrant Catholic community with over 3,000 registered families. The parish has been a beacon of faith, education, and social service in the region, establishing schools, hospitals, and community programs that continue to serve thousands today.'
WHERE name ILIKE '%Ikeja%' OR id = '95d71feb-3435-4c1c-9340-65c22b93e899';

-- Backfill placeholder history for other parishes
UPDATE public.parishes
SET 
  founded = '2000',
  patron = name,
  bishop = 'Most Rev. Ignatius Kaigama',
  parish_priest = 'Rev. Fr. John Doe',
  brief = name || ' was established to serve the spiritual needs of the Catholic faithful in the region. We are a community dedicated to liturgy, service, and growing together in faith.'
WHERE founded IS NULL;

-- ============ 7. GROUP MESSAGES SENDER RELATIONSHIP ============

-- Clean up orphaned group messages that reference non-existent profiles
DELETE FROM public.group_messages 
WHERE sender IS NOT NULL 
  AND sender NOT IN (SELECT id FROM public.profiles);

-- Add foreign key constraint linking group_messages.sender to profiles(id)
ALTER TABLE public.group_messages
DROP CONSTRAINT IF EXISTS group_messages_sender_fkey,
ADD CONSTRAINT group_messages_sender_fkey 
FOREIGN KEY (sender) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;


