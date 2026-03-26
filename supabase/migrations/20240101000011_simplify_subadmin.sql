-- ============================================================================
-- Migration: Simplify Subadmin Access
-- Description: Drops the subadmin_permissions table and simplifies RLS functions
--              to enforce a strict "Read-Only" policy for subadmins.
-- ============================================================================

-- 1. Drop the subadmin_permissions table
DROP TABLE IF EXISTS "public"."subadmin_permissions" CASCADE;

-- 2. Simplify is_user_admin_for_documents function
-- Now only returns true for super-admins.
-- Subadmins will no longer have "admin-like" document management powers.
CREATE OR REPLACE FUNCTION public.is_user_admin_for_documents(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  -- Only super-admin has management permissions
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- 3. Drop can_user_view_stats function (deprecated)
-- Subadmin's ability to view stats will be handled in the application layer.
DROP FUNCTION IF EXISTS public.can_user_view_stats(UUID);

-- 4. Re-grant execute on simplified function
GRANT EXECUTE ON FUNCTION public.is_user_admin_for_documents(UUID) TO authenticated;
