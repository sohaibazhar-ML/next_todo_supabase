-- ============================================================================
-- Migration: Full Unified RLS, Functions, Triggers, and Storage Setup
-- Description: Comprehensive clean setup for Row Level Security, database functions,
--              triggers, and Supabase Storage. Avoids legacy subadmin constraints.
-- ============================================================================

-- ============================================================================
-- Enable Row Level Security
-- ============================================================================
ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."download_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_document_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE documents
  SET download_count = download_count + 1
  WHERE id = NEW.document_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to check if user is admin (for RLS policies)
-- Only returns true for Super Admins
CREATE OR REPLACE FUNCTION public.is_user_admin_for_documents(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to search documents (full-text search)
CREATE OR REPLACE FUNCTION search_documents(
  search_query TEXT,
  p_category TEXT DEFAULT NULL,
  p_file_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  tags TEXT[],
  file_name TEXT,
  file_type TEXT,
  download_count INTEGER,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title::TEXT,
    d.description::TEXT,
    d.category::TEXT,
    d.tags,
    d.file_name::TEXT,
    d.file_type::TEXT,
    d.download_count,
    d.created_at,
    ts_rank(
      to_tsvector('english', 
        COALESCE(d.title, '') || ' ' || 
        COALESCE(d.description, '')
      ),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM documents d
  WHERE 
    (
      to_tsvector('english', 
        COALESCE(d.title, '') || ' ' || 
        COALESCE(d.description, '')
      ) @@ plainto_tsquery('english', search_query)
    )
    AND (p_category IS NULL OR d.category = p_category)
    AND (p_file_type IS NULL OR d.file_type = p_file_type)
  ORDER BY rank DESC, d.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_user_admin_for_documents(UUID) TO authenticated;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Trigger to auto-increment download count
DROP TRIGGER IF EXISTS trigger_increment_download_count ON download_logs;

CREATE TRIGGER trigger_increment_download_count
  AFTER INSERT ON download_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_document_download_count();

-- ============================================================================
-- RLS Policies for documents table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view documents" ON documents;
CREATE POLICY "Users can view documents"
ON documents FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert documents" ON documents;
CREATE POLICY "Admins can insert documents"
ON documents FOR INSERT
WITH CHECK (public.is_user_admin_for_documents(auth.uid()));

DROP POLICY IF EXISTS "Admins can update documents" ON documents;
CREATE POLICY "Admins can update documents"
ON documents FOR UPDATE
TO authenticated
USING (public.is_user_admin_for_documents(auth.uid()))
WITH CHECK (public.is_user_admin_for_documents(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete documents" ON documents;
CREATE POLICY "Admins can delete documents"
ON documents FOR DELETE
USING (public.is_user_admin_for_documents(auth.uid()));

-- ============================================================================
-- RLS Policies for profiles table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (public.is_user_admin_for_documents(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (public.is_user_admin_for_documents(auth.uid()))
WITH CHECK (public.is_user_admin_for_documents(auth.uid()));

-- ============================================================================
-- RLS Policies for download_logs table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own download logs" ON download_logs;
CREATE POLICY "Users can view own download logs"
ON download_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all download logs" ON download_logs;
CREATE POLICY "Admins can view all download logs"
ON download_logs FOR SELECT
TO authenticated
USING (public.is_user_admin_for_documents(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own download logs" ON download_logs;
CREATE POLICY "Users can insert own download logs"
ON download_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);



-- ============================================================================
-- Storage Bucket Setup for Documents
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/msword',
    'application/vnd.ms-excel'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage Policies for Documents Bucket
-- ============================================================================

DROP POLICY IF EXISTS "Users can view documents" ON storage.objects;
CREATE POLICY "Users can view documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can export documents to their user folder" ON storage.objects;
CREATE POLICY "Users can export documents to their user folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Admins can upload documents" ON storage.objects;
CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND public.is_user_admin_for_documents(auth.uid()) = true
);

DROP POLICY IF EXISTS "Admins can update documents" ON storage.objects;
CREATE POLICY "Admins can update documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND public.is_user_admin_for_documents(auth.uid()) = true
);

DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND public.is_user_admin_for_documents(auth.uid()) = true
);

-- ============================================================================
-- Performance Optimizations (Trigram Search)
-- ============================================================================

-- 1. Enable the trigram extension for fast mid-string text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add GIN Trigram indexes for User/Profile search
CREATE INDEX IF NOT EXISTS idx_profiles_search_names ON profiles USING gin (first_name gin_trgm_ops, last_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_search_email ON profiles USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_search_full ON profiles USING gin ((first_name || ' ' || last_name) gin_trgm_ops);

-- 3. Add GIN Trigram indexes for Document search
CREATE INDEX IF NOT EXISTS idx_documents_search_title ON documents USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_documents_search_description ON documents USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_documents_search_filename ON documents USING gin (file_name gin_trgm_ops);

-- 4. Add GIN Trigram indexes for Checklist search
CREATE INDEX IF NOT EXISTS idx_checklist_search_title ON "ChecklistItem" USING gin (title gin_trgm_ops);

