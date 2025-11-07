# Storage Bucket Setup Instructions

## Problem
If you're getting the error "Bucket not found" when trying to upload documents, you need to create the storage bucket in Supabase.

## Solution

### Option 1: Run SQL Migration (Recommended)

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20240101000001_storage_bucket_setup.sql`
5. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

This will:
- Create the `documents` storage bucket
- Set up proper security policies
- Configure file size limits (50MB)
- Allow only PDF, DOCX, XLSX, and ZIP files

### Option 2: Create via Supabase Dashboard

1. Go to **Supabase Dashboard** → **Storage**
2. Click **New bucket**
3. Configure as follows:
   - **Name**: `documents`
   - **Public bucket**: `No` (unchecked - private bucket)
   - **File size limit**: `52428800` (50MB)
   - **Allowed MIME types**: 
     - `application/pdf`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
     - `application/zip`
4. Click **Create bucket**

5. Then go to **SQL Editor** and run the storage policies from the migration file (lines 22-68)

### Verify Setup

After running the migration, verify the bucket exists:
1. Go to **Storage** in Supabase Dashboard
2. You should see a bucket named `documents`
3. Try uploading a document again

## Quick SQL Script

If you prefer, you can run this simplified version:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
```

## Troubleshooting

- **Error: "permission denied"**: Make sure you're using the service role key or have proper permissions
- **Bucket still not found**: Refresh the Storage page in Supabase Dashboard
- **Upload still fails**: Check that the policies were created successfully in the SQL Editor

