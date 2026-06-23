-- Migration: Add Donation & Pledge Approval Workflow
-- Description: Adds status tracking, fulfilled amounts, and admin approval fields
-- Created: 2026-06-22

-- ============ DONATIONS TABLE UPDATES ============

-- Add status column if it doesn't exist
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'fulfilled', 'rejected'));

-- Add fulfilled_amount column (admin records actual amount received)
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS fulfilled_amount NUMERIC;

-- Add admin approval tracking
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add admin notes (for approval or rejection reason)
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_approved_by ON donations(approved_by);
CREATE INDEX IF NOT EXISTS idx_donations_user_status ON donations(user_id, status);

-- ============ PLEDGES TABLE UPDATES ============

-- Add status column if it doesn't exist
ALTER TABLE pledges 
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'fulfilled', 'rejected'));

-- Add fulfilled_amount column (admin records actual amount received)
ALTER TABLE pledges 
ADD COLUMN IF NOT EXISTS fulfilled_amount NUMERIC;

-- Add admin approval tracking
ALTER TABLE pledges 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE pledges 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add admin notes (for approval or rejection reason)
ALTER TABLE pledges 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_pledges_status ON pledges(status);
CREATE INDEX IF NOT EXISTS idx_pledges_approved_by ON pledges(approved_by);
CREATE INDEX IF NOT EXISTS idx_pledges_user_status ON pledges(user_id, status);

-- ============ HELPER FUNCTION FOR TIMESTAMP ============

-- Create trigger function to auto-update updated_at if it exists
CREATE OR REPLACE FUNCTION update_donation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donations' AND column_name='updated_at') THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger if table has updated_at column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='donations' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS donation_update_timestamp ON donations;
    CREATE TRIGGER donation_update_timestamp BEFORE UPDATE ON donations
    FOR EACH ROW EXECUTE FUNCTION update_donation_timestamp();
  END IF;
END $$;

-- Repeat for pledges
CREATE OR REPLACE FUNCTION update_pledge_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pledges' AND column_name='updated_at') THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pledges' AND column_name='updated_at') THEN
    DROP TRIGGER IF EXISTS pledge_update_timestamp ON pledges;
    CREATE TRIGGER pledge_update_timestamp BEFORE UPDATE ON pledges
    FOR EACH ROW EXECUTE FUNCTION update_pledge_timestamp();
  END IF;
END $$;
