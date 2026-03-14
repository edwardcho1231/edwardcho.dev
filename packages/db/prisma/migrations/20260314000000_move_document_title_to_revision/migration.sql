-- Add title to revisions and backfill from each document's current title
ALTER TABLE "Revision"
ADD COLUMN "title" TEXT;

UPDATE "Revision" r
SET "title" = d.title
FROM "Document" d
WHERE r."documentId" = d.id;

-- Remove title from documents and ensure revision title is required
ALTER TABLE "Document"
DROP COLUMN "title";

ALTER TABLE "Revision"
ALTER COLUMN "title" SET NOT NULL;
