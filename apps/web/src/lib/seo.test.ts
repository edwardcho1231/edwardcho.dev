import { describe, expect, it } from "vitest";
import type { PublishedDocumentRecord } from "@/types/documents";
import {
  SITE_ORIGIN,
  aboutMetadata,
  blogIndexMetadata,
  buildDocumentMetadata,
  demoEditorMetadata,
  homeMetadata,
  projectsIndexMetadata,
  rootMetadata,
} from "./seo";

function createPublishedDocument(
  overrides: Partial<PublishedDocumentRecord> = {},
): PublishedDocumentRecord {
  return {
    id: "doc-1",
    ownerId: "user-1",
    createdAt: new Date("2026-04-01T10:00:00.000Z"),
    updatedAt: new Date("2026-04-02T10:00:00.000Z"),
    kind: "BLOG",
    status: "PUBLISHED",
    slug: "hello-world",
    excerpt: "A closer look at workflow design.",
    publishedAt: new Date("2026-04-03T10:00:00.000Z"),
    latestRevision: {
      id: "rev-1",
      revisionNumber: 1,
      title: "Hello World",
      content: "Published content",
      createdAt: new Date("2026-04-03T10:00:00.000Z"),
    },
    ...overrides,
  };
}

describe("seo helpers", () => {
  it("defines root metadata with canonical origin and social defaults", () => {
    expect(rootMetadata.metadataBase?.toString()).toBe(`${SITE_ORIGIN}/`);
    expect(rootMetadata.alternates?.canonical).toBe(SITE_ORIGIN);
    expect(rootMetadata.openGraph).toMatchObject({
      title: "Edward Cho | Senior Software Engineer",
      url: SITE_ORIGIN,
      siteName: "Edward Cho",
      type: "website",
    });
    expect(rootMetadata.twitter).toBeUndefined();
    expect(rootMetadata.robots).toMatchObject({
      index: true,
      follow: true,
    });
  });

  it("defines route-level metadata for the main public pages", () => {
    expect(homeMetadata).toMatchObject({
      title: "Edward Cho | Senior Software Engineer",
      alternates: { canonical: SITE_ORIGIN },
    });
    expect(aboutMetadata).toMatchObject({
      title: "About | Edward Cho",
      alternates: { canonical: `${SITE_ORIGIN}/about` },
    });
    expect(blogIndexMetadata).toMatchObject({
      title: "Blog | Edward Cho",
      alternates: { canonical: `${SITE_ORIGIN}/blog` },
    });
    expect(projectsIndexMetadata).toMatchObject({
      title: "Projects | Edward Cho",
      alternates: { canonical: `${SITE_ORIGIN}/projects` },
    });
  });

  it("builds document metadata from title, excerpt, and slug path", () => {
    const metadata = buildDocumentMetadata(createPublishedDocument());

    expect(metadata).toMatchObject({
      title: "Hello World | Edward Cho",
      description: "A closer look at workflow design.",
      alternates: { canonical: `${SITE_ORIGIN}/blog/hello-world` },
    });
    expect(metadata.openGraph).toMatchObject({
      title: "Hello World",
      description: "A closer look at workflow design.",
      url: `${SITE_ORIGIN}/blog/hello-world`,
      type: "article",
      publishedTime: "2026-04-03T10:00:00.000Z",
    });
  });

  it("marks the public demo metadata as non-indexable", () => {
    expect(demoEditorMetadata).toMatchObject({
      title: "Editor Demo | Edward Cho",
      alternates: { canonical: `${SITE_ORIGIN}/demo/editor` },
      robots: {
        index: false,
        follow: false,
      },
    });
  });
});
