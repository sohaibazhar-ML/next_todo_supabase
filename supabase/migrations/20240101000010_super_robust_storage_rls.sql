-- ============================================================================
-- Migration: Super Robust Storage RLS Fix
-- Description: Final, definitive fix for storage RLS issues. 
--              Uses SECURITY DEFINER functions to reliably check ownership.
-- ============================================================================

-- 1. Ensure RLS is enabled on user_document_versions
ALTER TABLE public.user_document_versions ENABLE ROW LEVEL SECURITY;

-- 2. Add SELECT policy for user_document_versions (fundamental for app and RLS)
DROP POLICY IF EXISTS "Users can view own versions" ON public.user_document_versions;
CREATE POLICY "Users can view own versions"
ON public.user_document_versions FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.is_user_admin_for_documents(auth.uid())
);

-- 3. Create a SECURITY DEFINER function to check ownership without RLS interference
-- This function can be called by storage policies to verify if a user "owns" a path
DROP FUNCTION IF EXISTS public.check_storage_ownership(TEXT, UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.check_storage_ownership(object_name TEXT, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    path_part_1 TEXT;
    path_part_2 TEXT;
BEGIN
    -- Extract parts from path: doc_id/version_id/file.docx
    path_part_1 := split_part(object_name, '/', 1);
    path_part_2 := split_part(object_name, '/', 2);

    -- Check if it's the standard folder structure
    IF EXISTS (
        SELECT 1 FROM public.user_document_versions
        WHERE id::text = path_part_2
        AND user_id = p_user_id
    ) THEN
        RETURN true;
    END IF;

    -- Check legacy user-edits folder
    IF path_part_1 = 'user-edits' AND path_part_2 = p_user_id::text THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Clean up ALL existing storage policies for documents bucket
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- 5. Install the new, cleaned policies

-- SELECT: Permissive for authenticated users
CREATE POLICY "storage_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- ADMIN: Full control
CREATE POLICY "storage_admin_all"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents'
  AND public.is_user_admin_for_documents(auth.uid())
)
WITH CHECK (
  bucket_id = 'documents'
  AND public.is_user_admin_for_documents(auth.uid())
);

-- USER: Save edits (using the helper function)
CREATE POLICY "storage_user_manage_own"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents'
  AND public.check_storage_ownership(name, auth.uid())
)
WITH CHECK (
  bucket_id = 'documents'
  AND public.check_storage_ownership(name, auth.uid())
);
