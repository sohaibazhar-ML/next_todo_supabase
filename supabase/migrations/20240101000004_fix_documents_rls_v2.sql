-- Update function safely without dropping
CREATE OR REPLACE FUNCTION public.is_user_admin_for_documents(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO STRICT user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN false;
  WHEN OTHERS THEN
    RAISE WARNING 'Error checking admin status for user %: %', user_id, SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Grant execute to authenticated role
GRANT EXECUTE ON FUNCTION public.is_user_admin_for_documents(UUID) TO authenticated;

-- Recreate the update policy
DROP POLICY IF EXISTS "Admins can update documents" ON documents;

CREATE POLICY "Admins can update documents"
ON documents FOR UPDATE
TO authenticated
USING (
  public.is_user_admin_for_documents(auth.uid())
)
WITH CHECK (
  public.is_user_admin_for_documents(auth.uid())
);
