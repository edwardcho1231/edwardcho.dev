import { Router } from "express";
import { z } from "zod";
import { prisma } from "@repo/db";

const createDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
});

const deleteDocumentSchema = z.object({
  id: z.string().uuid("Invalid document ID"),
});

export const documentRouter = Router();

documentRouter.get("/", async (req, res) => {
  const userId = res.locals.userId;

  const documents = await prisma.document.findMany({
    where: { ownerId: userId },
    include: { latestRevision: true },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ userId, documents });
});

documentRouter.delete('/:id', async (req, res) => {
  const parsed = deleteDocumentSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(400).json({ error: { code: 'INVALID_DOCUMENT_ID', message: 'Invalid document ID' } });
  }

  const deleted = await prisma.document.deleteMany({
    where: { id: parsed.data.id, ownerId: res.locals.userId },
  });

  if (deleted.count === 0) {
    return res.status(404).json({
      error: { code: "DOCUMENT_NOT_FOUND", message: "Document not found" },
    });
  }

  return res.sendStatus(204);
});

documentRouter.post('/', async (req, res) => {
  const userId = res.locals.userId;

  const parsed = createDocumentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: { code: 'INVALID_DOCUMENT_DATA', message: 'Invalid document data' } });
  }

  const { title, content } = parsed.data;

  const created = await prisma.$transaction(async (tx: typeof prisma) => {
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

    const updated = await tx.document.update({
      where: { id: document.id },
      data: { latestRevisionId: revision.id },
      include: { latestRevision: true },
    });

    return updated;
  });

  return res.status(201).json(created);
});
