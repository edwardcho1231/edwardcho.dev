import Link from "next/link";
import { AuthNavControls } from "./auth-nav-controls";
import { DocumentsNavLink } from "./documents-nav-link";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-10 h-16 border-b border-[var(--app-border)] bg-[var(--app-surface)]/75 backdrop-blur">
      <div className="mx-auto w-full flex h-full items-center px-5">
        <div className="flex h-10 w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              aria-label="Go to home"
              className="flex h-10 w-10 items-center justify-center text-[var(--app-muted)] transition-colors hover:text-[var(--app-link-hover)]"
            >
              <i
                aria-hidden="true"
                className="fa-solid fa-house text-sm leading-none"
              />
            </Link>
            <Link
              href="/about"
              className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)] transition-colors hover:text-[var(--app-link-hover)]"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)] transition-colors hover:text-[var(--app-link-hover)]"
            >
              Blog
            </Link>
            <Link
              href="/projects"
              className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)] transition-colors hover:text-[var(--app-link-hover)]"
            >
              Projects
            </Link>
            <DocumentsNavLink />
          </div>
          <AuthNavControls />
        </div>
      </div>
    </header>
  );
}
