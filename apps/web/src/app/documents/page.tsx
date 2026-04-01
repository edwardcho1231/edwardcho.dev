"use client";

import { DocumentWorkspaceShell } from "./components/document-workspace-shell";
import { productionDocumentWorkspaceAdapter } from "./workspace-adapter";

function buildDocumentRevisionsHref(documentId: string) {
  return `/documents/${encodeURIComponent(documentId)}/revisions`;
}

export default function DocumentsPage() {
  return (
    <DocumentWorkspaceShell
      adapter={productionDocumentWorkspaceAdapter}
      buildRevisionsHref={buildDocumentRevisionsHref}
    />
  );
}
