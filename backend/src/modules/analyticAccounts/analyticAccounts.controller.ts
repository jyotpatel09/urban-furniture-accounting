import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const createAnalyticAccountSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  responsible: z.string().min(2),
  company: z.string().optional().default('Urban Furniture'),
});

export async function getAnalyticAccounts(req: Request, res: Response) {
  const accounts = await prisma.analyticAccount.findMany({ where: { isActive: true } });
  return sendSuccess(res, accounts);
}

export async function createAnalyticAccount(req: Request, res: Response) {
  const data = req.body;
  const existing = await prisma.analyticAccount.findUnique({ where: { code: data.code } });
  if (existing) {
    return sendError(res, 'Analytic account code already exists', 'CODE_EXISTS', 400);
  }
  const account = await prisma.analyticAccount.create({ data });
  return sendSuccess(res, account, 'Analytic account created successfully.', 201);
}
