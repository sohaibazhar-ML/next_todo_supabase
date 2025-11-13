-- ============================================================================
-- Migration: Fix Storage Policy RLS Issue
-- Description: Updates storage policies to use is_user_admin_for_documents 
--              function instead of directly querying profiles table
--              This avoids RLS conflicts when checking admin status
-- ============================================================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admins can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;

-- Recreate policies using the SECURITY DEFINER function
-- This function bypasses RLS, so it can check admin status without conflicts

-- Policy: Only admins can upload documents
CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND public.is_user_admin_for_documents(auth.uid()) = true
);

-- Policy: Only admins can update documents
CREATE POLICY "Admins can update documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND public.is_user_admin_for_documents(auth.uid()) = true
);

-- Policy: Only admins can delete documents
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND public.is_user_admin_for_documents(auth.uid()) = true
);

