import { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { sendPaginated } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';

export async function getGeneralLedger(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const accountId = req.query.accountId ? String(req.query.accountId) : undefined;
  const journalId = req.query.journalId ? String(req.query.journalId) : undefined;
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : new Date('2026-01-01');
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : new Date();

  const where: any = {
    journalEntry: {
      status: 'POSTED',
      date: { gte: startDate, lte: endDate },
    },
  };

  if (accountId) where.accountId = accountId;
  if (journalId) where.journalEntry.journalId = journalId;

  const [total, lines] = await Promise.all([
    prisma.journalEntryLine.count({ where }),
    prisma.journalEntryLine.findMany({
      where,
      skip,
      take: limit,
      include: {
        account: true,
        journalEntry: {
          include: { journal: true },
        },
      },
      orderBy: { journalEntry: { date: 'asc' } },
    }),
  ]);

  let runningBalance = 0;
  const ledgerItems = lines.map((line) => {
    const debit = Number(line.debit);
    const credit = Number(line.credit);
    runningBalance += debit - credit;

    return {
      id: line.id,
      date: line.journalEntry.date,
      journalEntryNumber: line.journalEntry.number,
      journalName: line.journalEntry.journal.name,
      reference: line.journalEntry.reference,
      accountCode: line.account.code,
      accountName: line.account.name,
      accountType: line.account.type,
      description: line.description,
      debit,
      credit,
      runningBalance,
    };
  });

  const totalPages = Math.ceil(total / limit);
  return sendPaginated(res, ledgerItems, { page, limit, total, totalPages });
}
