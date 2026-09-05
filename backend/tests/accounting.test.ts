import { assertJournalBalanced } from '../src/utils/accounting.js';

describe('Double-Entry Accounting Engine Integrity Tests', () => {
  test('Should accept a perfectly balanced double-entry journal entry', () => {
    const lines = [
      { accountId: 'ACC-103000', debit: 29500, credit: 0 },
      { accountId: 'ACC-401000', debit: 0, credit: 25000 },
      { accountId: 'ACC-202000', debit: 0, credit: 4500 },
    ];

    const result = assertJournalBalanced(lines);
    expect(result.totalDebit).toBe(29500);
    expect(result.totalCredit).toBe(29500);
  });

  test('Should reject an unbalanced journal entry where Total Debit != Total Credit', () => {
    const lines = [
      { accountId: 'ACC-103000', debit: 30000, credit: 0 },
      { accountId: 'ACC-401000', debit: 0, credit: 25000 },
    ];

    expect(() => assertJournalBalanced(lines)).toThrow(/Unbalanced Journal Entry/);
  });

  test('Should reject journal entry with less than 2 lines', () => {
    const lines = [{ accountId: 'ACC-103000', debit: 29500, credit: 0 }];

    expect(() => assertJournalBalanced(lines)).toThrow(/contain at least 2 lines/);
  });

  test('Should reject negative debit or credit amounts', () => {
    const lines = [
      { accountId: 'ACC-103000', debit: -100, credit: 0 },
      { accountId: 'ACC-401000', debit: 0, credit: -100 },
    ];

    expect(() => assertJournalBalanced(lines)).toThrow(/non-negative/);
  });

  test('Should reject a line having both positive debit and credit', () => {
    const lines = [
      { accountId: 'ACC-103000', debit: 500, credit: 500 },
      { accountId: 'ACC-401000', debit: 0, credit: 500 },
    ];

    expect(() => assertJournalBalanced(lines)).toThrow(/cannot have both positive debit and credit/);
  });
});
