-- CreateTable
CREATE TABLE "public"."user_document_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "original_document_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "version_name" TEXT,
    "html_content" TEXT,
    "pdf_text_content" TEXT,
    "pdf_annotations" JSONB,
    "exported_file_path" TEXT,
    "exported_file_size" BIGINT,
    "exported_mime_type" TEXT,
    "original_file_type" TEXT NOT NULL,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_document_versions_user_id_idx" ON "public"."user_document_versions"("user_id");

-- CreateIndex
CREATE INDEX "user_document_versions_original_document_id_user_id_idx" ON "public"."user_document_versions"("original_document_id", "user_id");

-- CreateIndex
CREATE INDEX "user_document_versions_user_id_created_at_idx" ON "public"."user_document_versions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "user_document_versions_original_document_id_user_id_version_key" ON "public"."user_document_versions"("original_document_id", "user_id", "version_number");

-- AddForeignKey
ALTER TABLE "public"."user_document_versions" ADD CONSTRAINT "user_document_versions_original_document_id_fkey" FOREIGN KEY ("original_document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
