-- ============================================================================
-- Migration: Fix Storage RLS for Document Edits
-- Description: Allows authenticated users to upload/update their own document versions
-- ============================================================================

-- Drop existing restricted policies if they interfere
-- Note: We keep "Users can view documents" as it's already correct

-- INSERT POLICY
DROP POLICY IF EXISTS "Users can upload edited document versions" ON storage.objects;
CREATE POLICY "Users can upload edited document versions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (
    -- Admin check
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    OR
    -- Individual user check: folder path must contain a version ID owned by the user
    -- Path format: document_id/version_id/final.docx
    EXISTS (
      SELECT 1 FROM public.user_document_versions
      WHERE id::text = (storage.foldername(name))[2]
      AND user_id = auth.uid()
    )
  )
);

-- UPDATE POLICY (Required for upsert)
DROP POLICY IF EXISTS "Users can update their own document versions" ON storage.objects;
CREATE POLICY "Users can update their own document versions"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (
    -- Admin check
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    OR
    -- Individual user check
    EXISTS (
      SELECT 1 FROM public.user_document_versions
      WHERE id::text = (storage.foldername(name))[2]
      AND user_id = auth.uid()
    )
  )
);
