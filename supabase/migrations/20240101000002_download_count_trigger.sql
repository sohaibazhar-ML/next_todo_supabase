-- ============================================================================
-- Migration: Download Count Trigger
-- Description: Creates trigger to auto-increment download_count when download is logged
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_increment_download_count ON download_logs;

-- Create trigger to auto-increment download count
CREATE TRIGGER trigger_increment_download_count
  AFTER INSERT ON download_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_document_download_count();

