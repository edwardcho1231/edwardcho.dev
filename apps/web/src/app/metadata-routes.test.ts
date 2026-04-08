import { afterEach, describe, expect, it, vi } from "vitest";
import type { PublishedDocumentRecord } from "@/types/documents";
import { metadata as projectEdwardChoDevMetadata } from "./(public)/project/edwardcho.dev/page";
import robots from "./robots";
import sitemap from "./sitemap";

const { getPublishedDocumentsMock } = vi.hoisted(() => ({
  getPublishedDocumentsMock: vi.fn(),
}));

vi.mock("@/lib/public-content", () => ({
  getPublishedDocuments: getPublishedDocumentsMock,
}));

function createPublishedDocument(
  kind: "BLOG" | "PROJECT",
  slug: string | null,
): PublishedDocumentRecord {
  return {
    id: `${kind.toLowerCase()}-${slug ?? "missing"}`,
    ownerId: "user-1",
    createdAt: new Date("2026-04-01T10:00:00.000Z"),
    updatedAt: new Date("2026-04-02T10:00:00.000Z"),
    kind,
    status: "PUBLISHED",
    slug,
    excerpt: null,
    publishedAt: new Date("2026-04-03T10:00:00.000Z"),
    latestRevision: {
      id: "rev-1",
      revisionNumber: 1,
      title: "Published title",
      content: "Published content",
      createdAt: new Date("2026-04-03T10:00:00.000Z"),
    },
  };
}

afterEach(() => {
  getPublishedDocumentsMock.mockReset();
});

describe("metadata routes", () => {
  it("returns a permissive robots policy with a sitemap reference", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://edwardcho.dev/sitemap.xml",
      host: "https://edwardcho.dev",
    });
  });

  it("marks the legacy case-study fallback route as non-indexable", () => {
    expect(projectEdwardChoDevMetadata).toMatchObject({
      alternates: {
        canonical: "https://edwardcho.dev/project/edwardcho.dev",
      },
      robots: {
        index: false,
        follow: false,
      },
    });
  });

  it("returns only public URLs and published document slugs in the sitemap", async () => {
    getPublishedDocumentsMock
      .mockResolvedValueOnce([
        createPublishedDocument("BLOG", "launch-post"),
        createPublishedDocument("BLOG", null),
      ])
      .mockResolvedValueOnce([createPublishedDocument("PROJECT", "editor-lab")]);

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(getPublishedDocumentsMock).toHaveBeenNthCalledWith(1, "BLOG");
    expect(getPublishedDocumentsMock).toHaveBeenNthCalledWith(2, "PROJECT");
    expect(urls).toEqual([
      "https://edwardcho.dev",
      "https://edwardcho.dev/about",
      "https://edwardcho.dev/blog",
      "https://edwardcho.dev/projects",
      "https://edwardcho.dev/blog/launch-post",
      "https://edwardcho.dev/projects/editor-lab",
    ]);
  });
});
