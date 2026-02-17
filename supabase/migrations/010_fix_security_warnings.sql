-- Fix Supabase Security Warnings
-- 1. Function Search Path Mutable
-- 2. RLS Policy Always True

-- ============================================================================
-- Fix 1: Add search_path security to functions
-- ============================================================================

-- Update the update_updated_at_column function with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function with secure search_path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Runner'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Fix 2: Replace RLS policy that uses "WITH CHECK (true)"
-- ============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can insert oauth attempts" ON oauth_attempts;

-- Create a more restrictive policy
-- Allow authenticated users to insert attempts, but ensure they're not setting arbitrary user_ids
CREATE POLICY "Users can insert oauth attempts during flow" ON oauth_attempts
  FOR INSERT
  WITH CHECK (
    -- Either user_id is NULL (initiation step before user is known)
    -- OR it matches the authenticated user
    user_id IS NULL OR user_id = auth.uid()
  );

-- Add comment explaining the policy
COMMENT ON POLICY "Users can insert oauth attempts during flow" ON oauth_attempts IS
  'Allows inserting oauth attempts during the flow. user_id can be NULL initially (before user authenticates) or must match the authenticated user.';
