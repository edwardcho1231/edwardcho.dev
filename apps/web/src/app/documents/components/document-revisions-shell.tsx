"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { type DocumentRevisionDto } from "@/types/documents";
import { MarkdownPreview } from "./markdown-preview";
import {
  getComparisonCandidates,
  resolveComparisonRevisionId,
} from "./revision-compare";
import { RevisionDiffView } from "./revision-diff-view";

function RevisionListItem({
  revision,
  isSelected,
  onSelect,
}: {
  revision: DocumentRevisionDto;
  isSelected: boolean;
  onSelect: (revision: DocumentRevisionDto) => void;
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
        <p className="text-sm font-medium">
          Revision #{revision.revisionNumber}
        </p>
        <p className="mt-1 text-xs text-[var(--app-muted)]">
          {new Date(revision.createdAt).toLocaleString()}
        </p>
      </button>
    </li>
  );
}

type DocumentRevisionsShellProps = {
  loadRevisions: (documentId: string) => Promise<DocumentRevisionDto[]>;
  backHref: string;
};

export function DocumentRevisionsShell({
  loadRevisions,
  backHref,
}: DocumentRevisionsShellProps) {
  const params = useParams<{ documentId?: string | string[] }>();
  const documentId = Array.isArray(params.documentId)
    ? params.documentId[0]
    : params.documentId;
  const [revisions, setRevisions] = useState<DocumentRevisionDto[]>([]);
  const [selectedRevision, setSelectedRevision] =
    useState<DocumentRevisionDto | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparisonRevisionId, setComparisonRevisionId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRevisionList = useCallback(async () => {
    if (!documentId) {
      setError("Invalid document.");
      setRevisions([]);
      setSelectedRevision(null);
      setIsCompareMode(false);
      setComparisonRevisionId(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedRevisions = await loadRevisions(documentId);
      setRevisions(fetchedRevisions);
      setSelectedRevision((previous) =>
        previous &&
        fetchedRevisions.some((revision) => revision.id === previous.id)
          ? previous
          : (fetchedRevisions[0] ?? null),
      );
      setIsCompareMode(false);
      setComparisonRevisionId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load revisions");
    } finally {
      setLoading(false);
    }
  }, [documentId, loadRevisions]);

  useEffect(() => {
    loadRevisionList();
  }, [loadRevisionList]);

  const hasRevisions = revisions.length > 0;
  const selectedRevisionTitle = useMemo(
    () => selectedRevision?.title || "Untitled revision",
    [selectedRevision?.title],
  );
  const comparisonCandidates = useMemo(
    () => getComparisonCandidates(revisions, selectedRevision?.id ?? null),
    [revisions, selectedRevision?.id],
  );
  const resolvedComparisonRevisionId = useMemo(
    () =>
      resolveComparisonRevisionId(
        revisions,
        selectedRevision?.id ?? null,
        comparisonRevisionId,
      ),
    [comparisonRevisionId, revisions, selectedRevision?.id],
  );
  const comparisonRevision = useMemo(
    () =>
      comparisonCandidates.find(
        (revision) => revision.id === resolvedComparisonRevisionId,
      ) ?? null,
    [comparisonCandidates, resolvedComparisonRevisionId],
  );
  const canCompare = comparisonCandidates.length > 0;

  useEffect(() => {
    if (comparisonRevisionId !== resolvedComparisonRevisionId) {
      setComparisonRevisionId(resolvedComparisonRevisionId);
    }
  }, [comparisonRevisionId, resolvedComparisonRevisionId]);

  useEffect(() => {
    if (isCompareMode && !comparisonRevision) {
      setIsCompareMode(false);
    }
  }, [comparisonRevision, isCompareMode]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--app-muted)]">
            <Link
              href={backHref}
              className="hover:text-[var(--app-link-hover)]"
            >
              ← Back to Documents
            </Link>
          </p>
          <h1 className="mt-2 text-4xl font-semibold">Document Revisions</h1>
        </div>
      </div>

      {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="h-fit">
          <CardContent className="space-y-4 p-4">
            <p className="text-sm text-[var(--app-muted)]">
              {loading
                ? "Loading revisions..."
                : `Revision count: ${revisions.length}`}
            </p>
            <ul className="space-y-2">
              {hasRevisions ? (
                revisions.map((revision) => (
                  <RevisionListItem
                    key={revision.id}
                    revision={revision}
                    isSelected={selectedRevision?.id === revision.id}
                    onSelect={(nextRevision) =>
                      setSelectedRevision(nextRevision)
                    }
                  />
                ))
              ) : (
                <li className="text-sm text-[var(--app-muted)]">
                  No revisions yet.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            {selectedRevision ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[var(--app-muted)]">
                      Revision #{selectedRevision.revisionNumber}
                    </p>
                    <h2 className="text-2xl font-semibold">
                      {selectedRevisionTitle}
                    </h2>
                    <p className="text-xs text-[var(--app-muted)]">
                      {new Date(selectedRevision.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isCompareMode ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCompareMode(false)}
                      >
                        Exit Compare
                      </Button>
                    ) : canCompare ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCompareMode(true)}
                      >
                        Compare
                      </Button>
                    ) : null}
                  </div>
                </div>
                {isCompareMode && comparisonRevision ? (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="compare-revision">Compare Against</Label>
                      <select
                        id="compare-revision"
                        className="h-9 w-full rounded-md border border-[var(--app-border)] bg-transparent px-3 text-sm"
                        value={resolvedComparisonRevisionId ?? ""}
                        onChange={(event) =>
                          setComparisonRevisionId(event.target.value)
                        }
                      >
                        {comparisonCandidates.map((revision) => (
                          <option key={revision.id} value={revision.id}>
                            Revision #{revision.revisionNumber} ·{" "}
                            {new Date(revision.createdAt).toLocaleString()}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-[var(--app-muted)]">
                        The selected revision stays fixed as the newer revision.
                      </p>
                    </div>
                    <RevisionDiffView
                      olderRevision={comparisonRevision}
                      newerRevision={selectedRevision}
                    />
                  </>
                ) : (
                  <>
                    <MarkdownPreview
                      content={selectedRevision.content}
                      className="text-sm"
                    />
                    {!canCompare ? (
                      <p className="text-xs text-[var(--app-muted)]">
                        Compare becomes available once the document has an older
                        revision.
                      </p>
                    ) : null}
                  </>
                )}
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
