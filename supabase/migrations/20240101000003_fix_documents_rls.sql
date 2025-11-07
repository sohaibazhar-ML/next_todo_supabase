-- ============================================================================
-- Migration: Fix Documents Table RLS Policies
-- Description: Fixes RLS policies for documents table to avoid recursion
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view active documents" ON documents;
DROP POLICY IF EXISTS "Admins can insert documents" ON documents;
DROP POLICY IF EXISTS "Admins can update documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

-- Create helper function to check if user is admin (SECURITY DEFINER to avoid recursion)
-- This function bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION public.is_user_admin_for_documents(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- SECURITY DEFINER runs with the privileges of the function owner (postgres)
  -- This allows bypassing RLS on the profiles table
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(user_role = 'admin', false);
EXCEPTION
  WHEN OTHERS THEN
    -- If anything goes wrong, return false (not admin)
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Policy: All authenticated users can view all documents
CREATE POLICY "Users can view documents"
ON documents FOR SELECT
TO authenticated
USING (
  auth.role() = 'authenticated'
);

-- Policy: Only admins can insert documents
CREATE POLICY "Admins can insert documents"
ON documents FOR INSERT
WITH CHECK (
  public.is_user_admin_for_documents(auth.uid())
);

-- Policy: Only admins can update documents
-- Note: WITH CHECK allows the new row after update, USING checks the existing row
-- IMPORTANT: WITH CHECK must not restrict is_active values - admins can set it to true or false
CREATE POLICY "Admins can update documents"
ON documents FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND public.is_user_admin_for_documents(auth.uid()) = true
)
WITH CHECK (
  -- Allow admin to update any field, including setting is_active to false
  -- Don't check is_active value here - only check if user is admin
  auth.uid() IS NOT NULL
  AND public.is_user_admin_for_documents(auth.uid()) = true
);

-- Policy: Only admins can delete documents
CREATE POLICY "Admins can delete documents"
ON documents FOR DELETE
USING (
  public.is_user_admin_for_documents(auth.uid())
);

