-- CreateTable
CREATE TABLE "public"."subadmin_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "can_upload_documents" BOOLEAN NOT NULL DEFAULT false,
    "can_view_stats" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subadmin_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subadmin_permissions_user_id_key" ON "public"."subadmin_permissions"("user_id");

-- CreateIndex
CREATE INDEX "subadmin_permissions_user_id_idx" ON "public"."subadmin_permissions"("user_id");

-- CreateIndex
CREATE INDEX "subadmin_permissions_is_active_idx" ON "public"."subadmin_permissions"("is_active");

-- AddForeignKey
ALTER TABLE "public"."subadmin_permissions" ADD CONSTRAINT "subadmin_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
