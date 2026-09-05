import { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../utils/response.js';

export async function getDashboardSummary(req: Request, res: Response) {
  // 1. Total Sales (POSTED Invoices)
  const invoices = await prisma.invoice.findMany({
    where: { status: { in: ['POSTED', 'PARTIALLY_PAID', 'PAID'] } },
    select: { totalAmount: true, remainingAmount: true },
  });

  let totalSales = 0;
  let receivables = 0;

  for (const inv of invoices) {
    totalSales += Number(inv.totalAmount);
    receivables += Number(inv.remainingAmount);
  }

  // 2. Total Purchases (POSTED Vendor Bills)
  const bills = await prisma.vendorBill.findMany({
    where: { status: { in: ['POSTED', 'PARTIALLY_PAID', 'PAID'] } },
    select: { totalAmount: true, remainingAmount: true },
  });

  let totalPurchases = 0;
  let payables = 0;

  for (const bill of bills) {
    totalPurchases += Number(bill.totalAmount);
    payables += Number(bill.remainingAmount);
  }

  // 3. Net Profit (INCOME - EXPENSE lines from POSTED journal entries)
  const journalLines = await prisma.journalEntryLine.findMany({
    where: {
      journalEntry: { status: 'POSTED' },
      account: { type: { in: ['INCOME', 'EXPENSE'] } },
    },
    select: { debit: true, credit: true, account: { select: { type: true } } },
  });

  let income = 0;
  let expenses = 0;

  for (const line of journalLines) {
    if (line.account.type === 'INCOME') {
      income += Number(line.credit) - Number(line.debit);
    } else if (line.account.type === 'EXPENSE') {
      expenses += Number(line.debit) - Number(line.credit);
    }
  }

  const netProfit = income - expenses;

  // 4. Cash & Bank Balances (101000 & 102000)
  const cashAccounts = await prisma.account.findMany({
    where: { code: { in: ['101000', '102000'] } },
    include: {
      journalLines: {
        where: { journalEntry: { status: 'POSTED' } },
      },
    },
  });

  let cashAndBank = 0;
  for (const acc of cashAccounts) {
    for (const line of acc.journalLines) {
      cashAndBank += Number(line.debit) - Number(line.credit);
    }
  }

  // 5. Recent Activity
  const recentInvoices = await prisma.invoice.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { name: true } } },
  });

  const recentActivity = recentInvoices.map((inv) => ({
    id: inv.id,
    type: 'INVOICE',
    title: `Invoice ${inv.number}`,
    subtitle: inv.customer.name,
    amount: `₹${Number(inv.totalAmount).toLocaleString('en-IN')}`,
    status: inv.status,
    date: inv.invoiceDate,
  }));

  return sendSuccess(res, {
    totalSales,
    totalPurchases,
    receivables,
    payables,
    netProfit,
    cashAndBank,
    recentActivity,
  });
}
