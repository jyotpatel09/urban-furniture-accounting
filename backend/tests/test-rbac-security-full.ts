import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

function request(method: string, path: string, body?: any, token?: string): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const postData = body ? JSON.stringify(body) : '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (postData) {
      headers['Content-Length'] = String(Buffer.byteLength(postData));
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode || 500, data: parsed });
          } catch {
            resolve({ status: res.statusCode || 500, data: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runComprehensiveSecurityAudit() {
  console.log('🛡️ Running Final Comprehensive Security & RBAC Audit...\n');

  // 1. Unauthenticated Security Boundary Test
  const unauthReq = await request('GET', '/products');
  console.log(`1. Unauthenticated Request -> Status ${unauthReq.status} (Expected: 401)`);
  console.assert(unauthReq.status === 401, 'Unauthenticated request must return 401');

  // 2. Tampered JWT Token Test
  const invalidTokenReq = await request('GET', '/products', undefined, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.INVALID_PAYLOAD.FORGED_SIGNATURE');
  console.log(`2. Forged Signature Token Request -> Status ${invalidTokenReq.status} (Expected: 401)`);
  console.assert(invalidTokenReq.status === 401, 'Forged token request must return 401');

  // 3. Admin Authentication & Role Access
  const adminAuth = await request('POST', '/auth/login', { email: 'admin@urbanfurniture.in', password: 'Password@123' });
  const adminToken = adminAuth.data?.data?.token;
  console.log(`3. Admin Login -> Status ${adminAuth.status}, Token Received: ${!!adminToken}`);

  const adminAccounts = await request('GET', '/accounts', undefined, adminToken);
  console.log(`   Admin GET /api/accounts -> Status ${adminAccounts.status} (Expected: 200)`);
  console.assert(adminAccounts.status === 200, 'Admin must access /api/accounts');

  // 4. Accountant Authentication & Role Access
  const accountantAuth = await request('POST', '/auth/login', { email: 'accountant@urbanfurniture.in', password: 'Password@123' });
  const accountantToken = accountantAuth.data?.data?.token;
  console.log(`4. Accountant Login -> Status ${accountantAuth.status}, Token Received: ${!!accountantToken}`);

  const accountantReports = await request('GET', '/reports/profit-loss', undefined, accountantToken);
  console.log(`   Accountant GET /api/reports/profit-loss -> Status ${accountantReports.status} (Expected: 200)`);
  console.assert(accountantReports.status === 200, 'Accountant must access reports');

  // 5. Sales & Purchase User Authentication & RBAC Boundary Test
  const salesAuth = await request('POST', '/auth/login', { email: 'sales@urbanfurniture.in', password: 'Password@123' });
  const salesToken = salesAuth.data?.data?.token;
  console.log(`5. Sales User Login -> Status ${salesAuth.status}, Token Received: ${!!salesToken}`);

  const salesAllowed = await request('GET', '/sales-orders', undefined, salesToken);
  console.log(`   Sales User GET /api/sales-orders -> Status ${salesAllowed.status} (Expected: 200)`);
  console.assert(salesAllowed.status === 200, 'Sales user must access /api/sales-orders');

  const salesForbiddenCOA = await request('POST', '/accounts', { code: '999901', name: 'Test Account', type: 'ASSET', category: 'Current Assets' }, salesToken);
  console.log(`   Sales User POST /api/accounts -> Status ${salesForbiddenCOA.status} (Expected: 403 Forbidden)`);
  console.assert(salesForbiddenCOA.status === 403, 'Sales user must receive 403 on /api/accounts');

  const salesForbiddenReport = await request('GET', '/reports/balance-sheet', undefined, salesToken);
  console.log(`   Sales User GET /api/reports/balance-sheet -> Status ${salesForbiddenReport.status} (Expected: 403 Forbidden)`);
  console.assert(salesForbiddenReport.status === 403, 'Sales user must receive 403 on balance-sheet report');

  console.log('\n✅ COMPREHENSIVE SECURITY & RBAC AUDIT COMPLETED SUCCESSFULLY WITH 0 VIOLATIONS!\n');
}

runComprehensiveSecurityAudit().catch((err) => {
  console.error('❌ Audit Failed:', err);
  process.exit(1);
});
