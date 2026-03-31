import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, TransactionClient } from "@repo/db";
import {
  internalServerErrorResponse,
  unauthorizedResponse,
} from "../../responses";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const updateDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
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

function invalidDocumentDataResponse() {
  return NextResponse.json(
    {
      error: {
        code: "INVALID_DOCUMENT_DATA",
        message: "Invalid document data",
      },
    },
    { status: 400 },
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

function cannotDeletePublishedResponse() {
  return NextResponse.json(
    {
      error: {
        code: "DOCUMENT_IS_PUBLISHED",
        message: "Unpublish this document before deleting it",
      },
    },
    { status: 409 },
  );
}

export async function PUT(request: Request, context: DocumentParams) {
  const { userId } = await auth();

  if (!userId) {
    return unauthorizedResponse();
  }

  const parsedId = await getDocumentId(context);

  if (!parsedId.success) {
    return invalidDocumentIdResponse();
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return invalidDocumentDataResponse();
  }

  const parsedPayload = updateDocumentSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return invalidDocumentDataResponse();
  }

  const { title, content } = parsedPayload.data;
  const { id } = parsedId.data;

  try {
    const updated = await prisma.$transaction(async (tx: TransactionClient) => {
      const document = await tx.document.findFirst({
        where: { id, ownerId: userId },
        include: { latestRevision: true },
      });

      if (!document) {
        return null;
      }

      const nextRevisionNumber = document.latestRevision?.revisionNumber
        ? document.latestRevision.revisionNumber + 1
        : 1;

      const revision = await tx.revision.create({
        data: {
          documentId: document.id,
          revisionNumber: nextRevisionNumber,
          title,
          content,
          createdBy: userId,
        },
      });

      return tx.document.update({
        where: { id: document.id },
        data: { latestRevisionId: revision.id },
        include: { latestRevision: true },
      });
    });

    if (!updated) {
      return notFoundResponse();
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Failed to update document ${id}`, error);
    return internalServerErrorResponse("Failed to update document");
  }
}

export async function DELETE(_request: Request, context: DocumentParams) {
  const { userId } = await auth();

  if (!userId) {
    return unauthorizedResponse();
  }

  const parsedId = await getDocumentId(context);

  if (!parsedId.success) {
    return invalidDocumentIdResponse();
  }

  const { id } = parsedId.data;

  try {
    const document = await prisma.document.findFirst({
      where: { id, ownerId: userId },
      select: { id: true, status: true },
    });

    if (!document) {
      return notFoundResponse();
    }

    if (document.status === "PUBLISHED") {
      return cannotDeletePublishedResponse();
    }

    const deleted = await prisma.document.deleteMany({
      where: {
        id: document.id,
        ownerId: userId,
        status: "DRAFT",
      },
    });

    if (deleted.count === 0) {
      return notFoundResponse();
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete document ${id}`, error);
    return internalServerErrorResponse("Failed to delete document");
  }
}
