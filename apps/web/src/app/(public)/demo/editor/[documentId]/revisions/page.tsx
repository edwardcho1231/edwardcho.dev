"use client";

import { DocumentRevisionsShell } from "@/app/documents/components/document-revisions-shell";
import { useDemoDocumentWorkspaceAdapter } from "../../demo-document-workspace-provider";

export default function DemoDocumentRevisionsPage() {
  const adapter = useDemoDocumentWorkspaceAdapter();

  return (
    <DocumentRevisionsShell
      loadRevisions={adapter.loadRevisions}
      backHref="/demo/editor"
    />
  );
}
