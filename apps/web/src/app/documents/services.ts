import {
  type CreateDocumentPayload,
  type PublishDocumentPayload,
  type UpdateDocumentPayload,
} from "./payload-types";
import {
  type DocumentsResponseDto,
  type DocumentDto,
  type DocumentRevisionsResponseDto,
} from "@/types/documents";

type ApiError = {
  error?: {
    message?: string;
  };
};

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function requestWithApi<T>(input: string, init: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1/${input}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const payload = await readJsonSafely(response);
  const message = (payload as ApiError).error?.message;

  if (!response.ok) {
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return payload as T;
}

export async function fetchDocuments(): Promise<DocumentsResponseDto> {
  return requestWithApi<DocumentsResponseDto>("documents", {
    method: "GET",
  });
}

export async function createDocument(payload: CreateDocumentPayload): Promise<DocumentDto> {
  return requestWithApi<DocumentDto>("documents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDocument(
  documentId: string,
  payload: UpdateDocumentPayload,
): Promise<DocumentDto> {
  return requestWithApi<DocumentDto>(`documents/${encodeURIComponent(documentId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteDocument(documentId: string): Promise<void> {
  return requestWithApi<void>(`documents/${encodeURIComponent(documentId)}`, {
    method: "DELETE",
  });
}

export async function fetchDocumentRevisions(
  documentId: string,
): Promise<DocumentRevisionsResponseDto["revisions"]> {
  const payload = await requestWithApi<DocumentRevisionsResponseDto>(
    `revisions?documentId=${encodeURIComponent(documentId)}`,
    {
      method: "GET",
    },
  );

  return payload.revisions;
}

export async function publishDocument(
  documentId: string,
  payload: PublishDocumentPayload,
): Promise<DocumentDto> {
  return requestWithApi<DocumentDto>(`documents/${encodeURIComponent(documentId)}/publish`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function unpublishDocument(documentId: string): Promise<DocumentDto> {
  return requestWithApi<DocumentDto>(`documents/${encodeURIComponent(documentId)}/unpublish`, {
    method: "PATCH",
  });
}
