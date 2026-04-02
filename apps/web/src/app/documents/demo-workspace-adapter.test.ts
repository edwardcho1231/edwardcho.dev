import { describe, expect, it, vi } from "vitest";
import { createDemoDocumentWorkspaceAdapter } from "./demo-workspace-adapter";

describe("demo document workspace adapter", () => {
  it("loads seeded documents and exposes published state", async () => {
    const adapter = createDemoDocumentWorkspaceAdapter();

    const payload = await adapter.loadDocuments();

    expect(payload.isPublisher).toBe(true);
    expect(payload.documents).toHaveLength(2);
    expect(payload.documents.some((document) => document.status === "PUBLISHED")).toBe(true);
  });

  it("creates a new revision when updating a document", async () => {
    const adapter = createDemoDocumentWorkspaceAdapter();
    const payload = await adapter.loadDocuments();
    const document = payload.documents[0];

    await adapter.updateDocument(document.id, {
      title: "Updated title",
      content: "Updated content",
    });

    const revisions = await adapter.loadRevisions(document.id);
    expect(revisions[0]?.revisionNumber).toBeGreaterThan(1);
    expect(revisions[0]?.title).toBe("Updated title");
  });

  it("creates new draft documents in memory", async () => {
    const adapter = createDemoDocumentWorkspaceAdapter();

    const created = await adapter.createDocument({
      title: "New demo draft",
      content: "Draft content",
    });

    expect(created.status).toBe("DRAFT");
    expect(created.latestRevision?.revisionNumber).toBe(1);

    const payload = await adapter.loadDocuments();
    expect(payload.documents.some((document) => document.id === created.id)).toBe(true);
  });

  it("rejects empty trimmed document content when creating or updating", async () => {
    const adapter = createDemoDocumentWorkspaceAdapter();
    const payload = await adapter.loadDocuments();

    await expect(
      adapter.createDocument({
        title: "   ",
        content: "Draft content",
      }),
    ).rejects.toThrow("Invalid document data");

    await expect(
      adapter.updateDocument(payload.documents[0]!.id, {
        title: "Updated title",
        content: "   ",
      }),
    ).rejects.toThrow("Invalid document data");
  });

  it("rejects publish when another published document already uses the same slug and kind", async () => {
    const adapter = createDemoDocumentWorkspaceAdapter();
    const created = await adapter.createDocument({
      title: "Conflicting draft",
      content: "Draft content",
    });

    await expect(
      adapter.publishDocument(created.id, {
        kind: "PROJECT",
        slug: "editor-workflow-demo",
      }),
    ).rejects.toThrow("Slug is already in use for this kind");
  });

  it("rejects invalid publish payloads", async () => {
    const adapter = createDemoDocumentWorkspaceAdapter();
    const created = await adapter.createDocument({
      title: "Valid draft",
      content: "Draft content",
    });

    await expect(
      adapter.publishDocument(created.id, {
        kind: "BLOG",
        slug: "not valid",
      }),
    ).rejects.toThrow("Invalid publish data");

    await expect(
      adapter.publishDocument(created.id, {
        kind: "BLOG",
        slug: "valid-slug",
        excerpt: "x".repeat(301),
      }),
    ).rejects.toThrow("Invalid publish data");
  });

  it("simulates image uploads with object URLs", async () => {
    const createObjectUrl = vi.fn(() => "blob:demo-image");
    const adapter = createDemoDocumentWorkspaceAdapter(undefined, createObjectUrl);
    const payload = await adapter.loadDocuments();
    const file = new File(["demo"], "Flow Diagram.png", { type: "image/png" });

    const uploaded = await adapter.uploadImage(payload.documents[0]!.id, file);

    expect(createObjectUrl).toHaveBeenCalledWith(file);
    expect(uploaded).toEqual({
      url: "blob:demo-image",
      pathname: expect.stringContaining("/flow-diagram.png"),
    });
  });
});
