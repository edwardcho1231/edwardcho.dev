CREATE TYPE "DocumentKind" AS ENUM ('BLOG', 'PROJECT');

CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TABLE "Document"
ADD COLUMN "kind" "DocumentKind",
ADD COLUMN "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "slug" TEXT,
ADD COLUMN "excerpt" TEXT,
ADD COLUMN "publishedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Document_published_kind_slug_key"
ON "Document"("kind", "slug")
WHERE "status" = 'PUBLISHED' AND "kind" IS NOT NULL AND "slug" IS NOT NULL;

CREATE INDEX "Document_status_kind_publishedAt_idx" ON "Document"("status", "kind", "publishedAt");
