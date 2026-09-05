import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';
import { formatDocumentNumber, assertJournalBalanced } from '../../utils/accounting.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export const invoiceItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  taxRate: z.number().nonnegative().default(18),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1),
  salesOrderId: z.string().optional(),
  invoiceDate: z.string().or(z.date()).optional().default(() => new Date()),
  dueDate: z.string().or(z.date()).optional().default(() => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)),
  items: z.array(invoiceItemSchema).min(1),
});

export async function getInvoices(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const customerId = req.query.customerId ? String(req.query.customerId) : undefined;
  const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;

  const where: any = {};
  if (customerId) where.customerId = customerId;
  if (status) where.status = status;

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
        payments: true,
        journalEntry: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return sendPaginated(res, invoices, { page, limit, total, totalPages });
}

export async function getInvoiceById(req: Request, res: Response) {
  const id = String(req.params.id);
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
      payments: true,
      journalEntry: { include: { lines: { include: { account: true } } } },
    },
  });

  if (!invoice) {
    return sendError(res, 'Invoice not found', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, invoice);
}

export async function createInvoice(req: AuthenticatedRequest, res: Response) {
  const { customerId, salesOrderId, invoiceDate, dueDate, items } = req.body;
  const userId = req.user!.userId;

  const customer = await prisma.contact.findUnique({ where: { id: customerId } });
  if (!customer) {
    return sendError(res, 'Customer not found', 'NOT_FOUND', 404);
  }

  let subtotal = 0;
  let taxAmount = 0;

  const processedItems = items.map((item: any) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    const lineTax = (lineSubtotal * item.taxRate) / 100;
    const lineTotal = lineSubtotal + lineTax;

    subtotal += lineSubtotal;
    taxAmount += lineTax;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      taxAmount: lineTax,
      lineSubtotal,
      lineTotal,
    };
  });

  const totalAmount = subtotal + taxAmount;

  const count = await prisma.invoice.count();
  const number = formatDocumentNumber('INV', count);

  const invoice = await prisma.invoice.create({
    data: {
      number,
      customerId,
      salesOrderId: salesOrderId || null,
      invoiceDate: new Date(invoiceDate),
      dueDate: new Date(dueDate),
      status: 'DRAFT',
      subtotal,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      createdById: userId,
      items: {
        create: processedItems,
      },
    },
    include: {
      customer: true,
      items: true,
    },
  });

  return sendSuccess(res, invoice, 'Customer invoice created in DRAFT state.', 201);
}

export async function postInvoice(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  const userId = req.user!.userId;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });

  if (!invoice) {
    return sendError(res, 'Invoice not found', 'NOT_FOUND', 404);
  }

  if (invoice.status !== 'DRAFT') {
    return sendError(res, `Invoice is already in ${invoice.status} state.`, 'INVALID_STATUS', 400);
  }

  // Find Sales Journal & Chart of Accounts
  const salesJournal = await prisma.journal.findFirst({ where: { type: 'SALES', isActive: true } });
  const debtorsAccount = await prisma.account.findFirst({ where: { code: '103000' } });
  const salesIncomeAccount = await prisma.account.findFirst({ where: { code: '401000' } });
  const gstPayableAccount = await prisma.account.findFirst({ where: { code: '202000' } });

  if (!salesJournal || !debtorsAccount || !salesIncomeAccount || !gstPayableAccount) {
    return sendError(
      res,
      'Required accounting setup missing (Sales Journal, Debtors 103000, Sales Income 401000, or GST Payable 202000).',
      'ACCOUNTING_SETUP_MISSING',
      400
    );
  }

  const totalAmount = Number(invoice.totalAmount);
  const subtotal = Number(invoice.subtotal);
  const taxAmount = Number(invoice.taxAmount);

  // Define double-entry lines: Debit Debtors, Credit Income, Credit GST
  const journalLines = [
    {
      accountId: debtorsAccount.id,
      description: `Debtors - ${invoice.customer.name} (${invoice.number})`,
      debit: totalAmount,
      credit: 0,
    },
    {
      accountId: salesIncomeAccount.id,
      description: `Sales Income - ${invoice.number}`,
      debit: 0,
      credit: subtotal,
    },
  ];

  if (taxAmount > 0) {
    journalLines.push({
      accountId: gstPayableAccount.id,
      description: `GST Payable - ${invoice.number}`,
      debit: 0,
      credit: taxAmount,
    });
  }

  // Validate double-entry balance: Debit MUST equal Credit
  const { totalDebit, totalCredit } = assertJournalBalanced(journalLines);

  // Execute atomic Prisma transaction
  const result = await prisma.$transaction(async (tx) => {
    const jeCount = await tx.journalEntry.count();
    const jeNumber = formatDocumentNumber('JE', jeCount);

    const journalEntry = await tx.journalEntry.create({
      data: {
        number: jeNumber,
        journalId: salesJournal.id,
        date: invoice.invoiceDate,
        reference: invoice.number,
        sourceType: 'INVOICE',
        sourceId: invoice.id,
        status: 'POSTED',
        totalDebit,
        totalCredit,
        createdById: userId,
        lines: {
          create: journalLines,
        },
      },
    });

    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'POSTED',
        journalEntryId: journalEntry.id,
      },
      include: {
        customer: true,
        journalEntry: { include: { lines: true } },
      },
    });

    // Update customer total sales & outstanding
    await tx.contact.update({
      where: { id: invoice.customerId },
      data: {
        totalSales: { increment: totalAmount },
        unpaidSales: { increment: totalAmount },
        outstanding: { increment: totalAmount },
      },
    });

    // Update product stockOut & currentStock for goods
    for (const item of invoice.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          salesCount: { increment: item.quantity },
          stockOut: { increment: item.quantity },
          currentStock: { decrement: item.quantity },
        },
      });
    }

    return { invoice: updatedInvoice, journalEntry };
  });

  return sendSuccess(res, result, `Invoice ${invoice.number} POSTED successfully and Journal Entry ${result.journalEntry.number} created.`);
}
