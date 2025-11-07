-- ============================================================================
-- Migration: Fix Documents Table RLS Policies (Version 2)
-- Description: Alternative approach - ensures function can read profiles table
-- ============================================================================

-- First, ensure the function exists and can read from profiles
-- Drop and recreate with explicit permissions
DROP FUNCTION IF EXISTS public.is_user_admin_for_documents(UUID);

-- Create function with explicit RLS bypass
CREATE OR REPLACE FUNCTION public.is_user_admin_for_documents(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- SECURITY DEFINER should bypass RLS, but let's be explicit
  -- Query profiles table directly - SECURITY DEFINER runs as postgres user
  SELECT role INTO STRICT user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN false;
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Error checking admin status for user %: %', user_id, SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION public.is_user_admin_for_documents(UUID) TO authenticated;

-- Drop and recreate the UPDATE policy with a simpler check
DROP POLICY IF EXISTS "Admins can update documents" ON documents;

CREATE POLICY "Admins can update documents"
ON documents FOR UPDATE
TO authenticated
USING (
  public.is_user_admin_for_documents(auth.uid())
)
WITH CHECK (
  -- Only check if user is admin - don't restrict any field values
  public.is_user_admin_for_documents(auth.uid())
);

