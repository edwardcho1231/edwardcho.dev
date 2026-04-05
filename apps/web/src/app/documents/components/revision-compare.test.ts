import { describe, expect, it } from "vitest";
import { type DocumentRevisionDto } from "@/types/documents";
import {
  buildRevisionDiffSections,
  buildUnifiedDiffLines,
  getComparisonCandidates,
  getDefaultComparisonRevisionId,
  resolveComparisonRevisionId,
} from "./revision-compare";

function createRevision(
  id: string,
  revisionNumber: number,
  title: string,
  content: string,
): DocumentRevisionDto {
  return {
    id,
    revisionNumber,
    title,
    content,
    createdAt: `2026-04-0${revisionNumber}T12:00:00.000Z`,
  };
}

describe("revision compare helpers", () => {
  it("does not mark any lines as added or removed when content is identical", () => {
    const lines = buildUnifiedDiffLines(
      "## Overview\n\nSame content",
      "## Overview\n\nSame content",
    );

    expect(lines).toHaveLength(3);
    expect(lines.every((line) => line.type === "context")).toBe(true);
  });

  it("preserves removed lines before added lines in mixed changes", () => {
    const lines = buildUnifiedDiffLines(
      "line one\nline two\nline three",
      "line one\nline two updated\nline three\nline four",
    );

    expect(lines[0]).toEqual({ type: "context", value: "line one" });
    expect(lines.some((line) => line.type === "remove" && line.value === "line two")).toBe(
      true,
    );
    expect(
      lines.some((line) => line.type === "add" && line.value === "line two updated"),
    ).toBe(true);
    expect(lines.at(-1)).toEqual({ type: "add", value: "line four" });

    const removedLineTwoIndex = lines.findIndex(
      (line) => line.type === "remove" && line.value === "line two",
    );
    const addedLineTwoIndex = lines.findIndex(
      (line) => line.type === "add" && line.value === "line two updated",
    );

    expect(removedLineTwoIndex).toBeGreaterThan(-1);
    expect(addedLineTwoIndex).toBeGreaterThan(removedLineTwoIndex);
  });

  it("builds title and content sections with accurate change state", () => {
    const olderRevision = createRevision(
      "rev-1",
      1,
      "Original title",
      "First paragraph",
    );
    const newerRevision = createRevision(
      "rev-2",
      2,
      "Updated title",
      "First paragraph\n\nAdded second paragraph",
    );

    const sections = buildRevisionDiffSections(olderRevision, newerRevision);

    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({
      id: "title",
      hasChanges: true,
    });
    expect(sections[1]).toMatchObject({
      id: "content",
      hasChanges: true,
    });
  });

  it("adds inline word-level segments for changed remove/add line pairs", () => {
    const olderRevision = createRevision(
      "rev-1",
      1,
      "Original title",
      "Ship the feature safely",
    );
    const newerRevision = createRevision(
      "rev-2",
      2,
      "Original title",
      "Ship the compare feature safely",
    );

    const sections = buildRevisionDiffSections(olderRevision, newerRevision);
    const contentSection = sections[1]!;
    const removedLine = contentSection.lines.find((line) => line.type === "remove");
    const addedLine = contentSection.lines.find((line) => line.type === "add");

    expect(removedLine?.inlineSegments).toBeDefined();
    expect(addedLine?.inlineSegments).toBeDefined();
    expect(
      addedLine?.inlineSegments?.some(
        (segment) => segment.type === "add" && segment.value === "compare ",
      ),
    ).toBe(true);
  });

  it("adds inline segments for each line in an equal-size changed block", () => {
    const olderRevision = createRevision(
      "rev-1",
      1,
      "Original title",
      "Ship the feature safely\nReview the rollout plan carefully",
    );
    const newerRevision = createRevision(
      "rev-2",
      2,
      "Original title",
      "Ship the compare feature safely\nReview the release rollout plan carefully",
    );

    const sections = buildRevisionDiffSections(olderRevision, newerRevision);
    const contentSection = sections[1]!;
    const removedLines = contentSection.lines.filter((line) => line.type === "remove");
    const addedLines = contentSection.lines.filter((line) => line.type === "add");

    expect(removedLines).toHaveLength(2);
    expect(addedLines).toHaveLength(2);
    expect(removedLines.every((line) => line.inlineSegments)).toBe(true);
    expect(addedLines.every((line) => line.inlineSegments)).toBe(true);
    expect(
      addedLines[0]?.inlineSegments?.some(
        (segment) => segment.type === "add" && segment.value === "compare ",
      ),
    ).toBe(true);
    expect(
      addedLines[1]?.inlineSegments?.some(
        (segment) => segment.type === "add" && segment.value === "release ",
      ),
    ).toBe(true);
  });

  it("returns only older revisions as comparison candidates", () => {
    const revisions = [
      createRevision("rev-4", 4, "Revision 4", "Newest"),
      createRevision("rev-3", 3, "Revision 3", "Middle"),
      createRevision("rev-2", 2, "Revision 2", "Older"),
      createRevision("rev-1", 1, "Revision 1", "Oldest"),
    ];

    expect(getComparisonCandidates(revisions, "rev-3").map((revision) => revision.id))
      .toEqual(["rev-2", "rev-1"]);
  });

  it("defaults comparison to the immediately older revision", () => {
    const revisions = [
      createRevision("rev-3", 3, "Revision 3", "Newest"),
      createRevision("rev-2", 2, "Revision 2", "Older"),
      createRevision("rev-1", 1, "Revision 1", "Oldest"),
    ];

    expect(getDefaultComparisonRevisionId(revisions, "rev-3")).toBe("rev-2");
  });

  it("rejects same-revision comparison requests by falling back to the default older revision", () => {
    const revisions = [
      createRevision("rev-3", 3, "Revision 3", "Newest"),
      createRevision("rev-2", 2, "Revision 2", "Older"),
      createRevision("rev-1", 1, "Revision 1", "Oldest"),
    ];

    expect(resolveComparisonRevisionId(revisions, "rev-3", "rev-3")).toBe(
      "rev-2",
    );
  });

  it("returns null when no older revision exists", () => {
    const revisions = [
      createRevision("rev-2", 2, "Revision 2", "Newer"),
      createRevision("rev-1", 1, "Revision 1", "Older"),
    ];

    expect(resolveComparisonRevisionId(revisions, "rev-1", null)).toBe(null);
  });
});
