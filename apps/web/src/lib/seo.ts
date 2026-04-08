import type { Metadata, MetadataRoute } from "next";
import {
  type DocumentKind,
  type PublishedDocumentRecord,
} from "@/types/documents";

export const SITE_ORIGIN = "https://edwardcho.dev";
export const SITE_URL = new URL(SITE_ORIGIN);
export const SITE_NAME = "Edward Cho";
export const SITE_TITLE = "Edward Cho | Senior Software Engineer";
export const SITE_DESCRIPTION =
  "Portfolio and notes from a senior software engineer building simple, resilient web systems.";

function buildCanonical(pathname: string): string {
  return pathname === "/" ? SITE_ORIGIN : `${SITE_ORIGIN}${pathname}`;
}

export function buildPageMetadata(
  title: string,
  description: string,
  pathname: string,
): Metadata {
  const canonical = buildCanonical(pathname);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: SITE_URL,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_ORIGIN,
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_ORIGIN,
    siteName: SITE_NAME,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const homeMetadata = buildPageMetadata(
  SITE_TITLE,
  "Senior software engineer portfolio focused on product systems, publishing workflows, and resilient web software.",
  "/",
);

export const aboutMetadata = buildPageMetadata(
  "About | Edward Cho",
  "Background, experience, and delivery focus across editorial and subscription platforms.",
  "/about",
);

export const blogIndexMetadata = buildPageMetadata(
  "Blog | Edward Cho",
  "Published notes and essays on systems design, workflows, and engineering tradeoffs.",
  "/blog",
);

export const projectsIndexMetadata = buildPageMetadata(
  "Projects | Edward Cho",
  "Project writeups and case studies from a portfolio platform and editor lab.",
  "/projects",
);

export const demoEditorMetadata: Metadata = {
  ...buildPageMetadata(
    "Editor Demo | Edward Cho",
    "Public demo of the document editor with seeded sample content and in-memory state.",
    "/demo/editor",
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export function buildDocumentPath(kind: DocumentKind, slug: string): string {
  return kind === "BLOG" ? `/blog/${slug}` : `/projects/${slug}`;
}

export function buildDocumentMetadata(
  document: PublishedDocumentRecord,
): Metadata {
  const title = document.latestRevision?.title ?? "Untitled";
  const description =
    document.excerpt ??
    "Published from the edwardcho.dev documents workspace.";
  const pathname =
    document.kind === null || document.slug === null
      ? "/"
      : buildDocumentPath(document.kind, document.slug);
  const canonical = buildCanonical(pathname);

  return {
    title: `${title} | Edward Cho`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: (document.publishedAt ?? document.updatedAt).toISOString(),
    },
  };
}

export function buildSitemapEntry(
  pathname: string,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: buildCanonical(pathname),
    lastModified,
  };
}
