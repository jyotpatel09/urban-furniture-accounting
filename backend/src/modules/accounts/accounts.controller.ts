import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';
import { AccountType } from '@prisma/client';

export const createAccountSchema = z.object({
  code: z.string().min(4),
  name: z.string().min(2),
  type: z.enum(['ASSET', 'LIABILITY', 'CAPITAL', 'INCOME', 'EXPENSE']),
  category: z.string().min(2),
  parentName: z.string().optional(),
  balance: z.number().optional().default(0),
});

export const updateAccountSchema = createAccountSchema.partial();

export async function getAccounts(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search ? String(req.query.search).trim() : '';
  const type = req.query.type ? (String(req.query.type).toUpperCase() as AccountType) : undefined;
  const isArchived = req.query.isArchived === 'true';

  const where: any = { isArchived };
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, accounts] = await Promise.all([
    prisma.account.count({ where }),
    prisma.account.findMany({
      where,
      skip,
      take: limit,
      orderBy: { code: 'asc' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return sendPaginated(res, accounts, { page, limit, total, totalPages });
}

export async function getAccountById(req: Request, res: Response) {
  const id = String(req.params.id);
  const account = await prisma.account.findUnique({ where: { id } });

  if (!account) {
    return sendError(res, 'Account not found', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, account);
}

export async function createAccount(req: Request, res: Response) {
  const data = req.body;

  const existing = await prisma.account.findUnique({ where: { code: data.code } });
  if (existing) {
    return sendError(res, 'An account with this code already exists.', 'ACCOUNT_CODE_EXISTS', 400);
  }

  const account = await prisma.account.create({ data });
  return sendSuccess(res, account, 'Account created successfully.', 201);
}

export async function updateAccount(req: Request, res: Response) {
  const id = String(req.params.id);
  const data = req.body;

  const existing = await prisma.account.findUnique({ where: { id } });
  if (!existing) {
    return sendError(res, 'Account not found', 'NOT_FOUND', 404);
  }

  const updated = await prisma.account.update({
    where: { id },
    data,
  });

  return sendSuccess(res, updated, 'Account updated successfully.');
}

export async function deleteAccount(req: Request, res: Response) {
  const id = String(req.params.id);

  const existing = await prisma.account.findUnique({ where: { id } });
  if (!existing) {
    return sendError(res, 'Account not found', 'NOT_FOUND', 404);
  }

  const postedCount = await prisma.journalEntryLine.count({
    where: {
      accountId: id,
      journalEntry: { status: 'POSTED' },
    },
  });

  if (postedCount > 0) {
    return sendError(
      res,
      'Cannot delete or archive account that has posted journal items.',
      'ACCOUNT_HAS_TRANSACTIONS',
      400
    );
  }

  const archived = await prisma.account.update({
    where: { id },
    data: { isArchived: true, isActive: false },
  });

  return sendSuccess(res, archived, 'Account archived successfully.');
}

export async function getAccountLedger(req: Request, res: Response) {
  const id = String(req.params.id);
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : new Date('2026-01-01');
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : new Date();

  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) {
    return sendError(res, 'Account not found', 'NOT_FOUND', 404);
  }

  // Calculate opening balance before startDate
  const priorLines = await prisma.journalEntryLine.findMany({
    where: {
      accountId: id,
      journalEntry: {
        status: 'POSTED',
        date: { lt: startDate },
      },
    },
    select: { debit: true, credit: true },
  });

  let openingBalance = 0;
  for (const line of priorLines) {
    openingBalance += Number(line.debit) - Number(line.credit);
  }

  // Fetch transactions within date range
  const periodLines = await prisma.journalEntryLine.findMany({
    where: {
      accountId: id,
      journalEntry: {
        status: 'POSTED',
        date: { gte: startDate, lte: endDate },
      },
    },
    include: {
      journalEntry: {
        select: {
          number: true,
          date: true,
          reference: true,
          journal: { select: { name: true, code: true } },
        },
      },
    },
    orderBy: { journalEntry: { date: 'asc' } },
  });

  let runningBalance = openingBalance;
  const transactions = periodLines.map((line) => {
    const debit = Number(line.debit);
    const credit = Number(line.credit);
    runningBalance += debit - credit;

    return {
      id: line.id,
      date: line.journalEntry.date,
      entryNumber: line.journalEntry.number,
      journal: line.journalEntry.journal.name,
      reference: line.journalEntry.reference,
      description: line.description,
      debit,
      credit,
      runningBalance,
    };
  });

  return sendSuccess(res, {
    account,
    openingBalance,
    closingBalance: runningBalance,
    transactions,
  });
}
