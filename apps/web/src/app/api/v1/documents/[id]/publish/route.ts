import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, TransactionClient } from "@repo/db";
import { isPublisher } from "@/lib/publisher-auth";
import {
  forbiddenResponse,
  internalServerErrorResponse,
  unauthorizedResponse,
} from "../../../responses";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const publishDocumentSchema = z.object({
  kind: z.enum(["BLOG", "PROJECT"]),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug format is invalid"),
  excerpt: z.string().trim().max(300, "Excerpt is too long").optional(),
});

const documentIdSchema = z.object({
  id: z.uuid("Invalid document ID"),
});

type DocumentParams = { params: { id: string } | Promise<{ id: string }> };

async function getDocumentId(context: DocumentParams) {
  const params = await context.params;
  return documentIdSchema.safeParse(params);
}

function invalidDocumentIdResponse() {
  return NextResponse.json(
    {
      error: { code: "INVALID_DOCUMENT_ID", message: "Invalid document ID" },
    },
    { status: 400 },
  );
}

function invalidPublishDataResponse() {
  return NextResponse.json(
    {
      error: { code: "INVALID_PUBLISH_DATA", message: "Invalid publish data" },
    },
    { status: 400 },
  );
}

function slugConflictResponse() {
  return NextResponse.json(
    {
      error: {
        code: "SLUG_CONFLICT",
        message: "Slug is already in use for this kind",
      },
    },
    { status: 409 },
  );
}

function notFoundResponse() {
  return NextResponse.json(
    {
      error: { code: "DOCUMENT_NOT_FOUND", message: "Document not found" },
    },
    { status: 404 },
  );
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function PATCH(request: Request, context: DocumentParams) {
  const { userId } = await auth();

  if (!userId) {
    return unauthorizedResponse();
  }

  if (!isPublisher(userId)) {
    return forbiddenResponse("You are not allowed to publish documents");
  }

  const parsedId = await getDocumentId(context);

  if (!parsedId.success) {
    return invalidDocumentIdResponse();
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return invalidPublishDataResponse();
  }

  const parsedPayload = publishDocumentSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return invalidPublishDataResponse();
  }

  const { id } = parsedId.data;
  const kind = parsedPayload.data.kind;
  const slug = parsedPayload.data.slug.trim().toLowerCase();
  const excerpt = parsedPayload.data.excerpt?.trim();

  try {
    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      const document = await tx.document.findFirst({
        where: { id, ownerId: userId },
      });

      if (!document) {
        return { type: "not-found" } as const;
      }

      const conflicting = await tx.document.findFirst({
        where: {
          id: { not: id },
          kind,
          slug,
          status: "PUBLISHED",
        },
      });

      if (conflicting) {
        return { type: "slug-conflict" } as const;
      }

      const updated = await tx.document.update({
        where: { id },
        data: {
          kind,
          slug,
          excerpt: excerpt && excerpt.length > 0 ? excerpt : null,
          status: "PUBLISHED",
          publishedAt: document.publishedAt ?? new Date(),
        },
        include: { latestRevision: true },
      });

      return { type: "ok", document: updated } as const;
    });

    if (result.type === "not-found") {
      return notFoundResponse();
    }

    if (result.type === "slug-conflict") {
      return slugConflictResponse();
    }

    return NextResponse.json(result.document);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return slugConflictResponse();
    }
    console.error(`Failed to publish document ${id}`, error);
    return internalServerErrorResponse("Failed to publish document");
  }
}
