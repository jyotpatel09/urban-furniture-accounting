import { Prisma } from '@prisma/client';

export interface JournalLineInput {
  accountId: string;
  description?: string;
  debit: number | Prisma.Decimal;
  credit: number | Prisma.Decimal;
  analyticAccountId?: string | null;
}

export function assertJournalBalanced(lines: JournalLineInput[]): { totalDebit: number; totalCredit: number } {
  if (!lines || lines.length < 2) {
    throw new Error('Accounting Violation: A journal entry must contain at least 2 lines (debit & credit).');
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of lines) {
    const debit = Number(line.debit);
    const credit = Number(line.credit);

    if (isNaN(debit) || isNaN(credit) || debit < 0 || credit < 0) {
      throw new Error('Accounting Violation: Debit and credit amounts must be non-negative numbers.');
    }

    if (debit > 0 && credit > 0) {
      throw new Error('Accounting Violation: A single journal line cannot have both positive debit and credit amounts.');
    }

    totalDebit += debit;
    totalCredit += credit;
  }

  // Decimal precision check (rounded to 2 decimal places)
  const roundedDebit = Math.round(totalDebit * 100) / 100;
  const roundedCredit = Math.round(totalCredit * 100) / 100;

  if (Math.abs(roundedDebit - roundedCredit) > 0.01) {
    throw new Error(`Accounting Violation: Unbalanced Journal Entry! Total Debit (₹${roundedDebit}) does NOT equal Total Credit (₹${roundedCredit}).`);
  }

  return { totalDebit: roundedDebit, totalCredit: roundedCredit };
}

export function formatDocumentNumber(prefix: string, count: number): string {
  const padded = String(count + 1).padStart(5, '0');
  return `${prefix}-${padded}`;
}
