import Link from "next/link";

export default function ProjectEdwardChoDevPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-4.2rem)] max-w-3xl px-6 py-16">
      <p className="text-xs font-medium tracking-[0.28em] text-[var(--app-muted)] uppercase">
        Case Study
      </p>
      <h1 className="mt-3 text-4xl font-semibold">
        edwardcho.dev: Portfolio Platform + Editor Lab
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--app-muted)]">
        I built this platform to support two needs in one system: a focused
        public portfolio and a private workspace for drafting, revising, and
        iterating before publication.
      </p>
      <section className="mt-6 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)]/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--app-muted)]">
          At a Glance
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
              Role
            </p>
            <p className="mt-1 text-sm text-[var(--app-foreground)]">
              Product design, system design, and full-stack implementation
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
              Scope
            </p>
            <p className="mt-1 text-sm text-[var(--app-foreground)]">
              Public portfolio + private editor lab
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
              Focus
            </p>
            <p className="mt-1 text-sm text-[var(--app-foreground)]">
              Content operations and publishing workflows
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
              Stack
            </p>
            <p className="mt-1 text-sm text-[var(--app-foreground)]">
              Next.js, Clerk, Prisma, PostgreSQL, Zod
            </p>
          </div>
        </div>
      </section>
      <p className="mt-6">
        <Link
          href="/documents"
          className="inline-flex rounded border border-[var(--app-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)] transition-colors hover:border-[var(--app-link-hover)] hover:text-[var(--app-link-hover)]"
        >
          Explore Editor Lab
        </Link>
      </p>

      <section className="mt-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--app-muted)]">
          Context
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--app-muted)]">
          The core challenge was to keep the public site focused and credible
          while giving myself a private environment for testing publishing
          workflows, content operations, and product ideas without exposing
          unfinished work to visitors.
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--app-muted)]">
          I also used the project to explore editorial workflows more deeply by
          working through how drafting, revision history, and public delivery
          fit together in one platform.
        </p>
      </section>

      <section className="mt-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--app-muted)]">
          Product Surface
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--app-muted)]">
          <li>
            <span className="text-[var(--app-foreground)] font-semibold">
              Public portfolio surface
            </span>{" "}
            designed for fast review, focused storytelling, and clear navigation
            around selected engineering work.
          </li>
          <li>
            <span className="text-[var(--app-foreground)] font-semibold">
              Private editor lab
            </span>{" "}
            at <code>/documents</code> for authenticated drafting, editing, and
            revision-history workflows before content moves into public view.
          </li>
          <li>
            <span className="text-[var(--app-foreground)] font-semibold">
              Revision-aware authoring model
            </span>{" "}
            that preserves document history instead of relying on overwrite-only
            editing, making iteration safer and future publishing flows easier
            to support.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--app-muted)]">
          Technical Decisions
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--app-muted)]">
          <li>
            <span className="text-[var(--app-foreground)] font-semibold">
              Next.js App Router + Route Handlers
            </span>{" "}
            to keep rendering and mutation paths in one application surface and
            reduce coordination overhead as the platform evolves.
          </li>
          <li>
            <span className="text-[var(--app-foreground)] font-semibold">
              Clerk authentication boundaries
            </span>{" "}
            to isolate private editing and API mutation flows while keeping the
            public portfolio simple and accessible.
          </li>
          <li>
            <span className="text-[var(--app-foreground)] font-semibold">
              Prisma + PostgreSQL persistence
            </span>{" "}
            for predictable data access, durable revision storage, and a content
            model that can support future workflow expansion.
          </li>
          <li>
            <span className="text-[var(--app-foreground)] font-semibold">
              Zod request validation
            </span>{" "}
            to enforce consistent mutation contracts and fail fast when requests
            do not match expected input.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--app-muted)]">
          Current Outcomes
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--app-muted)]">
          <li>
            The public portfolio stays focused because drafting and editing
            happen in a separate authenticated surface.
          </li>
          <li>
            The platform now supports revision-preserving authoring instead of
            overwrite-only content updates.
          </li>
          <li>
            One shared system foundation now supports both portfolio
            presentation and ongoing publishing-workflow experimentation.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--app-muted)]">
          Next Milestones
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-7 text-[var(--app-muted)]">
          <li>
            Harden the publishing workflow with slug conflict guidance,
            publish previews, and clearer status transitions.
          </li>
          <li>
            Expand blog and project presentation templates while keeping one
            shared content model.
          </li>
          <li>
            Improve revision tooling with comparison-focused views for faster
            editorial review.
          </li>
        </ol>
      </section>
    </main>
  );
}
