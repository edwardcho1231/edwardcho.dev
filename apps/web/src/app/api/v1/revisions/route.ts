import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import {
  internalServerErrorResponse,
  unauthorizedResponse,
} from "../responses";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  documentId: z.uuid("Invalid document ID"),
});

function invalidDocumentIdResponse() {
  return NextResponse.json(
    {
      error: { code: "INVALID_DOCUMENT_ID", message: "A valid document ID is required" },
    },
    { status: 400 },
  );
}

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ documentId: searchParams.get("documentId") });

  if (!parsed.success) {
    return invalidDocumentIdResponse();
  }

  try {
    const revisions = await prisma.revision.findMany({
      where: {
        documentId: parsed.data.documentId,
        document: {
          ownerId: userId,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ revisions });
  } catch (_error) {
    return internalServerErrorResponse("Unable to load revisions");
  }
}
