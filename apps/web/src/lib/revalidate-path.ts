import { revalidatePath } from "next/cache";

export type PublicDocumentRef = {
  kind: "BLOG" | "PROJECT";
  slug: string;
};

function addDocumentPaths(
  paths: Set<string>,
  ref: PublicDocumentRef | null | undefined,
) {
  if (!ref) {
    return;
  }

  if (ref.kind === "BLOG") {
    paths.add(`/blog/${ref.slug}`);
    return;
  }

  paths.add(`/projects/${ref.slug}`);
}

export function revalidateDocumentPaths(
  current: PublicDocumentRef,
  previous?: PublicDocumentRef | null,
) {
  const paths = new Set<string>();

  addDocumentPaths(paths, previous);
  addDocumentPaths(paths, current);

  for (const path of paths) {
    revalidatePath(path);
  }
}
