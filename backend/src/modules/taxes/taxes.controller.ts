import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const createTaxSchema = z.object({
  name: z.string().min(2),
  rate: z.number().nonnegative(),
  type: z.string().optional().default('PERCENTAGE'),
  account: z.string().optional(),
});

export async function getTaxes(req: Request, res: Response) {
  const taxes = await prisma.tax.findMany({ where: { isActive: true } });
  return sendSuccess(res, taxes);
}

export async function createTax(req: Request, res: Response) {
  const data = req.body;
  const tax = await prisma.tax.create({ data });
  return sendSuccess(res, tax, 'Tax rate created successfully.', 201);
}
