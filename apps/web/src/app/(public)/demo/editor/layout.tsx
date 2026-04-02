import { DemoDocumentWorkspaceProvider } from "./demo-document-workspace-provider";

export default function DemoEditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DemoDocumentWorkspaceProvider>{children}</DemoDocumentWorkspaceProvider>;
}
