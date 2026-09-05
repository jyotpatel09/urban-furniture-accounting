import { Response } from 'express';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export async function getPortalProfile(req: AuthenticatedRequest, res: Response) {
  const contactId = req.user?.contactId;
  if (!contactId) {
    return sendError(res, 'No contact associated with this user account.', 'NO_CONTACT_LINK', 400);
  }

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
  });

  if (!contact) {
    return sendError(res, 'Contact record not found.', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, contact);
}

export async function getPortalInvoices(req: AuthenticatedRequest, res: Response) {
  const contactId = req.user?.contactId;
  if (!contactId) {
    return sendError(res, 'No contact associated with this user account.', 'NO_CONTACT_LINK', 400);
  }

  const invoices = await prisma.invoice.findMany({
    where: { customerId: contactId },
    include: { items: true, payments: true },
    orderBy: { createdAt: 'desc' },
  });

  return sendSuccess(res, invoices);
}

export async function getPortalInvoiceById(req: AuthenticatedRequest, res: Response) {
  const contactId = req.user?.contactId;
  const id = String(req.params.id);

  if (!contactId) {
    return sendError(res, 'No contact associated with this user account.', 'NO_CONTACT_LINK', 400);
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id, customerId: contactId },
    include: { items: true, payments: true },
  });

  if (!invoice) {
    return sendError(res, 'Invoice not found or access denied.', 'FORBIDDEN', 403);
  }

  return sendSuccess(res, invoice);
}

export async function getPortalPayments(req: AuthenticatedRequest, res: Response) {
  const contactId = req.user?.contactId;
  if (!contactId) {
    return sendError(res, 'No contact associated with this user account.', 'NO_CONTACT_LINK', 400);
  }

  const payments = await prisma.payment.findMany({
    where: { customerId: contactId },
    orderBy: { createdAt: 'desc' },
  });

  return sendSuccess(res, payments);
}
