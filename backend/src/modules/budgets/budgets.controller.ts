import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const createBudgetSchema = z.object({
  name: z.string().min(2),
  period: z.string().min(2),
  periodStart: z.string().or(z.date()),
  periodEnd: z.string().or(z.date()),
  responsible: z.string().min(2),
  analyticAccountId: z.string().min(1),
  plannedAmount: z.number().positive(),
});

export async function getBudgets(req: Request, res: Response) {
  const budgets = await prisma.budget.findMany({
    include: { analyticAccount: true },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate actual achieved amount live from posted journal lines tagged with the analytic account
  const updatedBudgets = await Promise.all(
    budgets.map(async (budget) => {
      const journalLines = await prisma.journalEntryLine.findMany({
        where: {
          analyticAccountId: budget.analyticAccountId,
          journalEntry: {
            status: 'POSTED',
            date: {
              gte: new Date(budget.periodStart),
              lte: new Date(budget.periodEnd),
            },
          },
        },
        select: { debit: true, credit: true },
      });

      let achieved = 0;
      for (const line of journalLines) {
        achieved += Number(line.debit);
      }

      const planned = Number(budget.plannedAmount);
      const remaining = Math.max(0, planned - achieved);
      const utilization = planned > 0 ? Math.round((achieved / planned) * 100) : 0;

      return {
        ...budget,
        achievedAmount: achieved,
        remainingAmount: remaining,
        utilization,
        variance: planned - achieved,
      };
    })
  );

  return sendSuccess(res, updatedBudgets);
}

export async function getBudgetById(req: Request, res: Response) {
  const id = String(req.params.id);
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { analyticAccount: true },
  });

  if (!budget) {
    return sendError(res, 'Budget not found', 'NOT_FOUND', 404);
  }

  const journalLines = await prisma.journalEntryLine.findMany({
    where: {
      analyticAccountId: budget.analyticAccountId,
      journalEntry: {
        status: 'POSTED',
        date: {
          gte: new Date(budget.periodStart),
          lte: new Date(budget.periodEnd),
        },
      },
    },
    include: {
      account: true,
      journalEntry: { select: { number: true, date: true, reference: true } },
    },
  });

  let achieved = 0;
  for (const line of journalLines) {
    achieved += Number(line.debit);
  }

  const planned = Number(budget.plannedAmount);
  const remaining = Math.max(0, planned - achieved);
  const utilization = planned > 0 ? Math.round((achieved / planned) * 100) : 0;

  return sendSuccess(res, {
    ...budget,
    achievedAmount: achieved,
    remainingAmount: remaining,
    utilization,
    variance: planned - achieved,
    transactions: journalLines,
  });
}

export async function createBudget(req: Request, res: Response) {
  const data = req.body;
  const periodStart = new Date(data.periodStart);
  const periodEnd = new Date(data.periodEnd);

  const budget = await prisma.budget.create({
    data: {
      ...data,
      periodStart,
      periodEnd,
      remainingAmount: data.plannedAmount,
    },
  });

  return sendSuccess(res, budget, 'Budget created successfully.', 201);
}
