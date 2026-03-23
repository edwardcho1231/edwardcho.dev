"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "../../components/markdown-preview";
import { fetchDocumentRevisions } from "../../services";
import { type Revision } from "../../types";

function RevisionListItem({
  revision,
  isSelected,
  onSelect,
}: {
  revision: Revision;
  isSelected: boolean;
  onSelect: (revision: Revision) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(revision)}
        className={`w-full rounded-md border p-3 text-left transition ${
          isSelected
            ? "border-[var(--app-link)] bg-[var(--app-surface)]"
            : "border-[var(--app-border)] hover:border-[var(--app-muted)]"
        }`}
      >
        <p className="text-sm font-medium">Revision #{revision.revisionNumber}</p>
        <p className="mt-1 text-xs text-[var(--app-muted)]">
          {new Date(revision.createdAt).toLocaleString()}
        </p>
      </button>
    </li>
  );
}

export default function DocumentRevisionsPage() {
  const params = useParams<{ documentId?: string | string[] }>();
  const documentId = Array.isArray(params.documentId)
    ? params.documentId[0]
    : params.documentId;
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRevisions = useCallback(async () => {
    if (!documentId) {
      setError("Invalid document.");
      setRevisions([]);
      setSelectedRevision(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedRevisions = await fetchDocumentRevisions(documentId);
      setRevisions(fetchedRevisions);
      setSelectedRevision((previous) =>
        previous && fetchedRevisions.some((revision) => revision.id === previous.id)
          ? previous
          : fetchedRevisions[0] ?? null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load revisions");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadRevisions();
  }, [loadRevisions]);

  const hasRevisions = revisions.length > 0;
  const selectedRevisionTitle = useMemo(
    () => selectedRevision?.title || "Untitled revision",
    [selectedRevision?.title],
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--app-muted)]">
            <Link href="/documents" className="hover:text-[var(--app-link-hover)]">
              ← Back to Documents
            </Link>
          </p>
          <h1 className="mt-2 text-4xl font-semibold">Document Revisions</h1>
        </div>
      </div>

      {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

      <section className="mt-8 grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card className="h-fit">
            <CardContent className="space-y-4 p-4">
              <p className="text-sm text-[var(--app-muted)]">
                {loading ? "Loading revisions..." : `Revision count: ${revisions.length}`}
              </p>
              <ul className="space-y-2">
                {hasRevisions ? (
                  revisions.map((revision) => (
                    <RevisionListItem
                      key={revision.id}
                      revision={revision}
                      isSelected={selectedRevision?.id === revision.id}
                      onSelect={(nextRevision) => setSelectedRevision(nextRevision)}
                    />
                  ))
                ) : (
                  <li className="text-sm text-[var(--app-muted)]">No revisions yet.</li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-4">
              {selectedRevision ? (
                <>
                  <div>
                    <p className="text-sm text-[var(--app-muted)]">
                      Revision #{selectedRevision.revisionNumber}
                    </p>
                    <h2 className="text-2xl font-semibold">{selectedRevisionTitle}</h2>
                    <p className="text-xs text-[var(--app-muted)]">
                      {new Date(selectedRevision.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <MarkdownPreview content={selectedRevision.content} className="text-sm" />
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedRevision(null)}
                      disabled={!selectedRevision}
                    >
                      Clear selection
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--app-muted)]">
                  Select a revision from the list to preview it.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
    </main>
  );
}
