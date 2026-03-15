import Link from "next/link";

export default function ProjectDocRevPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-4.2rem)] max-w-3xl px-6 py-16">
      <p className="text-xs font-medium tracking-[0.28em] text-[var(--app-muted)] uppercase">
        Project
      </p>
      <h1 className="mt-3 text-4xl font-semibold">
        DocRev: Personal Portfolio + Editorial Sandbox
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--app-muted)]">
        DocRev is a private-first editorial CMS sandbox for practicing and
        extending the document systems I work on professionally, with selective
        public publishing planned for the next milestone.
      </p>
      <p className="mt-6">
        <Link
          href="/documents"
          className="inline-flex rounded border border-[var(--app-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)] transition-colors hover:border-[var(--app-link-hover)] hover:text-[var(--app-link-hover)]"
        >
          View workspace
        </Link>
      </p>

      <section className="mt-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--app-muted)]">
          What&apos;s live
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--app-muted)]">
          <li>
            <span className="text-[var(--app-foreground)] font-semibold">
              Private documents workspace
            </span>{" "}
            using Next.js (App Router), TypeScript/React, shadcn/ui primitives,
            Clerk session-gated create/edit/delete/list flows, and reusable
            editor/card components.
          </li>
          <li>
            <span className="text-[var(--app-foreground)] font-semibold">
              Revisioned data model
            </span>{" "}
            with append-only history: each document update creates a new revision
            with a revision number and preserves latest revision metadata.
          </li>
          <li>
            <span className="text-[var(--app-foreground)] font-semibold">
              Compose/preview editor
            </span>{" "}
            with sanitized GFM rendering, markdown safety, and content safeguards
            (length limits + validation).
          </li>
          <li>
            <span className="text-[var(--app-foreground)] font-semibold">
              API and persistence
            </span>{" "}
            built on an Express service with route-level auth and a Prisma/PostgreSQL
            data layer, plus Zod request validation.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--app-muted)]">
          Roadmap
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-7 text-[var(--app-muted)]">
          <li>
            Document search page for workspace drafts and future published content.
          </li>
          <li>Revision history viewer.</li>
          <li>
            Publish workflow to promote selected documents to a public section.
          </li>
        </ol>
      </section>

    </main>
  );
}
