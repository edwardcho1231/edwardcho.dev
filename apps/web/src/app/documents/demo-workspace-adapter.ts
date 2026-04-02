import demoEditorSeedJson from "@/content/demo-editor-seed.json";
import {
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_CONTENT_TYPES,
  sanitizeImageFilename,
} from "@/lib/image-upload";
import {
  type CreateDocumentPayload,
  type PublishDocumentPayload,
  type UpdateDocumentPayload,
} from "./payload-types";
import { type DocumentWorkspaceAdapter } from "./workspace-adapter";
import {
  type DocumentDto,
  type DocumentKind,
  type DocumentRevisionsResponseDto,
  type DocumentRevisionDto,
} from "@/types/documents";

type DemoSeedDocument = Omit<DocumentDto, "latestRevision"> & {
  revisions: DocumentRevisionDto[];
};

type DemoWorkspaceSeed = {
  userId: string;
  isPublisher: boolean;
  documents: DemoSeedDocument[];
};

type DemoDocumentRecord = DemoSeedDocument;

type CreateObjectUrl = (file: File) => string;

const demoEditorSeed = demoEditorSeedJson as DemoWorkspaceSeed;
const PUBLISH_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 120;
const MAX_EXCERPT_LENGTH = 300;

function cloneRevision(revision: DocumentRevisionDto): DocumentRevisionDto {
  return { ...revision };
}

function cloneRecord(record: DemoDocumentRecord): DemoDocumentRecord {
  return {
    ...record,
    revisions: record.revisions.map(cloneRevision),
  };
}

function getLatestRevision(record: DemoDocumentRecord): DocumentRevisionDto | null {
  if (record.revisions.length === 0) {
    return null;
  }

  return record.revisions.reduce((latest, candidate) =>
    candidate.revisionNumber > latest.revisionNumber ? candidate : latest,
  );
}

function toDocumentDto(record: DemoDocumentRecord): DocumentDto {
  return {
    id: record.id,
    ownerId: record.ownerId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    kind: record.kind,
    status: record.status,
    slug: record.slug,
    excerpt: record.excerpt,
    publishedAt: record.publishedAt,
    latestRevision: getLatestRevision(record),
  };
}

function sortByUpdatedAtDesc(records: DemoDocumentRecord[]) {
  return [...records].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function createDocumentId() {
  return crypto.randomUUID();
}

function createRevisionId() {
  return crypto.randomUUID();
}

function createImagePathname(documentId: string, filename: string) {
  return `demo/documents/${documentId}/${sanitizeImageFilename(filename)}`;
}

function ensureAllowedImageFile(file: File) {
  if (!ALLOWED_IMAGE_CONTENT_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number])) {
    throw new Error("Unsupported image type");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image exceeds maximum size");
  }
}

function validateDocumentPayload(payload: CreateDocumentPayload | UpdateDocumentPayload) {
  if (payload.title.trim().length === 0 || payload.content.trim().length === 0) {
    throw new Error("Invalid document data");
  }
}

function validatePublishPayload(payload: PublishDocumentPayload) {
  const slug = payload.slug.trim().toLowerCase();
  const excerpt = payload.excerpt?.trim();

  if (
    slug.length === 0 ||
    slug.length > MAX_SLUG_LENGTH ||
    !PUBLISH_SLUG_REGEX.test(slug)
  ) {
    throw new Error("Invalid publish data");
  }

  if (excerpt && excerpt.length > MAX_EXCERPT_LENGTH) {
    throw new Error("Invalid publish data");
  }

  return {
    slug,
    excerpt: excerpt && excerpt.length > 0 ? excerpt : null,
  };
}

function normalizeSeed(seed: DemoWorkspaceSeed): DemoWorkspaceSeed {
  return {
    userId: seed.userId,
    isPublisher: seed.isPublisher,
    documents: sortByUpdatedAtDesc(seed.documents.map(cloneRecord)),
  };
}

