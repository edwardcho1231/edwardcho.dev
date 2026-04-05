"use client";

import { type DocumentRevisionDto } from "@/types/documents";
import {
  buildRevisionDiffSections,
  type RevisionDiffLine,
  type RevisionDiffSegment,
} from "./revision-compare";

type RevisionDiffViewProps = {
  olderRevision: DocumentRevisionDto;
  newerRevision: DocumentRevisionDto;
};

function InlineDiffSegment({
  segment,
  lineType,
}: {
  segment: RevisionDiffSegment;
  lineType: RevisionDiffLine["type"];
}) {
  if (lineType === "remove" && segment.type === "add") {
    return null;
  }

  if (lineType === "add" && segment.type === "remove") {
    return null;
  }

  const className =
    segment.type === "add"
      ? "rounded bg-emerald-600/20"
      : segment.type === "remove"
        ? "rounded bg-red-600/20"
        : undefined;

  return <span className={className}>{segment.value}</span>;
}

function DiffLineRow({ line }: { line: RevisionDiffLine }) {
  const marker =
    line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
  const lineClassName =
    line.type === "add"
      ? "bg-emerald-500/12 text-emerald-900"
      : line.type === "remove"
        ? "bg-red-500/12 text-red-900"
        : "text-[var(--app-foreground)]";

  return (
    <div
      className={`grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 px-3 py-1.5 ${lineClassName}`}
    >
      <span className="select-none text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
        {marker}
      </span>
      <span className="whitespace-pre-wrap break-words">
        {line.inlineSegments ? (
          line.inlineSegments.map((segment, index) => (
            <InlineDiffSegment
              key={`${line.type}-${index}-${segment.value}`}
              segment={segment}
              lineType={line.type}
            />
          ))
        ) : line.value.length > 0 ? (
          line.value
        ) : (
          " "
        )}
      </span>
    </div>
  );
}

export function RevisionDiffView({
  olderRevision,
  newerRevision,
}: RevisionDiffViewProps) {
  const sections = buildRevisionDiffSections(olderRevision, newerRevision);
  const titleChanged = olderRevision.title !== newerRevision.title;

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)]/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
          Compare Summary
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
              Newer Revision
            </p>
            <p className="mt-1 text-sm font-medium">
              Revision #{newerRevision.revisionNumber}
            </p>
            <p className="text-xs text-[var(--app-muted)]">
              {new Date(newerRevision.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
              Older Revision
            </p>
            <p className="mt-1 text-sm font-medium">
              Revision #{olderRevision.revisionNumber}
            </p>
            <p className="text-xs text-[var(--app-muted)]">
              {new Date(olderRevision.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--app-muted)]">
          {titleChanged ? "Title changed" : "Title unchanged"}
        </p>
      </div>

      {sections.map((section) => (
        <section key={section.id} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
              {section.label}
            </h3>
            <p className="text-xs text-[var(--app-muted)]">
              {section.hasChanges ? "Changed" : "No changes"}
            </p>
          </div>
          <div className="overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-surface-alt)]/50">
            <div className="max-h-[28rem] overflow-auto font-mono text-xs leading-6">
              {section.lines.length > 0 ? (
                section.lines.map((line, index) => (
                  <DiffLineRow
                    key={`${section.id}-${line.type}-${index}`}
                    line={line}
                  />
                ))
              ) : (
                <p className="px-3 py-2 text-[var(--app-muted)]">
                  No content to compare.
                </p>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
