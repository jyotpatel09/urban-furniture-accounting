import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';
import { ContactType } from '@prisma/client';

export const createContactSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['CUSTOMER', 'VENDOR', 'BOTH']).default('CUSTOMER'),
  email: z.string().email(),
  phone: z.string().min(5),
  address: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(3),
  avatar: z.string().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export async function getContacts(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search ? String(req.query.search).trim() : '';
  const type = req.query.type ? (String(req.query.type).toUpperCase() as ContactType) : undefined;
  const isArchived = req.query.isArchived === 'true';

  const where: any = { isArchived };

  if (type) {
    where.type = type;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, contacts] = await Promise.all([
    prisma.contact.count({ where }),
    prisma.contact.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return sendPaginated(res, contacts, { page, limit, total, totalPages });
}

export async function getContactById(req: Request, res: Response) {
  const id = String(req.params.id);
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      salesOrders: { take: 5, orderBy: { createdAt: 'desc' } },
      invoices: { take: 5, orderBy: { createdAt: 'desc' } },
      vendorBills: { take: 5, orderBy: { createdAt: 'desc' } },
      customerPayments: { take: 5, orderBy: { createdAt: 'desc' } },
      vendorPayments: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!contact) {
    return sendError(res, 'Contact not found', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, contact);
}

export async function createContact(req: Request, res: Response) {
  const data = req.body;

  const existing = await prisma.contact.findUnique({ where: { email: data.email } });
  if (existing) {
    return sendError(res, 'A contact with this email already exists.', 'EMAIL_EXISTS', 400);
  }

  const contact = await prisma.contact.create({ data });
  return sendSuccess(res, contact, 'Contact created successfully.', 201);
}

export async function updateContact(req: Request, res: Response) {
  const id = String(req.params.id);
  const data = req.body;

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) {
    return sendError(res, 'Contact not found', 'NOT_FOUND', 404);
  }

  const updated = await prisma.contact.update({
    where: { id },
    data,
  });

  return sendSuccess(res, updated, 'Contact updated successfully.');
}

export async function archiveContact(req: Request, res: Response) {
  const id = String(req.params.id);

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) {
    return sendError(res, 'Contact not found', 'NOT_FOUND', 404);
  }

  const archived = await prisma.contact.update({
    where: { id },
    data: { isArchived: true },
  });

  return sendSuccess(res, archived, 'Contact archived successfully.');
}
