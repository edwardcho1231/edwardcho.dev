import { afterEach, describe, expect, it, vi } from "vitest";
import { revalidateDocumentPaths } from "./revalidate-path";

const { revalidatePathMock } = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

afterEach(() => {
  revalidatePathMock.mockReset();
});

describe("revalidate path helpers", () => {
  it("revalidates the detail page for a blog document", () => {
    revalidateDocumentPaths({ kind: "BLOG", slug: "hello-world" });

    expect(revalidatePathMock).toHaveBeenCalledTimes(1);
    expect(revalidatePathMock).toHaveBeenNthCalledWith(1, "/blog/hello-world");
  });

  it("revalidates both old and new detail paths for a published slug change", () => {
    revalidateDocumentPaths(
      { kind: "BLOG", slug: "new-slug" },
      { kind: "BLOG", slug: "old-slug" },
    );

    expect(revalidatePathMock).toHaveBeenCalledTimes(2);
    expect(revalidatePathMock).toHaveBeenNthCalledWith(1, "/blog/old-slug");
    expect(revalidatePathMock).toHaveBeenNthCalledWith(2, "/blog/new-slug");
  });

  it("revalidates both old and new detail paths for kind changes", () => {
    revalidateDocumentPaths(
      { kind: "PROJECT", slug: "launch-post" },
      { kind: "BLOG", slug: "launch-post" },
    );

    expect(revalidatePathMock).toHaveBeenCalledTimes(2);
    expect(revalidatePathMock).toHaveBeenNthCalledWith(1, "/blog/launch-post");
    expect(revalidatePathMock).toHaveBeenNthCalledWith(
      2,
      "/projects/launch-post",
    );
  });
});
