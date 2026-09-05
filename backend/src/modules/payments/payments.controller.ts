import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';
import { formatDocumentNumber, assertJournalBalanced } from '../../utils/accounting.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export const createPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['CASH', 'BANK']).default('BANK'),
  invoiceId: z.string().optional(),
  vendorBillId: z.string().optional(),
  cashOrBankAccountId: z.string().optional(),
  reference: z.string().optional(),
  paymentDate: z.string().or(z.date()).optional().default(() => new Date()),
});

export async function getPayments(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const invoiceId = req.query.invoiceId ? String(req.query.invoiceId) : undefined;
  const vendorBillId = req.query.vendorBillId ? String(req.query.vendorBillId) : undefined;

  const where: any = {};
  if (invoiceId) where.invoiceId = invoiceId;
  if (vendorBillId) where.vendorBillId = vendorBillId;

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: { select: { id: true, name: true } },
        invoice: { select: { id: true, number: true, totalAmount: true } },
        vendorBill: { select: { id: true, number: true, totalAmount: true } },
        journalEntry: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return sendPaginated(res, payments, { page, limit, total, totalPages });
}

export async function createPayment(req: AuthenticatedRequest, res: Response) {
  const { amount, method, invoiceId, vendorBillId, cashOrBankAccountId, reference, paymentDate } = req.body;
  const userId = req.user!.userId;

  if (!invoiceId && !vendorBillId) {
    return sendError(res, 'Payment must reference either an Invoice or a Vendor Bill.', 'MISSING_DOCUMENT', 400);
  }

  // 1. CUSTOMER PAYMENT WORKFLOW
  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      return sendError(res, 'Customer invoice not found.', 'NOT_FOUND', 404);
    }

    if (invoice.status === 'DRAFT' || invoice.status === 'CANCELLED') {
      return sendError(res, 'Cannot register payment on DRAFT or CANCELLED invoice.', 'INVALID_STATUS', 400);
    }

    const remaining = Number(invoice.remainingAmount);
    if (amount > remaining + 0.01) {
      return sendError(
        res,
        `Payment amount (₹${amount}) exceeds remaining invoice balance (₹${remaining}).`,
        'OVERPAYMENT_REJECTED',
        400
      );
    }

    // Determine Cash/Bank Journal and Accounts
    const bankJournal = await prisma.journal.findFirst({
      where: { type: method === 'CASH' ? 'CASH' : 'BANK', isActive: true },
    });
    const cashOrBankAccount = cashOrBankAccountId
      ? await prisma.account.findUnique({ where: { id: cashOrBankAccountId } })
      : await prisma.account.findFirst({ where: { code: method === 'CASH' ? '101000' : '102000' } });
    const debtorsAccount = await prisma.account.findFirst({ where: { code: '103000' } });

    if (!bankJournal || !cashOrBankAccount || !debtorsAccount) {
      return sendError(res, 'Required Bank/Cash or Debtors accounting setup missing.', 'ACCOUNTING_SETUP_MISSING', 400);
    }

    const journalLines = [
      {
        accountId: cashOrBankAccount.id,
        description: `Customer Payment Received - ${invoice.customer.name} (${invoice.number})`,
        debit: amount,
        credit: 0,
      },
      {
        accountId: debtorsAccount.id,
        description: `A/R Settlement - ${invoice.number}`,
        debit: 0,
        credit: amount,
      },
    ];

    const { totalDebit, totalCredit } = assertJournalBalanced(journalLines);

    const result = await prisma.$transaction(async (tx) => {
      const payCount = await tx.payment.count();
      const payNumber = formatDocumentNumber('PAY-C', payCount);

      const jeCount = await tx.journalEntry.count();
      const jeNumber = formatDocumentNumber('JE', jeCount);

      const journalEntry = await tx.journalEntry.create({
        data: {
          number: jeNumber,
          journalId: bankJournal.id,
          date: new Date(paymentDate),
          reference: reference || invoice.number,
          sourceType: 'PAYMENT',
          status: 'POSTED',
          totalDebit,
          totalCredit,
          createdById: userId,
          lines: { create: journalLines },
        },
      });

      const payment = await tx.payment.create({
        data: {
          number: payNumber,
          paymentDate: new Date(paymentDate),
          amount,
          method,
          cashOrBankAccountId: cashOrBankAccount.id,
          customerId: invoice.customerId,
          invoiceId: invoice.id,
          status: 'POSTED',
          journalEntryId: journalEntry.id,
          reference: reference || `Payment for ${invoice.number}`,
          createdById: userId,
        },
      });

      const newPaid = Number(invoice.paidAmount) + amount;
      const newRemaining = Math.max(0, Number(invoice.totalAmount) - newPaid);
      const newStatus = newRemaining === 0 ? 'PAID' : 'PARTIALLY_PAID';

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
        },
      });

      await tx.contact.update({
        where: { id: invoice.customerId },
        data: {
          paidSales: { increment: amount },
          unpaidSales: { decrement: amount },
          outstanding: { decrement: amount },
        },
      });

      return { payment, invoice: updatedInvoice, journalEntry };
    });

    return sendSuccess(res, result, `Customer payment of ₹${amount} registered successfully for invoice ${invoice.number}.`, 201);
  }

  // 2. VENDOR PAYMENT WORKFLOW
  if (vendorBillId) {
    const bill = await prisma.vendorBill.findUnique({
      where: { id: vendorBillId },
      include: { vendor: true },
    });

    if (!bill) {
      return sendError(res, 'Vendor bill not found.', 'NOT_FOUND', 404);
    }

    if (bill.status === 'DRAFT' || bill.status === 'CANCELLED') {
      return sendError(res, 'Cannot register payment on DRAFT or CANCELLED bill.', 'INVALID_STATUS', 400);
    }

    const remaining = Number(bill.remainingAmount);
    if (amount > remaining + 0.01) {
      return sendError(
        res,
        `Payment amount (₹${amount}) exceeds remaining bill balance (₹${remaining}).`,
        'OVERPAYMENT_REJECTED',
        400
      );
    }

    const bankJournal = await prisma.journal.findFirst({
      where: { type: method === 'CASH' ? 'CASH' : 'BANK', isActive: true },
    });
    const cashOrBankAccount = cashOrBankAccountId
      ? await prisma.account.findUnique({ where: { id: cashOrBankAccountId } })
      : await prisma.account.findFirst({ where: { code: method === 'CASH' ? '101000' : '102000' } });
    const creditorsAccount = await prisma.account.findFirst({ where: { code: '201000' } });

    if (!bankJournal || !cashOrBankAccount || !creditorsAccount) {
      return sendError(res, 'Required Bank/Cash or Creditors accounting setup missing.', 'ACCOUNTING_SETUP_MISSING', 400);
    }

    const journalLines = [
      {
        accountId: creditorsAccount.id,
        description: `A/P Settlement - ${bill.vendor.name} (${bill.number})`,
        debit: amount,
        credit: 0,
      },
      {
        accountId: cashOrBankAccount.id,
        description: `Vendor Disbursement - ${bill.number}`,
        debit: 0,
        credit: amount,
      },
    ];

    const { totalDebit, totalCredit } = assertJournalBalanced(journalLines);

    const result = await prisma.$transaction(async (tx) => {
      const payCount = await tx.payment.count();
      const payNumber = formatDocumentNumber('PAY-V', payCount);

      const jeCount = await tx.journalEntry.count();
      const jeNumber = formatDocumentNumber('JE', jeCount);

      const journalEntry = await tx.journalEntry.create({
        data: {
          number: jeNumber,
          journalId: bankJournal.id,
          date: new Date(paymentDate),
          reference: reference || bill.number,
          sourceType: 'PAYMENT',
          status: 'POSTED',
          totalDebit,
          totalCredit,
          createdById: userId,
          lines: { create: journalLines },
        },
      });

      const payment = await tx.payment.create({
        data: {
          number: payNumber,
          paymentDate: new Date(paymentDate),
          amount,
          method,
          cashOrBankAccountId: cashOrBankAccount.id,
          vendorId: bill.vendorId,
          vendorBillId: bill.id,
          status: 'POSTED',
          journalEntryId: journalEntry.id,
          reference: reference || `Payment for ${bill.number}`,
          createdById: userId,
        },
      });

      const newPaid = Number(bill.paidAmount) + amount;
      const newRemaining = Math.max(0, Number(bill.totalAmount) - newPaid);
      const newStatus = newRemaining === 0 ? 'PAID' : 'PARTIALLY_PAID';

      const updatedBill = await tx.vendorBill.update({
        where: { id: bill.id },
        data: {
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
        },
      });

      await tx.contact.update({
        where: { id: bill.vendorId },
        data: {
          paidPurchases: { increment: amount },
          unpaidPurchases: { decrement: amount },
          outstanding: { decrement: amount },
        },
      });

      return { payment, vendorBill: updatedBill, journalEntry };
    });

    return sendSuccess(res, result, `Vendor payment of ₹${amount} registered successfully for bill ${bill.number}.`, 201);
  }
}
