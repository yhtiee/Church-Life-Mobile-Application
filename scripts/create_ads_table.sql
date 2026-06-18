-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Learn More',
  cta_url TEXT,
  category TEXT DEFAULT 'Promotion',
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS ads_active_dates_idx 
  ON ads(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS ads_created_by_idx 
  ON ads(created_by);

-- Enable RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Policy: Parish admins can do everything
CREATE POLICY ads_admin_all ON ads
  FOR ALL
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

-- Policy: Regular users can only view active, non-expired ads
CREATE POLICY ads_users_read ON ads
  FOR SELECT
  USING (
    is_active = true
    AND start_date <= NOW()
    AND (end_date IS NULL OR end_date > NOW())
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ads_updated_at_trigger ON ads;
CREATE TRIGGER ads_updated_at_trigger
  BEFORE UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION update_ads_updated_at();

