-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_documents_parent_document_id" ON "public"."documents"("parent_document_id");
