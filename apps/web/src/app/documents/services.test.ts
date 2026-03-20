import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDocument,
  deleteDocument,
  fetchDocumentRevisions,
  fetchDocuments,
  updateDocument,
} from "./services";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function textResponse(body: string, status: number) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("document services", () => {
  it("fetchDocuments calls documents endpoint and returns list", async () => {
    const documents = [
      {
        id: "doc-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
        latestRevision: null,
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ documents }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchDocuments()).resolves.toEqual(documents);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/documents",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("updateDocument URL-encodes document id", async () => {
    const encodedId = "doc%2Fwith%20space%3F";
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        id: "doc/with space?",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        latestRevision: null,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await updateDocument("doc/with space?", { title: "T", content: "C" });
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/documents/${encodedId}`,
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("fetchDocumentRevisions URL-encodes query parameter", async () => {
    const revisions = [
      {
        id: "rev-1",
        revisionNumber: 1,
        title: "t",
        content: "c",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ revisions }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchDocumentRevisions("abc/123?x=y")).resolves.toEqual(revisions);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/revisions?documentId=abc%2F123%3Fx%3Dy",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("throws API message when response body includes error message", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: { message: "Invalid document data" } }, 400));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createDocument({ title: "", content: "" })).rejects.toThrow("Invalid document data");
  });

  it("throws fallback status message when non-JSON error body is returned", async () => {
    const fetchMock = vi.fn().mockResolvedValue(textResponse("failure", 500));
    vi.stubGlobal("fetch", fetchMock);

    await expect(deleteDocument("doc-1")).rejects.toThrow("Request failed with status 500");
  });
});
