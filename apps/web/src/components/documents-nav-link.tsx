"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

type DocumentsAccessResponse = {
  isPublisher: boolean;
};

export function DocumentsNavLink() {
  const { isLoaded, isSignedIn } = useAuth();
  const [canAccessDocuments, setCanAccessDocuments] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setCanAccessDocuments(false);
      return;
    }

    let isCancelled = false;

    const loadAccess = async () => {
      try {
        const response = await fetch("/api/v1/documents/access", {
          method: "GET",
        });

        if (!response.ok) {
          if (!isCancelled) {
            setCanAccessDocuments(false);
          }
          return;
        }

        const payload = (await response.json()) as DocumentsAccessResponse;

        if (!isCancelled) {
          setCanAccessDocuments(payload.isPublisher);
        }
      } catch {
        if (!isCancelled) {
          setCanAccessDocuments(false);
        }
      }
    };

    loadAccess();

    return () => {
      isCancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  if (!canAccessDocuments) {
    return null;
  }

  return (
    <Link
      href="/documents"
      className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)] transition-colors hover:text-[var(--app-link-hover)]"
    >
      Documents
    </Link>
  );
}
