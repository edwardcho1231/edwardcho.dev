"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "./markdown-preview";
import { type Document } from "../types";

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

type DocumentCardProps = {
  document: Document;
  isMutating: boolean;
  isDeleting: boolean;
  onEdit: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onOpenRevisions: (documentId: string) => void;
};

export function DocumentCard({
  document,
  isMutating,
  isDeleting,
  onEdit,
  onDelete,
  onOpenRevisions,
}: DocumentCardProps) {
  const updated = new Date(document.updatedAt);
  const preview = document.latestRevision?.content ?? "";
  const fallback = plainTextSummary(preview, 190);
  const documentTitle = document.latestRevision?.title ?? "Untitled";

  return (
    <li>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-medium">{documentTitle}</p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isMutating}
                onClick={() => onOpenRevisions(document.id)}
              >
                Revisions
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isMutating}
                onClick={() => onEdit(document)}
              >
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isMutating}
                className="border-red-600/70 text-red-300 hover:border-red-500 hover:bg-red-600/15"
                onClick={() => onDelete(document.id)}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
          <p className="mt-1 text-sm text-[var(--app-muted)]">
            Updated {updated.toLocaleString()} • Revision {document.latestRevision?.revisionNumber ?? 0}
          </p>
          <p className="mt-1 text-xs text-[var(--app-muted)]">ID: {document.id}</p>
          <div className="mt-3">
            <MarkdownPreview content={preview} clampLines={4} fallback={fallback} />
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