export function createDemoDocumentWorkspaceAdapter(
  seed: DemoWorkspaceSeed = demoEditorSeed,
  createObjectUrl: CreateObjectUrl = (file) => URL.createObjectURL(file),
): DocumentWorkspaceAdapter {
  const normalizedSeed = normalizeSeed(seed);
  let records = normalizedSeed.documents;

  const findRecord = (documentId: string) => {
    const record = records.find((candidate) => candidate.id === documentId);

    if (!record) {
      throw new Error("Document not found");
    }

    return record;
  };

  const saveRecord = (nextRecord: DemoDocumentRecord) => {
    records = sortByUpdatedAtDesc(
      records.map((record) => (record.id === nextRecord.id ? nextRecord : record)),
    );
  };

  const ensureUniquePublishedSlug = (
    documentId: string,
    kind: DocumentKind,
    slug: string,
  ) => {
    const hasConflict = records.some(
      (record) =>
        record.id !== documentId &&
        record.status === "PUBLISHED" &&
        record.kind === kind &&
        record.slug === slug,
    );

    if (hasConflict) {
      throw new Error("Slug is already in use for this kind");
    }
  };

  return {
    async loadDocuments() {
      return {
        userId: normalizedSeed.userId,
        isPublisher: normalizedSeed.isPublisher,
        documents: sortByUpdatedAtDesc(records).map(toDocumentDto),
      };
    },

    async createDocument(payload: CreateDocumentPayload) {
      validateDocumentPayload(payload);

      const timestamp = new Date().toISOString();
      const documentId = createDocumentId();
      const revision: DocumentRevisionDto = {
        id: createRevisionId(),
        revisionNumber: 1,
        title: payload.title.trim(),
        content: payload.content.trim(),
        createdAt: timestamp,
      };

      const nextRecord: DemoDocumentRecord = {
        id: documentId,
        ownerId: normalizedSeed.userId,
        createdAt: timestamp,
        updatedAt: timestamp,
        kind: null,
        status: "DRAFT",
        slug: null,
        excerpt: null,
        publishedAt: null,
        revisions: [revision],
      };

      records = sortByUpdatedAtDesc([nextRecord, ...records]);
      return toDocumentDto(nextRecord);
    },

    async updateDocument(documentId: string, payload: UpdateDocumentPayload) {
      validateDocumentPayload(payload);

      const record = findRecord(documentId);
      const timestamp = new Date().toISOString();
      const highestRevisionNumber = Math.max(
        0,
        ...record.revisions.map((revision) => revision.revisionNumber),
      );
      const nextRecord: DemoDocumentRecord = {
        ...record,
        updatedAt: timestamp,
        revisions: [
          ...record.revisions,
          {
            id: createRevisionId(),
            revisionNumber: highestRevisionNumber + 1,
            title: payload.title.trim(),
            content: payload.content.trim(),
            createdAt: timestamp,
          },
        ],
      };

      saveRecord(nextRecord);
      return toDocumentDto(nextRecord);
    },

    async deleteDocument(documentId: string) {
      findRecord(documentId);
      records = records.filter((record) => record.id !== documentId);
    },

    async publishDocument(documentId: string, payload: PublishDocumentPayload) {
      const record = findRecord(documentId);
      const { slug, excerpt } = validatePublishPayload(payload);
      ensureUniquePublishedSlug(documentId, payload.kind, slug);

      const timestamp = new Date().toISOString();
      const nextRecord: DemoDocumentRecord = {
        ...record,
        kind: payload.kind,
        slug,
        excerpt,
        status: "PUBLISHED",
        publishedAt: record.publishedAt ?? timestamp,
        updatedAt: timestamp,
      };

      saveRecord(nextRecord);
      return toDocumentDto(nextRecord);
    },

    async unpublishDocument(documentId: string) {
      const record = findRecord(documentId);
      const nextRecord: DemoDocumentRecord = {
        ...record,
        status: "DRAFT",
        updatedAt: new Date().toISOString(),
      };

      saveRecord(nextRecord);
      return toDocumentDto(nextRecord);
    },

    async loadRevisions(documentId: string): Promise<DocumentRevisionsResponseDto["revisions"]> {
      const record = findRecord(documentId);
      return [...record.revisions]
        .sort((left, right) => right.revisionNumber - left.revisionNumber)
        .map(cloneRevision);
    },

    async uploadImage(documentId: string, file: File) {
      findRecord(documentId);
      ensureAllowedImageFile(file);

      return {
        url: createObjectUrl(file),
        pathname: createImagePathname(documentId, file.name),
      };
    },
  };
}
