import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';
import { formatDocumentNumber, assertJournalBalanced } from '../../utils/accounting.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export const vendorBillItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  taxRate: z.number().nonnegative().default(18),
});

export const createVendorBillSchema = z.object({
  vendorId: z.string().min(1),
  purchaseOrderId: z.string().optional(),
  billDate: z.string().or(z.date()).optional().default(() => new Date()),
  dueDate: z.string().or(z.date()).optional().default(() => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)),
  items: z.array(vendorBillItemSchema).min(1),
});

export async function getVendorBills(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const vendorId = req.query.vendorId ? String(req.query.vendorId) : undefined;
  const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;

  const where: any = {};
  if (vendorId) where.vendorId = vendorId;
  if (status) where.status = status;

  const [total, vendorBills] = await Promise.all([
    prisma.vendorBill.count({ where }),
    prisma.vendorBill.findMany({
      where,
      skip,
      take: limit,
      include: {
        vendor: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
        payments: true,
        journalEntry: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return sendPaginated(res, vendorBills, { page, limit, total, totalPages });
}

export async function getVendorBillById(req: Request, res: Response) {
  const id = String(req.params.id);
  const bill = await prisma.vendorBill.findUnique({
    where: { id },
    include: {
      vendor: true,
      items: { include: { product: true } },
      payments: true,
      journalEntry: { include: { lines: { include: { account: true } } } },
    },
  });

  if (!bill) {
    return sendError(res, 'Vendor bill not found', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, bill);
}

export async function createVendorBill(req: AuthenticatedRequest, res: Response) {
  const { vendorId, purchaseOrderId, billDate, dueDate, items } = req.body;
  const userId = req.user!.userId;

  const vendor = await prisma.contact.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    return sendError(res, 'Vendor not found', 'NOT_FOUND', 404);
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

  const count = await prisma.vendorBill.count();
  const number = formatDocumentNumber('BILL', count);

  const bill = await prisma.vendorBill.create({
    data: {
      number,
      vendorId,
      purchaseOrderId: purchaseOrderId || null,
      billDate: new Date(billDate),
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
      vendor: true,
      items: true,
    },
  });

  return sendSuccess(res, bill, 'Vendor bill created in DRAFT state.', 201);
}

export async function postVendorBill(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  const userId = req.user!.userId;

  const bill = await prisma.vendorBill.findUnique({
    where: { id },
    include: { vendor: true, items: true },
  });

  if (!bill) {
    return sendError(res, 'Vendor bill not found', 'NOT_FOUND', 404);
  }

  if (bill.status !== 'DRAFT') {
    return sendError(res, `Vendor bill is already in ${bill.status} state.`, 'INVALID_STATUS', 400);
  }

  // Find Purchase Journal & Chart of Accounts
  const purchaseJournal = await prisma.journal.findFirst({ where: { type: 'PURCHASE', isActive: true } });
  const purchaseExpenseAccount = await prisma.account.findFirst({ where: { code: '501000' } });
  const gstPayableAccount = await prisma.account.findFirst({ where: { code: '202000' } });
  const creditorsAccount = await prisma.account.findFirst({ where: { code: '201000' } });

  if (!purchaseJournal || !purchaseExpenseAccount || !creditorsAccount) {
    return sendError(
      res,
      'Required accounting setup missing (Purchase Journal, Purchase Expense 501000, or Creditors 201000).',
      'ACCOUNTING_SETUP_MISSING',
      400
    );
  }

  const totalAmount = Number(bill.totalAmount);
  const subtotal = Number(bill.subtotal);
  const taxAmount = Number(bill.taxAmount);

  // Define double-entry lines: Debit Purchase Expense, Debit GST, Credit Creditors
  const journalLines = [
    {
      accountId: purchaseExpenseAccount.id,
      description: `Purchase Expense - ${bill.number}`,
      debit: subtotal,
      credit: 0,
    },
  ];

  if (taxAmount > 0 && gstPayableAccount) {
    journalLines.push({
      accountId: gstPayableAccount.id,
      description: `GST Input Credit - ${bill.number}`,
      debit: taxAmount,
      credit: 0,
    });
  }

  journalLines.push({
    accountId: creditorsAccount.id,
    description: `Creditors - ${bill.vendor.name} (${bill.number})`,
    debit: 0,
    credit: totalAmount,
  });

  // Validate double-entry balance: Debit MUST equal Credit
  const { totalDebit, totalCredit } = assertJournalBalanced(journalLines);

  // Execute atomic Prisma transaction
  const result = await prisma.$transaction(async (tx) => {
    const jeCount = await tx.journalEntry.count();
    const jeNumber = formatDocumentNumber('JE', jeCount);

    const journalEntry = await tx.journalEntry.create({
      data: {
        number: jeNumber,
        journalId: purchaseJournal.id,
        date: bill.billDate,
        reference: bill.number,
        sourceType: 'VENDOR_BILL',
        sourceId: bill.id,
        status: 'POSTED',
        totalDebit,
        totalCredit,
        createdById: userId,
        lines: {
          create: journalLines,
        },
      },
    });

    const updatedBill = await tx.vendorBill.update({
      where: { id: bill.id },
      data: {
        status: 'POSTED',
        journalEntryId: journalEntry.id,
      },
      include: {
        vendor: true,
        journalEntry: { include: { lines: true } },
      },
    });

    // Update vendor total purchases & outstanding
    await tx.contact.update({
      where: { id: bill.vendorId },
      data: {
        totalPurchases: { increment: totalAmount },
        unpaidPurchases: { increment: totalAmount },
        outstanding: { increment: totalAmount },
      },
    });

    return { vendorBill: updatedBill, journalEntry };
  });

  return sendSuccess(res, result, `Vendor bill ${bill.number} POSTED successfully and Journal Entry ${result.journalEntry.number} created.`);
}
