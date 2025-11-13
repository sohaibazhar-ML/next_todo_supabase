-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_documents_parent_category" ON "public"."documents"("parent_document_id", "category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_documents_parent_file_type" ON "public"."documents"("parent_document_id", "file_type");
