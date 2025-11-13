-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "file_type" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "version" TEXT DEFAULT '1.0',
    "parent_document_id" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "is_featured" BOOLEAN DEFAULT false,
    "download_count" INTEGER DEFAULT 0,
    "searchable_content" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."download_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "downloaded_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "ip_address" INET,
    "user_agent" TEXT,
    "context" TEXT,
    "metadata" JSONB,

    CONSTRAINT "download_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "current_address" TEXT NOT NULL,
    "country_of_origin" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "number_of_adults" INTEGER NOT NULL DEFAULT 1,
    "number_of_children" INTEGER NOT NULL DEFAULT 0,
    "pets_type" TEXT,
    "new_address_switzerland" TEXT NOT NULL,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "terms_accepted" BOOLEAN NOT NULL DEFAULT false,
    "data_privacy_accepted" BOOLEAN NOT NULL DEFAULT false,
    "email_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "email_confirmed_at" TIMESTAMPTZ(6),
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_documents_category" ON "public"."documents"("category");

-- CreateIndex
CREATE INDEX "idx_documents_category_created" ON "public"."documents"("category", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_documents_created_by" ON "public"."documents"("created_by");

-- CreateIndex
CREATE INDEX "idx_documents_file_type" ON "public"."documents"("file_type");

-- CreateIndex
CREATE INDEX "idx_documents_is_active" ON "public"."documents"("is_active");

-- CreateIndex
CREATE INDEX "idx_documents_is_featured" ON "public"."documents"("is_featured");

-- CreateIndex
CREATE INDEX "idx_documents_parent_document_id" ON "public"."documents"("parent_document_id");

-- CreateIndex
CREATE INDEX "idx_documents_tags_gin" ON "public"."documents" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "idx_download_logs_document_id" ON "public"."download_logs"("document_id", "downloaded_at" DESC);

-- CreateIndex
CREATE INDEX "idx_download_logs_document_user" ON "public"."download_logs"("document_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_download_logs_downloaded_at" ON "public"."download_logs"("downloaded_at" DESC);

-- CreateIndex
CREATE INDEX "idx_download_logs_user_id" ON "public"."download_logs"("user_id", "downloaded_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "public"."profiles"("username");

-- CreateIndex
CREATE INDEX "idx_profiles_email" ON "public"."profiles"("email");

-- CreateIndex
CREATE INDEX "idx_profiles_role" ON "public"."profiles"("role");

-- CreateIndex
CREATE INDEX "idx_profiles_role_created" ON "public"."profiles"("role", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_profiles_username" ON "public"."profiles"("username");

-- AddForeignKey
ALTER TABLE "public"."documents" ADD CONSTRAINT "documents_parent_document_id_fkey" FOREIGN KEY ("parent_document_id") REFERENCES "public"."documents"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."download_logs" ADD CONSTRAINT "download_logs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

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

-- Function to search documents
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
    d.title,
    d.description,
    d.category,
    d.tags,
    d.file_name,
    d.file_type,
    d.download_count,
    d.created_at,
    ts_rank(
      to_tsvector('english', 
        COALESCE(d.title, '') || ' ' || 
        COALESCE(d.description, '') || ' ' || 
        COALESCE(d.searchable_content, '')
      ),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM documents d
  WHERE 
    (
      to_tsvector('english', 
        COALESCE(d.title, '') || ' ' || 
        COALESCE(d.description, '') || ' ' || 
        COALESCE(d.searchable_content, '')
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
CREATE TRIGGER trigger_increment_download_count
  AFTER INSERT ON download_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_document_download_count();

-- ============================================================================
-- RLS Policies for documents table
-- ============================================================================

-- Policy: All authenticated users can view all documents
CREATE POLICY "Users can view documents"
ON documents FOR SELECT
TO authenticated
USING (
  auth.role() = 'authenticated'
);

-- Policy: Only admins can insert documents
CREATE POLICY "Admins can insert documents"
ON documents FOR INSERT
WITH CHECK (
  public.is_user_admin_for_documents(auth.uid())
);

-- Policy: Only admins can update documents
CREATE POLICY "Admins can update documents"
ON documents FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND public.is_user_admin_for_documents(auth.uid()) = true
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND public.is_user_admin_for_documents(auth.uid()) = true
);

-- Policy: Only admins can delete documents
CREATE POLICY "Admins can delete documents"
ON documents FOR DELETE
USING (
  public.is_user_admin_for_documents(auth.uid())
);

-- ============================================================================
-- RLS Policies for profiles table
-- ============================================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  public.is_user_admin_for_documents(auth.uid())
);

-- Policy: Users can insert their own profile (for profile creation)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() = id
);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  public.is_user_admin_for_documents(auth.uid())
)
WITH CHECK (
  public.is_user_admin_for_documents(auth.uid())
);

-- ============================================================================
-- RLS Policies for download_logs table
-- ============================================================================

-- Policy: Users can view their own download logs
CREATE POLICY "Users can view own download logs"
ON download_logs FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Policy: Admins can view all download logs
CREATE POLICY "Admins can view all download logs"
ON download_logs FOR SELECT
TO authenticated
USING (
  public.is_user_admin_for_documents(auth.uid())
);

-- Policy: Users can insert their own download logs
CREATE POLICY "Users can insert own download logs"
ON download_logs FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- ============================================================================
-- Storage Bucket Setup for Documents
-- Note: These are Supabase Storage configurations, not database tables
-- ============================================================================

-- Create the storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Private bucket (requires authentication)
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage Policies for Documents Bucket
-- Note: These policies use is_user_admin_for_documents function which
--       bypasses RLS, avoiding conflicts when checking admin status
-- ============================================================================

-- Policy: Authenticated users can view/download documents
CREATE POLICY "Users can view documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Drop existing admin policies if they exist (in case of re-running migration)
DROP POLICY IF EXISTS "Admins can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;

-- Policy: Only admins can upload documents
-- Uses is_user_admin_for_documents function (SECURITY DEFINER) to bypass RLS
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