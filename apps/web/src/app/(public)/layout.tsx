import { SiteNav } from "../../components/site-nav";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteNav />
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </>
  );
}
