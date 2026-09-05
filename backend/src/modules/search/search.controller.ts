import { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../utils/response.js';

export async function globalSearch(req: Request, res: Response) {
  const query = req.query.q ? String(req.query.q).trim() : '';
  if (!query || query.length < 2) {
    return sendSuccess(res, { contacts: [], products: [], invoices: [], vendorBills: [], journalEntries: [] });
  }

  const [contacts, products, invoices, vendorBills, journalEntries] = await Promise.all([
    prisma.contact.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: 'insensitive' } },
          { customer: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      take: 5,
      include: { customer: { select: { name: true } } },
    }),
    prisma.vendorBill.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: 'insensitive' } },
          { vendor: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      take: 5,
      include: { vendor: { select: { name: true } } },
    }),
    prisma.journalEntry.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: 'insensitive' } },
          { reference: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
    }),
  ]);

  return sendSuccess(res, {
    contacts,
    products,
    invoices,
    vendorBills,
    journalEntries,
  });
}
