export type Revision = {
  id: string;
  revisionNumber: number;
  title: string;
  content: string;
  createdAt: string;
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

export type CreateDocumentPayload = {
  title: string;
  content: string;
};
