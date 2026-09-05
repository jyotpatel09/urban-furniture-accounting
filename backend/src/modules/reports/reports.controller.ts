import { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../utils/response.js';

export async function getProfitLossReport(req: Request, res: Response) {
  const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : new Date('2026-01-01');
  const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : new Date();

  // Fetch POSTED journal entry lines in range for INCOME and EXPENSE accounts
  const lines = await prisma.journalEntryLine.findMany({
    where: {
      journalEntry: {
        status: 'POSTED',
        date: { gte: startDate, lte: endDate },
      },
      account: {
        type: { in: ['INCOME', 'EXPENSE'] },
      },
    },
    include: { account: true },
  });

  const incomeMap: Record<string, { code: string; name: string; amount: number }> = {};
  const expenseMap: Record<string, { code: string; name: string; amount: number }> = {};

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const line of lines) {
    const debit = Number(line.debit);
    const credit = Number(line.credit);
    const code = line.account.code;
    const name = line.account.name;

    if (line.account.type === 'INCOME') {
      const net = credit - debit;
      totalIncome += net;
      if (!incomeMap[code]) incomeMap[code] = { code, name, amount: 0 };
      incomeMap[code].amount += net;
    } else if (line.account.type === 'EXPENSE') {
      const net = debit - credit;
      totalExpenses += net;
      if (!expenseMap[code]) expenseMap[code] = { code, name, amount: 0 };
      expenseMap[code].amount += net;
    }
  }

  const netProfit = totalIncome - totalExpenses;

  return sendSuccess(res, {
    periodStart: startDate,
    periodEnd: endDate,
    totalIncome,
    totalExpenses,
    netProfit,
    incomeBreakdown: Object.values(incomeMap),
    expenseBreakdown: Object.values(expenseMap),
  });
}

export async function getBalanceSheetReport(req: Request, res: Response) {
  const asOfDate = req.query.asOfDate ? new Date(String(req.query.asOfDate)) : new Date();

  // Fetch all accounts
  const accounts = await prisma.account.findMany({
    where: { isArchived: false },
    include: {
      journalLines: {
        where: {
          journalEntry: {
            status: 'POSTED',
            date: { lte: asOfDate },
          },
        },
      },
    },
  });

  const assetList: any[] = [];
  const liabilityList: any[] = [];
  const capitalList: any[] = [];

  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalCapital = 0;

  for (const account of accounts) {
    let balance = 0;
    for (const line of account.journalLines) {
      const debit = Number(line.debit);
      const credit = Number(line.credit);
      balance += debit - credit;
    }

    if (account.type === 'ASSET') {
      totalAssets += balance;
      assetList.push({ code: account.code, name: account.name, balance });
    } else if (account.type === 'LIABILITY') {
      const liabilityBal = -balance;
      totalLiabilities += liabilityBal;
      liabilityList.push({ code: account.code, name: account.name, balance: liabilityBal });
    } else if (account.type === 'CAPITAL') {
      const capitalBal = -balance;
      totalCapital += capitalBal;
      capitalList.push({ code: account.code, name: account.name, balance: capitalBal });
    }
  }

  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalCapital)) < 1.0;

  return sendSuccess(res, {
    asOfDate,
    totalAssets,
    totalLiabilities,
    totalCapital,
    isBalanced,
    assets: assetList,
    liabilities: liabilityList,
    capital: capitalList,
  });
}
