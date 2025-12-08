-- ============================================================================
-- Migration: Subadmin Permissions Support
-- Description: Updates RLS functions and policies to support subadmin permissions
-- ============================================================================

-- Update is_user_admin_for_documents function to check subadmin permissions
CREATE OR REPLACE FUNCTION public.is_user_admin_for_documents(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  has_upload_permission BOOLEAN;
BEGIN
  -- SECURITY DEFINER runs with the privileges of the function owner (postgres)
  -- This allows bypassing RLS on the profiles table
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;
  
  -- Admin has all permissions
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check if user is subadmin with upload permission
  IF user_role = 'subadmin' THEN
    SELECT can_upload_documents AND is_active INTO has_upload_permission
    FROM subadmin_permissions
    WHERE subadmin_permissions.user_id = user_id;
    
    RETURN COALESCE(has_upload_permission, false);
  END IF;
  
  RETURN false;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything goes wrong, return false (not admin/subadmin)
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Create function to check if user can view stats
CREATE OR REPLACE FUNCTION public.can_user_view_stats(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  has_stats_permission BOOLEAN;
BEGIN
  -- SECURITY DEFINER runs with the privileges of the function owner (postgres)
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;
  
  -- Admin has all permissions
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Check if user is subadmin with stats permission
  IF user_role = 'subadmin' THEN
    SELECT can_view_stats AND is_active INTO has_stats_permission
    FROM subadmin_permissions
    WHERE subadmin_permissions.user_id = user_id;
    
    RETURN COALESCE(has_stats_permission, false);
  END IF;
  
  RETURN false;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

