-- ============================================================================
-- Migration: Consolidated Storage RLS
-- Description: Wipes all existing storage policies on the documents bucket
--              and replaces them with clean, robust rules for Admins and Users.
-- ============================================================================

-- 1. Drop ALL existing policies to prevent conflicts
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- This handles existing policies regardless of their specific names
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- 2. Basic SELECT: All authenticated users can read files in 'documents' bucket
-- (This ensures images and documents can be viewed by anyone logged in)
CREATE POLICY "permissive_select_for_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- 3. ADMIN: Full access (ALL) using the SECURITY DEFINER helper function
-- This allows admins and subadmins with upload permissions to do anything
CREATE POLICY "admin_full_access"
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

-- 4. USER: Save own edited versions (FOR ALL: Insert, Update, Delete)
-- Policies match the path pattern: {document_id}/{version_id}/filename.docx
-- or the legacy pattern: user-edits/{user_id}/...
CREATE POLICY "user_manage_own_versions"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    -- Matches: DOC_ID/VERSION_ID/final.docx
    -- split_part(name, '/', 2) is the VERSION_ID
    EXISTS (
      SELECT 1 FROM public.user_document_versions
      WHERE user_document_versions.id::text = split_part(storage.objects.name, '/', 2)
      AND user_document_versions.user_id = auth.uid()
    )
    OR
    -- Matches: user-edits/USER_ID/final.docx
    -- split_part(name, '/', 2) is the USER_ID
    (
      split_part(storage.objects.name, '/', 1) = 'user-edits' 
      AND split_part(storage.objects.name, '/', 2) = auth.uid()::text
    )
  )
)
WITH CHECK (
  bucket_id = 'documents'
  AND (
    -- Same logic for checking NEW rows (INSERT/UPDATE)
    EXISTS (
      SELECT 1 FROM public.user_document_versions
      WHERE user_document_versions.id::text = split_part(storage.objects.name, '/', 2)
      AND user_document_versions.user_id = auth.uid()
    )
    OR
    (
      split_part(storage.objects.name, '/', 1) = 'user-edits' 
      AND split_part(storage.objects.name, '/', 2) = auth.uid()::text
    )
  )
);
