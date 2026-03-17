export type Revision = {
  id: string;
  revisionNumber: number;
  title: string;
  content: string;
  createdAt: string;
};

export type RevisionsResponse = {
  revisions: Revision[];
};

export type Document = {
  id: string;
  createdAt: string;
  updatedAt: string;
  latestRevision: Revision | null;
};

export type DocumentsResponse = {
  documents: Document[];
};

export type UpdateDocumentPayload = {
  title: string;
  content: string;
};

export type CreateDocumentPayload = {
  title: string;
  content: string;
};
