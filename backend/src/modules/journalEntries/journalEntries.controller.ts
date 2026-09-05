import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';
import { formatDocumentNumber, assertJournalBalanced } from '../../utils/accounting.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export const journalLineSchema = z.object({
  accountId: z.string().min(1),
  description: z.string().optional(),
  debit: z.number().nonnegative(),
  credit: z.number().nonnegative(),
  analyticAccountId: z.string().optional(),
});

export const createJournalEntrySchema = z.object({
  journalId: z.string().min(1),
  date: z.string().or(z.date()).optional().default(() => new Date()),
  reference: z.string().optional(),
  lines: z.array(journalLineSchema).min(2),
});

export async function getJournalEntries(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const journalId = req.query.journalId ? String(req.query.journalId) : undefined;
  const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;
  const search = req.query.search ? String(req.query.search).trim() : '';

  const where: any = {};
  if (journalId) where.journalId = journalId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { reference: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, entries] = await Promise.all([
    prisma.journalEntry.count({ where }),
    prisma.journalEntry.findMany({
      where,
      skip,
      take: limit,
      include: {
        journal: true,
        lines: { include: { account: true, analyticAccount: true } },
      },
      orderBy: { date: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return sendPaginated(res, entries, { page, limit, total, totalPages });
}

export async function getJournalEntryById(req: Request, res: Response) {
  const id = String(req.params.id);
  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    include: {
      journal: true,
      lines: { include: { account: true, analyticAccount: true } },
    },
  });

  if (!entry) {
    return sendError(res, 'Journal entry not found', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, entry);
}

export async function createJournalEntry(req: AuthenticatedRequest, res: Response) {
  const { journalId, date, reference, lines } = req.body;
  const userId = req.user!.userId;

  const journal = await prisma.journal.findUnique({ where: { id: journalId } });
  if (!journal) {
    return sendError(res, 'Journal not found', 'NOT_FOUND', 404);
  }

  // Validate double-entry balance: Debit MUST equal Credit
  const { totalDebit, totalCredit } = assertJournalBalanced(lines);

  const count = await prisma.journalEntry.count();
  const number = formatDocumentNumber('JE', count);

  const result = await prisma.$transaction(async (tx) => {
    const entry = await tx.journalEntry.create({
      data: {
        number,
        journalId,
        date: new Date(date),
        reference,
        status: 'POSTED',
        totalDebit,
        totalCredit,
        createdById: userId,
        lines: {
          create: lines,
        },
      },
      include: {
        journal: true,
        lines: { include: { account: true } },
      },
    });

    // Update account balances
    for (const line of lines) {
      const net = line.debit - line.credit;
      await tx.account.update({
        where: { id: line.accountId },
        data: { balance: { increment: net } },
      });
    }

    return entry;
  });

  return sendSuccess(res, result, `Journal Entry ${number} created and POSTED successfully.`, 201);
}

export async function cancelJournalEntry(req: Request, res: Response) {
  const id = String(req.params.id);

  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    include: { lines: true },
  });

  if (!entry) {
    return sendError(res, 'Journal entry not found', 'NOT_FOUND', 404);
  }

  if (entry.status === 'CANCELLED') {
    return sendError(res, 'Journal entry is already cancelled.', 'ALREADY_CANCELLED', 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    // Reverse account balances
    for (const line of entry.lines) {
      const net = Number(line.debit) - Number(line.credit);
      await tx.account.update({
        where: { id: line.accountId },
        data: { balance: { decrement: net } },
      });
    }

    const cancelled = await tx.journalEntry.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return cancelled;
  });

  return sendSuccess(res, result, `Journal Entry ${entry.number} cancelled.`);
}
