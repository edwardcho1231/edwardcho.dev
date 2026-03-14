"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { type Document } from "./types";
import { createDocument, deleteDocument, fetchDocuments } from "./services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownPreview } from "./components/markdown-preview";

type EditorMode = "compose" | "preview";
const MAX_CONTENT_LENGTH = 5000;

function plainTextSummary(markdown: string, limit = 280) {
  const withMarkdownRemoved = markdown
    .replace(/!\[[^\]]*?\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~>-]/g, "")
    .replace(/\n+/g, " ")
    .trim();

  if (!withMarkdownRemoved) {
    return "No preview content.";
  }

  return `${withMarkdownRemoved.slice(0, limit)}${withMarkdownRemoved.length > limit ? "…" : ""}`;
}

export default function DocumentsPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>("compose");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { isLoaded, isSignedIn } = useAuth();

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

    if (!isSignedIn) {
      setLoading(false);
      setDocuments([]);
      setError(null);
      return;
    }

    loadDocuments();
  }, [isLoaded, isSignedIn, loadDocuments]);

  const isContentTooLong = content.length > MAX_CONTENT_LENGTH;
  const isCreateDisabled =
    !isLoaded ||
    !isSignedIn ||
    submitting ||
    title.trim().length === 0 ||
    content.trim().length === 0 ||
    isContentTooLong;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCreateDisabled) {
      if (!isSignedIn) {
        setError("Please sign in to create documents.");
      }

      return;
    }

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
      setMode("compose");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create document");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!isSignedIn) {
      setError("Please sign in to delete documents.");
      return;
    }

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
          <p className="text-sm text-[var(--app-muted)]">
            Write a title and markdown content, then publish when ready.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="inline-flex rounded border border-[var(--app-border)] p-1">
            <Button
              type="button"
              size="sm"
              variant={mode === "compose" ? "default" : "outline"}
              onClick={() => setMode("compose")}
            >
              Compose
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "preview" ? "default" : "outline"}
              onClick={() => setMode("preview")}
              className="ml-2"
            >
              Preview
            </Button>
          </div>

          {mode === "compose" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  maxLength={140}
                  placeholder="Write a title for your document"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  ref={editorRef}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  required
                  placeholder="Write markdown content."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--app-muted)]">Character count</p>
                <p
                  className={`text-xs ${isContentTooLong ? "text-red-400" : "text-[var(--app-muted)]"}`}
                >
                  {content.length}/{MAX_CONTENT_LENGTH}
                </p>
              </div>

              <Button type="submit" disabled={isCreateDisabled}>
                {submitting ? "Creating..." : "Create"}
              </Button>
            </form>
          ) : (
            <div className="space-y-3 rounded-md border border-[var(--app-border)] p-4">
              <h2 className="text-lg font-semibold">{title.trim() || "Untitled Draft"}</h2>
              <MarkdownPreview content={content.trim() || "Nothing to preview yet."} className="text-sm" />
            </div>
          )}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </CardContent>
      </Card>

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
          My Documents
        </h2>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!isLoaded ? <p className="text-sm text-[var(--app-muted)]">Checking authentication…</p> : null}
        {isLoaded && !isSignedIn ? (
          <p className="text-sm text-[var(--app-muted)]">Sign in to view and manage your documents.</p>
        ) : loading ? (
          <p className="text-sm text-[var(--app-muted)]">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">No documents yet. Create one above.</p>
        ) : (
          <ul className="space-y-3">
            {documents.map((document) => {
              const updated = new Date(document.updatedAt);
              const preview = document.latestRevision?.content ?? "";
              const fallback = plainTextSummary(preview, 190);
              const documentTitle = document.latestRevision?.title ?? "Untitled";

              return (
                <li key={document.id}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium">{documentTitle}</p>
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
                      <div className="mt-3">
                        <MarkdownPreview content={preview} clampLines={4} fallback={fallback} />
                      </div>
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
