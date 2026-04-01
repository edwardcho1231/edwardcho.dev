"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type DocumentDto } from "@/types/documents";
import { type CreateDocumentPayload, type PublishDocumentPayload } from "../payload-types";
import { type DocumentWorkspaceAdapter } from "../workspace-adapter";
import { DocumentCard } from "./document-card";
import { DocumentEditor } from "./document-editor";

const ACTIVE_ACTION_KIND = {
  NONE: "none",
  DELETING: "deleting",
  PUBLISHING: "publishing",
  UNPUBLISHING: "unpublishing",
} as const;

type DocumentWorkspaceShellProps = {
  adapter: DocumentWorkspaceAdapter;
  title?: string;
  documentsHeading?: string;
  buildRevisionsHref: (documentId: string) => string;
};

export function DocumentWorkspaceShell({
  adapter,
  title = "Documents",
  documentsHeading = "My Documents",
  buildRevisionsHref,
}: DocumentWorkspaceShellProps) {
  type ActiveAction =
    | { kind: typeof ACTIVE_ACTION_KIND.NONE }
    | { kind: typeof ACTIVE_ACTION_KIND.DELETING; documentId: string }
    | { kind: typeof ACTIVE_ACTION_KIND.PUBLISHING; documentId: string }
    | { kind: typeof ACTIVE_ACTION_KIND.UNPUBLISHING; documentId: string };

  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [isPublisher, setIsPublisher] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorDocument, setEditorDocument] = useState<DocumentDto | null>(null);
  const [activeAction, setActiveAction] = useState<ActiveAction>({
    kind: ACTIVE_ACTION_KIND.NONE,
  });
  const router = useRouter();

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await adapter.loadDocuments();
      setDocuments(payload.documents);
      setIsPublisher(payload.isPublisher);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const isEditing = editorDocument !== null;
  const isMutating = submitting || activeAction.kind !== ACTIVE_ACTION_KIND.NONE;

  const clearEditor = () => {
    setEditorDocument(null);
    setError(null);
  };

  const syncDocument = (next: DocumentDto) => {
    setDocuments((previous) =>
      previous.map((document) => (document.id === next.id ? next : document)),
    );
    setEditorDocument((previous) => (previous?.id === next.id ? next : previous));
  };

  const handleSubmitDocument = async (
    payload: CreateDocumentPayload,
    documentId?: string,
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      if (documentId) {
        const updated = await adapter.updateDocument(documentId, payload);
        syncDocument(updated);
        clearEditor();
        return true;
      }

      const created = await adapter.createDocument(payload);
      setDocuments((previous) => [created, ...previous]);
      clearEditor();
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${documentId ? "update" : "create"} document`,
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (document: DocumentDto) => {
    if (isMutating) {
      return;
    }

    setEditorDocument(document);
    setError(null);
  };

  const handleDelete = async (documentId: string) => {
    if (isMutating) {
      return;
    }

    setActiveAction({ kind: ACTIVE_ACTION_KIND.DELETING, documentId });
    setError(null);

    try {
      await adapter.deleteDocument(documentId);
      if (editorDocument?.id === documentId) {
        clearEditor();
      }
      setDocuments((previous) =>
        previous.filter((document) => document.id !== documentId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setActiveAction({ kind: ACTIVE_ACTION_KIND.NONE });
    }
  };

  const handlePublish = async (
    documentId: string,
    payload: PublishDocumentPayload,
  ) => {
    if (isMutating) {
      return false;
    }

    setActiveAction({ kind: ACTIVE_ACTION_KIND.PUBLISHING, documentId });
    setError(null);

    try {
      const updated = await adapter.publishDocument(documentId, payload);
      syncDocument(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish document");
      return false;
    } finally {
      setActiveAction({ kind: ACTIVE_ACTION_KIND.NONE });
    }
  };

  const handleUnpublish = async (documentId: string) => {
    if (isMutating) {
      return false;
    }

    setActiveAction({ kind: ACTIVE_ACTION_KIND.UNPUBLISHING, documentId });
    setError(null);

    try {
      const updated = await adapter.unpublishDocument(documentId);
      syncDocument(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unpublish document");
      return false;
    } finally {
      setActiveAction({ kind: ACTIVE_ACTION_KIND.NONE });
    }
  };

  const handleViewRevisions = (documentId: string) => {
    router.push(buildRevisionsHref(documentId));
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-4xl font-semibold">{title}</h1>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{isEditing ? "Update Document" : "Create Document"}</CardTitle>
          <p className="text-sm text-[var(--app-muted)]">
            {isEditing
              ? "You are updating the selected document. Save creates a new revision."
              : "Write a title and markdown content, then save when ready."}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <DocumentEditor
            key={editorDocument?.id ?? "new"}
            canSubmit
            isBusy={isMutating}
            isSubmitting={submitting}
            isPublishing={activeAction.kind === ACTIVE_ACTION_KIND.PUBLISHING}
            isUnpublishing={activeAction.kind === ACTIVE_ACTION_KIND.UNPUBLISHING}
            isPublisher={isPublisher}
            editorDocument={editorDocument}
            error={error}
            onSubmitDocument={handleSubmitDocument}
            onPublishDocument={handlePublish}
            onUnpublishDocument={handleUnpublish}
            onUploadImage={adapter.uploadImage}
            onCancelEdit={clearEditor}
          />
        </CardContent>
      </Card>

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
          {documentsHeading}
        </h2>

        {error && !isEditing ? <p className="text-sm text-red-600">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-[var(--app-muted)]">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">No documents yet. Create one above.</p>
        ) : (
          <ul className="space-y-3">
            {documents.map((document) => {
              const isDeleting =
                activeAction.kind === ACTIVE_ACTION_KIND.DELETING &&
                activeAction.documentId === document.id;

              return (
                <DocumentCard
                  key={document.id}
                  document={document}
                  isMutating={isMutating}
                  isDeleting={isDeleting}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onOpenRevisions={handleViewRevisions}
                />
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
