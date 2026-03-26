import { notFound } from "next/navigation";
import { MarkdownPreview } from "../../../documents/components/markdown-preview";
import { getPublishedDocumentBySlug } from "@/lib/public-content";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const document = await getPublishedDocumentBySlug("PROJECT", decodeURIComponent(slug));

  if (!document || !document.latestRevision) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4.2rem)] max-w-3xl px-6 py-16">
      <p className="text-xs font-medium tracking-[0.28em] text-[var(--app-muted)] uppercase">Project</p>
      <h1 className="mt-3 text-4xl font-semibold">{document.latestRevision.title}</h1>
      {document.excerpt ? (
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--app-muted)]">{document.excerpt}</p>
      ) : null}
      <p className="mt-4 text-xs text-[var(--app-muted)]">
        Published {new Date(document.publishedAt ?? document.updatedAt).toLocaleDateString()}
      </p>
      <article className="mt-8">
        <MarkdownPreview content={document.latestRevision.content} className="text-base" />
      </article>
    </main>
  );
}
