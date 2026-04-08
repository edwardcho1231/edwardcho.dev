import type { MetadataRoute } from "next";
import { getPublishedDocuments } from "@/lib/public-content";
import { buildDocumentPath, buildSitemapEntry } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogDocuments, projectDocuments] = await Promise.all([
    getPublishedDocuments("BLOG"),
    getPublishedDocuments("PROJECT"),
  ]);

  const entries: MetadataRoute.Sitemap = [
    buildSitemapEntry("/"),
    buildSitemapEntry("/about"),
    buildSitemapEntry("/blog"),
    buildSitemapEntry("/projects"),
  ];

  for (const document of [...blogDocuments, ...projectDocuments]) {
    if (!document.slug || !document.kind) {
      continue;
    }

    entries.push(
      buildSitemapEntry(
        buildDocumentPath(document.kind, document.slug),
        document.publishedAt ?? document.updatedAt,
      ),
    );
  }

  return entries;
}
