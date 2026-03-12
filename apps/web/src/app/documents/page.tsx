"use client";

import { useCallback, useEffect, useState } from "react";
import { type Document } from "./types";
import { createDocument, deleteDocument, fetchDocuments } from "./services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DocumentsPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    loadDocuments();
  }, [loadDocuments]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const created = await createDocument({
        title: title.trim(),
        content: content.trim(),
      });

      setDocuments((previous) => [created, ...previous]);
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create document");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    setDeletingId(documentId);
    setError(null);

    try {
      await deleteDocument(documentId);
      setDocuments((previous) => previous.filter((document) => document.id !== documentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold">Documents</h1>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Create Document</CardTitle>
          <CardDescription>Write a title and initial content to start a new document.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                placeholder="Write a title for your document"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
                placeholder="Write the content of your document here"
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
          My Documents
        </h2>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-[var(--app-muted)]">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">
            No documents yet. Create one above.
          </p>
        ) : (
          <ul className="space-y-3">
            {documents.map((document) => {
              const updated = new Date(document.updatedAt);
              const preview = document.latestRevision?.content ?? "";

              return (
                <li key={document.id}>
                    <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium">{document.title}</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={deletingId === document.id}
                          className="border-red-600/70 text-red-300 hover:border-red-500 hover:bg-red-600/15"
                          onClick={() => handleDelete(document.id)}
                        >
                          {deletingId === document.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                      <p className="mt-1 text-sm text-[var(--app-muted)]">
                        Updated {updated.toLocaleString()} • Revision {document.latestRevision?.revisionNumber ?? 0}
                      </p>
                      <p className="mt-3 text-sm text-[var(--app-foreground)]">
                        {preview}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
