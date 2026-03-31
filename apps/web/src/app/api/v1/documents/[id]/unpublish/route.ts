import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { isPublisher } from "@/lib/publisher-auth";
import {
  forbiddenResponse,
  internalServerErrorResponse,
  unauthorizedResponse,
} from "../../../responses";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function notFoundResponse() {
  return NextResponse.json(
    {
      error: { code: "DOCUMENT_NOT_FOUND", message: "Document not found" },
    },
    { status: 404 },
  );
}

export async function PATCH(_request: Request, context: DocumentParams) {
  const { userId } = await auth();

  if (!userId) {
    return unauthorizedResponse();
  }

  if (!isPublisher(userId)) {
    return forbiddenResponse("You are not allowed to unpublish documents");
  }

  const parsedId = await getDocumentId(context);

  if (!parsedId.success) {
    return invalidDocumentIdResponse();
  }

  const { id } = parsedId.data;

  try {
    const document = await prisma.document.findFirst({
      where: { id, ownerId: userId },
    });

    if (!document) {
      return notFoundResponse();
    }

    const updated = await prisma.document.update({
      where: { id },
      data: { status: "DRAFT" },
      include: { latestRevision: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Failed to unpublish document ${id}`, error);
    return internalServerErrorResponse("Failed to unpublish document");
  }
}
