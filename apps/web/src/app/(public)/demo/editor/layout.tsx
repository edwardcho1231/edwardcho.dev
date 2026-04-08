import type { Metadata } from "next";
import { DemoDocumentWorkspaceProvider } from "./demo-document-workspace-provider";
import { demoEditorMetadata } from "@/lib/seo";

export const metadata: Metadata = demoEditorMetadata;

export default function DemoEditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DemoDocumentWorkspaceProvider>{children}</DemoDocumentWorkspaceProvider>;
}
