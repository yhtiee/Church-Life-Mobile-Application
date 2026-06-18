-- Create activities table for tracking user activities (group requests, transitions, donations, bookings)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR NOT NULL CHECK (activity_type IN ('group_join_request', 'group_transition_request', 'donation', 'booking_request')),
  reference_type VARCHAR, -- 'group', 'donation', 'booking', 'mass'
  reference_id UUID, -- FK to groups, donations, bookings, etc.
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON activities(activity_type);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Admins (parish_admin role) can see ALL activities
CREATE POLICY activities_admin_all ON activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'parish_admin'
  )
);

-- RLS Policy 2: Regular users can only see their own activities
CREATE POLICY activities_users_own ON activities
FOR SELECT
USING (user_id = auth.uid());

-- RLS Policy 3: Users and admins can create activities
CREATE POLICY activities_insert_self ON activities
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- RLS Policy 4: Admins can update activity status
CREATE POLICY activities_update_admin ON activities
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'parish_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'parish_admin'
  )
);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
