"use client";

import { DocumentRevisionsShell } from "../../components/document-revisions-shell";
import { productionDocumentWorkspaceAdapter } from "../../workspace-adapter";

export default function DocumentRevisionsPage() {
  return (
    <DocumentRevisionsShell
      loadRevisions={productionDocumentWorkspaceAdapter.loadRevisions}
      backHref="/documents"
    />
  );
}
