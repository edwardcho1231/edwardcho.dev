"use client";

import { DocumentWorkspaceShell } from "@/app/documents/components/document-workspace-shell";
import { useDemoDocumentWorkspaceAdapter } from "./demo-document-workspace-provider";

function buildDemoRevisionsHref(documentId: string) {
  return `/demo/editor/${encodeURIComponent(documentId)}/revisions`;
}

export default function DemoEditorPage() {
  const adapter = useDemoDocumentWorkspaceAdapter();

  return (
    <DocumentWorkspaceShell
      adapter={adapter}
      title="Editor Demo"
      description="This public demo uses seeded sample content. Changes stay in this session and reset on refresh."
      documentsHeading="Demo Documents"
      buildRevisionsHref={buildDemoRevisionsHref}
    />
  );
}
