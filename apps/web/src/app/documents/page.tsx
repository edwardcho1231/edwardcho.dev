"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { type CreateDocumentPayload, type Document } from "./types";
import { createDocument, deleteDocument, fetchDocuments, updateDocument } from "./services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentCard } from "./components/document-card";
import { DocumentEditor } from "./components/document-editor";
export default function DocumentsPage() {
  type ActiveAction =
    | { kind: "none" }
    | { kind: "deleting"; documentId: string };

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorDocument, setEditorDocument] = useState<Document | null>(null);
  const [activeAction, setActiveAction] = useState<ActiveAction>({ kind: "none" });
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const hasActiveUserSession = isSignedIn === true;

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const documents = await fetchDocuments();
      setDocuments(documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!hasActiveUserSession) {
      setLoading(false);
      setDocuments([]);
      setError(null);
      clearEditor();
      return;
    }

    loadDocuments();
  }, [isLoaded, hasActiveUserSession, loadDocuments]);

  const isEditing = editorDocument !== null;
  const isMutating = submitting || activeAction.kind === "deleting";
  const clearEditor = () => {
    setEditorDocument(null);
    setError(null);
  };

  const handleSubmitDocument = async (
    payload: CreateDocumentPayload,
    documentId?: string,
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      if (documentId) {
        const updated = await updateDocument(documentId, payload);
        setDocuments((previous) =>
          previous.map((document) => (document.id === updated.id ? updated : document)),
        );
        clearEditor();
        return true;
      }

      const created = await createDocument(payload);
      setDocuments((previous) => [created, ...previous]);
      clearEditor();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${documentId ? "update" : "create"} document`);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (document: Document) => {
    if (isMutating) {
      return;
    }

    setEditorDocument(document);
    setError(null);
  };

  const handleCancelEdit = () => {
    clearEditor();
  };

  const handleDelete = async (documentId: string) => {
    if (isMutating) {
      return;
    }

    if (!hasActiveUserSession) {
      setError("Please sign in to delete documents.");
      return;
    }

    setActiveAction({ kind: "deleting", documentId });
    setError(null);

    try {
      await deleteDocument(documentId);
      if (editorDocument?.id === documentId) {
        clearEditor();
      }
      setDocuments((previous) => previous.filter((document) => document.id !== documentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setActiveAction({ kind: "none" });
    }
  };

  const handleViewRevisions = (documentId: string) => {
    router.push(`/documents/${encodeURIComponent(documentId)}/revisions`);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-4xl font-semibold">Documents</h1>

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
            canSubmit={isLoaded && hasActiveUserSession}
            isBusy={isMutating}
            isSubmitting={submitting}
            editorDocument={editorDocument}
            error={error}
            onSubmitDocument={handleSubmitDocument}
            onCancelEdit={handleCancelEdit}
          />
        </CardContent>
      </Card>

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
          My Documents
        </h2>

        {error && !isEditing ? <p className="text-sm text-red-600">{error}</p> : null}
        {!isLoaded ? <p className="text-sm text-[var(--app-muted)]">Checking authentication…</p> : null}
        {isLoaded && !hasActiveUserSession ? (
          <p className="text-sm text-[var(--app-muted)]">Sign in to view and manage your documents.</p>
        ) : loading ? (
          <p className="text-sm text-[var(--app-muted)]">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">No documents yet. Create one above.</p>
        ) : (
          <ul className="space-y-3">
            {documents.map((document) => {
              const isDeleting = activeAction.kind === "deleting" && activeAction.documentId === document.id;
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
