import { assertJournalBalanced } from '../src/utils/accounting.js';

async function runTests() {
  console.log('🧪 Running Urban Furniture Accounting Engine Integrity Tests...');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      failed++;
    }
  }

  // Test 1: Balanced Entry
  try {
    const lines = [
      { accountId: 'ACC-103000', debit: 29500, credit: 0 },
      { accountId: 'ACC-401000', debit: 0, credit: 25000 },
      { accountId: 'ACC-202000', debit: 0, credit: 4500 },
    ];
    const res = assertJournalBalanced(lines);
    assert(res.totalDebit === 29500 && res.totalCredit === 29500, 'Balanced Journal Entry (Debit 29,500 == Credit 29,500)');
  } catch (err: any) {
    assert(false, `Balanced Journal Entry failed: ${err.message}`);
  }

  // Test 2: Unbalanced Entry Rejection
  try {
    const lines = [
      { accountId: 'ACC-103000', debit: 30000, credit: 0 },
      { accountId: 'ACC-401000', debit: 0, credit: 25000 },
    ];
    assertJournalBalanced(lines);
    assert(false, 'Unbalanced Journal Entry Rejection (Should throw)');
  } catch (err: any) {
    assert(err.message.includes('Unbalanced Journal Entry'), 'Unbalanced Journal Entry Rejection (Correctly threw violation)');
  }

  // Test 3: Less than 2 lines
  try {
    const lines = [{ accountId: 'ACC-103000', debit: 29500, credit: 0 }];
    assertJournalBalanced(lines);
    assert(false, 'Minimum 2 Lines Check (Should throw)');
  } catch (err: any) {
    assert(err.message.includes('at least 2 lines'), 'Minimum 2 Lines Check (Correctly threw violation)');
  }

  // Test 4: Negative amounts rejection
  try {
    const lines = [
      { accountId: 'ACC-103000', debit: -100, credit: 0 },
      { accountId: 'ACC-401000', debit: 0, credit: -100 },
    ];
    assertJournalBalanced(lines);
    assert(false, 'Negative Amounts Rejection (Should throw)');
  } catch (err: any) {
    assert(err.message.includes('non-negative'), 'Negative Amounts Rejection (Correctly threw violation)');
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
