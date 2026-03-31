import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, TransactionClient } from "@repo/db";
import { isPublisher } from "@/lib/publisher-auth";
import {
  internalServerErrorResponse,
  unauthorizedResponse,
} from "../responses";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const createDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
});

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

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return unauthorizedResponse();
  }

  const documents = await prisma.document.findMany({
    where: { ownerId: userId },
    include: { latestRevision: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    userId,
    isPublisher: isPublisher(userId),
    documents,
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return unauthorizedResponse();
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return invalidDocumentDataResponse();
  }

  const parsed = createDocumentSchema.safeParse(payload);

  if (!parsed.success) {
    return invalidDocumentDataResponse();
  }

  const { title, content } = parsed.data;

  try {
    const created = await prisma.$transaction(async (tx: TransactionClient) => {
      const document = await tx.document.create({
        data: {
          ownerId: userId,
        },
      });

      const revision = await tx.revision.create({
        data: {
          documentId: document.id,
          revisionNumber: 1,
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

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create document", error);
    return internalServerErrorResponse("Failed to create document");
  }
}
