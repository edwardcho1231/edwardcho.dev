"use client";

import { createContext, useContext, useState } from "react";
import { createDemoDocumentWorkspaceAdapter } from "@/app/documents/demo-workspace-adapter";
import { type DocumentWorkspaceAdapter } from "@/app/documents/workspace-adapter";

const DemoDocumentWorkspaceContext =
  createContext<DocumentWorkspaceAdapter | null>(null);

export function DemoDocumentWorkspaceProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [adapter] = useState(() => createDemoDocumentWorkspaceAdapter());

  return (
    <DemoDocumentWorkspaceContext.Provider value={adapter}>
      {children}
    </DemoDocumentWorkspaceContext.Provider>
  );
}

export function useDemoDocumentWorkspaceAdapter() {
  const adapter = useContext(DemoDocumentWorkspaceContext);

  if (!adapter) {
    throw new Error("Demo document workspace adapter is unavailable");
  }

  return adapter;
}
