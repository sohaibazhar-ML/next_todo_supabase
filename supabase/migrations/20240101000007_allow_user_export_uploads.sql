-- ============================================================================
-- Migration: Allow Users to Upload Their Own Exported Files
-- Description: Adds storage policy to allow authenticated users to upload
--              their own exported document versions to user-edits/ directory
-- ============================================================================

-- Policy: Users can upload their own exported files (in user-edits directory)
DROP POLICY IF EXISTS "Users can upload own exports" ON storage.objects;

CREATE POLICY "Users can upload own exports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND name LIKE 'user-edits/' || auth.uid()::text || '/%'
);

-- Policy: Users can view/download their own exported files
DROP POLICY IF EXISTS "Users can view own exports" ON storage.objects;

CREATE POLICY "Users can view own exports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND (
    name LIKE 'user-edits/' || auth.uid()::text || '/%'
    OR auth.role() = 'authenticated' -- Also allow viewing all documents (existing policy)
  )
);

-- Policy: Users can delete their own exported files
DROP POLICY IF EXISTS "Users can delete own exports" ON storage.objects;

CREATE POLICY "Users can delete own exports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND name LIKE 'user-edits/' || auth.uid()::text || '/%'
);

