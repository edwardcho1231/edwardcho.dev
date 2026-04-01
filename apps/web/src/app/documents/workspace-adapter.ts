import {
  createDocument,
  deleteDocument,
  fetchDocumentRevisions,
  fetchDocuments,
  publishDocument,
  unpublishDocument,
  updateDocument,
  uploadDocumentImage,
} from "./services";
import {
  type CreateDocumentPayload,
  type PublishDocumentPayload,
  type UpdateDocumentPayload,
} from "./payload-types";
import {
  type DocumentDto,
  type DocumentRevisionsResponseDto,
  type DocumentsResponseDto,
} from "@/types/documents";

export type DocumentWorkspaceAdapter = {
  loadDocuments: () => Promise<DocumentsResponseDto>;
  createDocument: (payload: CreateDocumentPayload) => Promise<DocumentDto>;
  updateDocument: (
    documentId: string,
    payload: UpdateDocumentPayload,
  ) => Promise<DocumentDto>;
  deleteDocument: (documentId: string) => Promise<void>;
  publishDocument: (
    documentId: string,
    payload: PublishDocumentPayload,
  ) => Promise<DocumentDto>;
  unpublishDocument: (documentId: string) => Promise<DocumentDto>;
  loadRevisions: (
    documentId: string,
  ) => Promise<DocumentRevisionsResponseDto["revisions"]>;
  uploadImage: (
    documentId: string,
    file: File,
  ) => Promise<{ url: string; pathname: string }>;
};

export const productionDocumentWorkspaceAdapter: DocumentWorkspaceAdapter = {
  loadDocuments: fetchDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  publishDocument,
  unpublishDocument,
  loadRevisions: fetchDocumentRevisions,
  uploadImage: uploadDocumentImage,
};
