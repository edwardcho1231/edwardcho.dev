"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";

export function DocumentsAuthGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="px-6 py-16">
        <p className="text-sm text-[var(--app-muted)]">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="px-6 py-16">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold">Documents</h1>
          <p className="text-sm text-[var(--app-muted)]">
            Sign in to access the editor workspace.
          </p>
          <SignInButton mode="modal">
            <button className="inline-flex rounded border border-[var(--app-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)] transition-colors hover:border-[var(--app-link-hover)] hover:text-[var(--app-link-hover)]">
              Sign in
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
