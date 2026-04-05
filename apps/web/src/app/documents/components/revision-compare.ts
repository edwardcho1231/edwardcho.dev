import { diffLines, diffWordsWithSpace } from "diff";
import { type DocumentRevisionDto } from "@/types/documents";

export type RevisionDiffSegment = {
  type: "context" | "add" | "remove";
  value: string;
};

export type RevisionDiffLine = RevisionDiffSegment & {
  inlineSegments?: RevisionDiffSegment[];
};

export type RevisionDiffSection = {
  id: "title" | "content";
  label: string;
  lines: RevisionDiffLine[];
  hasChanges: boolean;
};

function getDiffChangeType(change: {
  added?: boolean;
  removed?: boolean;
}): RevisionDiffSegment["type"] {
  return change.added ? "add" : change.removed ? "remove" : "context";
}

function splitDiffValueIntoLines(value: string) {
  if (value.length === 0) {
    return [];
  }

  const normalizedValue = value.replace(/\r\n/g, "\n");
  const lines = normalizedValue.split("\n");

  if (normalizedValue.endsWith("\n")) {
    lines.pop();
  }

  return lines;
}

export function buildUnifiedDiffLines(previousText: string, nextText: string) {
  const changes = diffLines(previousText, nextText);

  return changes.flatMap((change) => {
    const type = getDiffChangeType(change);

    return splitDiffValueIntoLines(change.value).map((value) => ({
      type,
      value,
    }));
  });
}

function buildInlineSegments(previousValue: string, nextValue: string) {
  return diffWordsWithSpace(previousValue, nextValue).map(
    (change): RevisionDiffSegment => ({
      type: getDiffChangeType(change),
      value: change.value,
    }),
  );
}

function enrichChangedLinePairs(lines: RevisionDiffLine[]): RevisionDiffLine[] {
  const enrichedLines = [...lines];

  for (let index = 0; index < enrichedLines.length; index += 1) {
    const currentLine = enrichedLines[index];

    if (!currentLine || currentLine.type !== "remove") {
      continue;
    }

    const removeStart = index;
    let removeEnd = index;

    while (enrichedLines[removeEnd + 1]?.type === "remove") {
      removeEnd += 1;
    }

    const addStart = removeEnd + 1;

    if (enrichedLines[addStart]?.type !== "add") {
      index = removeEnd;
      continue;
    }

    let addEnd = addStart;

    while (enrichedLines[addEnd + 1]?.type === "add") {
      addEnd += 1;
    }

    const removedLines = enrichedLines.slice(removeStart, removeEnd + 1);
    const addedLines = enrichedLines.slice(addStart, addEnd + 1);

    if (removedLines.length === addedLines.length) {
      for (let pairIndex = 0; pairIndex < removedLines.length; pairIndex += 1) {
        const removedLine = removedLines[pairIndex];
        const addedLine = addedLines[pairIndex];

        if (!removedLine || !addedLine) {
          continue;
        }

        if (
          removedLine.value.trim().length === 0 ||
          addedLine.value.trim().length === 0
        ) {
          continue;
        }

        const inlineSegments = buildInlineSegments(
          removedLine.value,
          addedLine.value,
        );

        enrichedLines[removeStart + pairIndex] = {
          ...removedLine,
          inlineSegments,
        };
        enrichedLines[addStart + pairIndex] = {
          ...addedLine,
          inlineSegments,
        };
      }
    }

    index = addEnd;
  }

  return enrichedLines;
}

export function buildRevisionDiffSections(
  olderRevision: DocumentRevisionDto,
  newerRevision: DocumentRevisionDto,
): RevisionDiffSection[] {
  const titleLines = buildUnifiedDiffLines(
    olderRevision.title,
    newerRevision.title,
  );
  const contentLines = buildUnifiedDiffLines(
    olderRevision.content,
    newerRevision.content,
  );

  return [
    {
      id: "title",
      label: "Title",
      lines: enrichChangedLinePairs(titleLines),
      hasChanges: titleLines.some((line) => line.type !== "context"),
    },
    {
      id: "content",
      label: "Content",
      lines: enrichChangedLinePairs(contentLines),
      hasChanges: contentLines.some((line) => line.type !== "context"),
    },
  ];
}

export function getComparisonCandidates(
  revisions: DocumentRevisionDto[],
  selectedRevisionId: string | null,
): DocumentRevisionDto[] {
  if (!selectedRevisionId) {
    return [];
  }

  const selectedIndex = revisions.findIndex(
    (revision) => revision.id === selectedRevisionId,
  );

  if (selectedIndex === -1) {
    return [];
  }

  return revisions.slice(selectedIndex + 1);
}

export function getDefaultComparisonRevisionId(
  revisions: DocumentRevisionDto[],
  selectedRevisionId: string | null,
): string | null {
  return getComparisonCandidates(revisions, selectedRevisionId)[0]?.id ?? null;
}

export function resolveComparisonRevisionId(
  revisions: DocumentRevisionDto[],
  selectedRevisionId: string | null,
  comparisonRevisionId: string | null,
): string | null {
  const candidates = getComparisonCandidates(revisions, selectedRevisionId);

  if (candidates.length === 0) {
    return null;
  }

  if (
    comparisonRevisionId &&
    candidates.some((revision) => revision.id === comparisonRevisionId)
  ) {
    return comparisonRevisionId;
  }

  return candidates[0]!.id;
}
