-- ============================================================================
-- Migration: Remove is_active Filter from RLS Policies
-- Description: Removes is_active filtering since activate/deactivate is not in requirements
-- ============================================================================

-- Drop and recreate the SELECT policy without is_active filter
DROP POLICY IF EXISTS "Users can view active documents" ON documents;

-- Policy: All authenticated users can view all documents
CREATE POLICY "Users can view documents"
ON documents FOR SELECT
TO authenticated
USING (
  auth.role() = 'authenticated'
);

-- Update the search_documents function to remove is_active filter
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
    -- Removed is_active = true filter
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

