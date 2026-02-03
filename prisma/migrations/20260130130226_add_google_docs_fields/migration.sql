-- AlterTable
ALTER TABLE "public"."documents" ADD COLUMN     "google_drive_template_id" TEXT;

-- AlterTable
ALTER TABLE "public"."user_document_versions" ADD COLUMN     "google_drive_file_id" TEXT,
ADD COLUMN     "google_edit_link" TEXT;
