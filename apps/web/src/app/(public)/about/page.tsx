import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownPreview } from "../../documents/components/markdown-preview";

export const metadata: Metadata = {
  title: "About | Edward Cho",
  description:
    "Background, experience, and delivery focus across editorial and subscription platforms.",
};

async function getAboutContent() {
  const filePath = path.join(process.cwd(), "src/content/about.md");

  try {
    return await readFile(filePath, { encoding: "utf8" });
  } catch (error) {
    console.error(`Failed to read about content at ${filePath}.`, error);
    return null;
  }
}

export default async function AboutPage() {
  const content = await getAboutContent();

  if (!content) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4.2rem)] max-w-3xl px-6 py-16">
      <p className="text-xs font-medium tracking-[0.28em] text-[var(--app-muted)] uppercase">
        About
      </p>
      <article className="mt-6">
        <MarkdownPreview content={content} className="text-base" />
      </article>
    </main>
  );
}
