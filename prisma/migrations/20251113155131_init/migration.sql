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