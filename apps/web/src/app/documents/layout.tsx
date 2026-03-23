import { ClerkProvider } from "@clerk/nextjs";
import { SiteNav } from "../../components/site-nav";
import { DocumentsAuthGate } from "./components/documents-auth-gate";

export default function DocumentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <SiteNav showAuthControls />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <DocumentsAuthGate>{children}</DocumentsAuthGate>
      </div>
    </ClerkProvider>
  );
}
