import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const createJournalSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  type: z.enum(['SALES', 'PURCHASE', 'BANK', 'CASH', 'GENERAL']),
  defaultAccountId: z.string().optional(),
});

export async function getJournals(req: Request, res: Response) {
  const journals = await prisma.journal.findMany({
    where: { isActive: true },
    include: { defaultAccount: true },
    orderBy: { code: 'asc' },
  });
  return sendSuccess(res, journals);
}

export async function getJournalById(req: Request, res: Response) {
  const id = String(req.params.id);
  const journal = await prisma.journal.findUnique({
    where: { id },
    include: { defaultAccount: true },
  });
  if (!journal) {
    return sendError(res, 'Journal not found', 'NOT_FOUND', 404);
  }
  return sendSuccess(res, journal);
}

export async function createJournal(req: Request, res: Response) {
  const data = req.body;
  const existing = await prisma.journal.findUnique({ where: { code: data.code } });
  if (existing) {
    return sendError(res, 'Journal code already exists', 'CODE_EXISTS', 400);
  }
  const journal = await prisma.journal.create({ data });
  return sendSuccess(res, journal, 'Journal created successfully.', 201);
}

export async function updateJournal(req: Request, res: Response) {
  const id = String(req.params.id);
  const data = req.body;
  const updated = await prisma.journal.update({ where: { id }, data });
  return sendSuccess(res, updated, 'Journal updated successfully.');
}
