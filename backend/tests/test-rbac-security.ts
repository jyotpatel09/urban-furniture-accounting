import { generateToken, verifyToken } from '../src/utils/jwt.js';
import { assertJournalBalanced } from '../src/utils/accounting.js';

console.log('🔒 Starting Urban Furniture ERP RBAC Security & Data Permission Audit...\n');

let passCount = 0;
let failCount = 0;

function logResult(testName: string, passed: boolean, details: string) {
  if (passed) {
    console.log(`  ✅ PASS: ${testName} -> ${details}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} -> ${details}`);
    failCount++;
  }
}

// 1. AUTHENTICATION & ROLE ORIGIN TEST
try {
  const token = generateToken({
    userId: 'usr-admin-001',
    email: 'admin@urbanfurniture.in',
    role: 'ADMIN',
  });

  const decoded = verifyToken(token);
  const isSecure = decoded.role === 'ADMIN' && decoded.userId === 'usr-admin-001';
  logResult('Authentication & Cryptographic Role Signing', isSecure, 'JWT payload cryptographically signed with server secret');
} catch (e: any) {
  logResult('Authentication & Cryptographic Role Signing', false, e.message);
}

// 2. ROLE TAMPERING TEST
try {
  const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3Itc2FsZXMtMDAxIiwiZW1haWwiOiJzYWxlc0B1cmJhbmZ1cm5pdHVyZS5pbiIsInJvbGUiOiJBRE1JTiJ9.INVALID_SIGNATURE';
  let tamperBlocked = false;
  try {
    verifyToken(forgedToken);
  } catch (e) {
    tamperBlocked = true;
  }
  logResult('Role Tampering & Forged Signature Rejection', tamperBlocked, 'Server rejected tampered JWT token signature');
} catch (e: any) {
  logResult('Role Tampering & Forged Signature Rejection', false, e.message);
}

// 3. ACCOUNTING DOUBLE-ENTRY INTEGRITY TEST
try {
  let unbalancedBlocked = false;
  try {
    assertJournalBalanced([
      { accountId: 'acc-1', debit: 1000, credit: 0 },
      { accountId: 'acc-2', debit: 0, credit: 800 }
    ]);
  } catch (e: any) {
    unbalancedBlocked = e.message.toLowerCase().includes('unbalanced');
  }
  logResult('Double-Entry Accounting Rejection (Total Debit != Total Credit)', unbalancedBlocked, 'Accounting engine rejected Debit 1,000 != Credit 800');
} catch (e: any) {
  logResult('Double-Entry Accounting Rejection', false, e.message);
}

console.log(`\n📊 Audit Execution Complete: ${passCount} passed, ${failCount} failed.`);
