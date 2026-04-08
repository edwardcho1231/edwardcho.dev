import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedDocuments } from "@/lib/public-content";
import { projectsIndexMetadata } from "@/lib/seo";
import { type PublishedDocumentRecord } from "@/types/documents";

export const dynamic = "force-dynamic";
export const metadata: Metadata = projectsIndexMetadata;

export default async function ProjectsIndexPage() {
  const documents: PublishedDocumentRecord[] =
    await getPublishedDocuments("PROJECT");

  return (
    <main className="mx-auto min-h-[calc(100vh-4.2rem)] max-w-3xl px-6 py-16">
      <p className="text-xs font-medium tracking-[0.28em] text-[var(--app-muted)] uppercase">
        Projects
      </p>
      <h1 className="mt-3 text-4xl font-semibold">Project Notes</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--app-muted)]">
        Published project documents from the editor lab.
      </p>

      {documents.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--app-muted)]">
          No published projects yet.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {documents.map((document) => {
            if (!document.slug) {
              return null;
            }

            const title = document.latestRevision?.title ?? "Untitled";
            const excerpt = document.excerpt ?? "No excerpt";
            return (
              <li
                key={document.id}
                className="rounded-md border border-[var(--app-border)] p-4"
              >
                <h2 className="text-xl font-semibold">
                  <Link
                    href={`/projects/${document.slug}`}
                    className="hover:text-[var(--app-link-hover)]"
                  >
                    {title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                  {excerpt}
                </p>
                <p className="mt-3 text-xs text-[var(--app-muted)]">
                  Published{" "}
                  {new Date(
                    document.publishedAt ?? document.updatedAt,
                  ).toLocaleDateString()}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
