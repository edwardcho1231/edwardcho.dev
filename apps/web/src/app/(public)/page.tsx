import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto min-h-[calc(100vh-4.2rem)] max-w-3xl px-6 py-16">
      <section className="space-y-6">
        <p className="text-xs font-medium tracking-[0.28em] text-[var(--app-muted)] uppercase">
          Senior Software Engineer
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-[var(--app-muted)]">
            Edward Cho
          </h2>
          <span className="flex items-center gap-2">
            <a
              href="https://github.com/edwardcho1231"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
              className="inline-flex items-center justify-center text-[var(--app-muted)] transition-colors hover:text-[var(--app-link-hover)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M12 2C6.477 2 2 6.586 2 12.242c0 4.523 2.865 8.36 6.84 9.719.5.092.682-.221.682-.491 0-.242-.009-.883-.014-1.734-2.782.617-3.368-1.364-3.368-1.364-.455-1.16-1.11-1.47-1.11-1.47-.907-.626.069-.614.069-.614 1.003.071 1.531 1.049 1.531 1.049.892 1.553 2.341 1.104 2.913.844.092-.656.35-1.104.636-1.359-2.22-.254-4.555-1.126-4.555-5.017 0-1.107.39-2.011 1.029-2.72-.103-.254-.446-1.27.099-2.646 0 0 .84-.272 2.75 1.041a9.49 9.49 0 0 1 5 0c1.91-1.313 2.749-1.041 2.749-1.041.545 1.376.202 2.392.1 2.646.64.709 1.028 1.613 1.028 2.72 0 3.901-2.339 4.76-4.566 5.007.359.315.678.937.678 1.888 0 1.363-.013 2.463-.013 2.798 0 .273.18.589.688.489C19.141 20.596 22 16.762 22 12.242 22 6.586 17.523 2 12 2z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/edwardcho1231"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn profile"
              className="inline-flex items-center justify-center text-[var(--app-muted)] transition-colors hover:text-[var(--app-link-hover)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M20.45 20.452h-3.555v-5.569c0-1.327-.026-3.035-1.85-3.035-1.85 0-2.131 1.445-2.131 2.937v5.667H9.36V9h3.414v1.561h.047c.476-.9 1.637-1.848 3.37-1.848 3.601 0 4.267 2.371 4.267 5.455v6.284ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM6.98 20.452H3.69V9h3.29v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.73C24 .774 23.2 0 22.225 0Z" />
              </svg>
            </a>
          </span>
        </div>
        <h1 className="text-4xl font-semibold leading-[1.05] text-[var(--app-foreground)] sm:text-6xl">
          I build reliable software products and systems shaped by real
          tradeoffs.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--app-muted)]">
          This portfolio shows how I turn product requirements into maintainable
          systems, workflows, and public-facing software.
        </p>
      </section>

      <section className="mt-12 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)]/50 p-5">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--app-muted)]">
          PROJECT SNAPSHOT
        </p>
        <h2 className="mt-3 text-2xl font-semibold">
          edwardcho.dev is a portfolio platform and private publishing
          workbench.
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--app-muted)]">
          It demonstrates how I design revision-aware content workflows,
          authenticated editing surfaces, and API-backed publishing systems for
          public delivery.
        </p>
        <div className="mt-6">
          <Link
            href="/projects/edwardchodev-portfolio"
            className="inline-flex rounded border border-[var(--app-border)] bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--app-foreground)] transition-colors hover:border-[var(--app-link-hover)] hover:text-[var(--app-link-hover)] mr-3 "
          >
            Read Case Study
          </Link>
          <Link
            href="/documents"
            className="inline-flex rounded border border-[var(--app-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)] transition-colors hover:border-[var(--app-link-hover)] hover:text-[var(--app-link-hover)]"
          >
            Explore Editor Lab
          </Link>
        </div>
      </section>
    </main>
  );
}
